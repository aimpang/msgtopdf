import { NextResponse } from "next/server";
import JSZip from "jszip";
import { parseMsg, type ParsedMessage } from "@/lib/msg-parser";
import { renderEmailToPdfBuffer } from "@/lib/pdf-generator";
import { createServiceClient } from "@/lib/supabase/server";
import {
  getUserContext,
  checkCanConvert,
  incrementGuestUsage,
} from "@/lib/usage";
import { getLimits, isPaidPlan } from "@/lib/plans";

// @react-pdf/renderer requires the Node runtime.
export const runtime = "nodejs";
// Keep this route dynamic — it always processes fresh uploads.
export const dynamic = "force-dynamic";
// Allow up to 60s on Vercel Pro; Hobby tier caps at 10s.
export const maxDuration = 60;

const MAX_FILES_PER_REQUEST = 25;

interface ConvertOptions {
  includeHeaders: boolean;
  embedAttachments: boolean;
  attachmentsZip: boolean;
}

const DEFAULT_OPTIONS: ConvertOptions = {
  includeHeaders: true,
  embedAttachments: true,
  attachmentsZip: false,
};

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "_").trim() || "email";
}

function parseOptions(raw: FormDataEntryValue | null): ConvertOptions {
  if (typeof raw !== "string") return DEFAULT_OPTIONS;
  try {
    const parsed = JSON.parse(raw) as Partial<ConvertOptions>;
    return {
      includeHeaders: parsed.includeHeaders ?? DEFAULT_OPTIONS.includeHeaders,
      embedAttachments:
        parsed.embedAttachments ?? DEFAULT_OPTIONS.embedAttachments,
      attachmentsZip: parsed.attachmentsZip ?? DEFAULT_OPTIONS.attachmentsZip,
    };
  } catch {
    return DEFAULT_OPTIONS;
  }
}

export async function POST(request: Request) {
  // ── 1. Identify caller + fetch plan ───────────────────────────────────
  const ctx = await getUserContext();
  const limits = getLimits(ctx.plan);

  // ── 2. Parse upload ──────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid upload payload." },
      { status: 400 },
    );
  }

  const options = parseOptions(formData.get("options"));
  const entries = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File);

  if (entries.length === 0) {
    return NextResponse.json(
      { error: "No files were uploaded." },
      { status: 400 },
    );
  }
  if (entries.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Too many files. Max ${MAX_FILES_PER_REQUEST} per request.` },
      { status: 400 },
    );
  }

  // Extension check first (cheap + doesn't leak plan internals).
  for (const file of entries) {
    if (!file.name.toLowerCase().endsWith(".msg")) {
      return NextResponse.json(
        { error: `Not a .MSG file: ${file.name}` },
        { status: 400 },
      );
    }
  }

  // ── 3. Enforce plan limits (file size + monthly cap) ─────────────────
  const canConvert = await checkCanConvert(ctx, entries);
  if (!canConvert.ok) {
    return NextResponse.json(
      {
        error: canConvert.reason,
        code: canConvert.code,
        plan: ctx.plan,
        upgradeUrl: "/pricing",
      },
      { status: canConvert.code === "MONTHLY_LIMIT" ? 402 : 413 },
    );
  }

  // ── 4. Convert ───────────────────────────────────────────────────────
  interface ConvertedItem {
    sourceName: string;
    baseName: string;
    pdf: Buffer;
    originalSize: number;
    message: ParsedMessage;
  }

  const converted: ConvertedItem[] = [];

  try {
    for (const file of entries) {
      const arrayBuffer = await file.arrayBuffer();
      const message = parseMsg(arrayBuffer);
      const pdfBuffer = await renderEmailToPdfBuffer(message, {
        includeHeaders: options.includeHeaders,
        embedAttachments: options.embedAttachments,
      });
      const baseName = sanitizeFilename(file.name.replace(/\.msg$/i, ""));
      converted.push({
        sourceName: file.name,
        baseName,
        pdf: pdfBuffer,
        originalSize: file.size,
        message,
      });
    }
  } catch (err) {
    console.error("Conversion error:", err);
    // Record the failure so dashboards show it (only for logged-in users).
    if (ctx.userId) {
      const admin = createServiceClient();
      await admin.from("conversions").insert({
        user_id: ctx.userId,
        source_filename: entries[0]?.name ?? "unknown.msg",
        output_filename: "",
        file_size_bytes: entries[0]?.size ?? 0,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Failed to convert: ${err.message}`
            : "Failed to convert the provided file(s).",
      },
      { status: 500 },
    );
  }

  // ── 5. Record history (+ archive blob for Pro users) ─────────────────
  if (ctx.userId) {
    const admin = createServiceClient();
    const archive = isPaidPlan(ctx.plan);

    await Promise.all(
      converted.map(async (item) => {
        let storagePath: string | null = null;
        if (archive) {
          const path = `${ctx.userId}/${crypto.randomUUID()}.pdf`;
          const { error: uploadErr } = await admin.storage
            .from("conversions")
            .upload(path, item.pdf, {
              contentType: "application/pdf",
              upsert: false,
            });
          if (!uploadErr) storagePath = path;
        }

        await admin.from("conversions").insert({
          user_id: ctx.userId,
          source_filename: item.sourceName,
          output_filename: `${item.baseName}.pdf`,
          file_size_bytes: item.originalSize,
          pdf_size_bytes: item.pdf.length,
          status: "completed",
          storage_path: storagePath,
        });
      }),
    );
  } else {
    // Guests get a cookie counter so the 3-per-session ceiling actually bites.
    await incrementGuestUsage(converted.length);
  }

  // ── 6. Respond (single PDF, or ZIP for multi / attachmentsZip) ───────
  const singleFile = converted.length === 1;
  const needsZip = !singleFile || options.attachmentsZip;

  if (!needsZip) {
    const item = converted[0];
    const body = new Uint8Array(item.pdf);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${item.baseName}.pdf"`,
        "Cache-Control": "no-store",
        "X-App-Plan": ctx.plan,
      },
    });
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();
  const uniqueName = (name: string) => {
    let candidate = name;
    let i = 2;
    while (usedNames.has(candidate)) {
      const dot = name.lastIndexOf(".");
      candidate =
        dot > 0
          ? `${name.slice(0, dot)} (${i})${name.slice(dot)}`
          : `${name} (${i})`;
      i++;
    }
    usedNames.add(candidate);
    return candidate;
  };

  for (const item of converted) {
    const pdfName = uniqueName(`${item.baseName}.pdf`);
    zip.file(pdfName, item.pdf);

    if (options.attachmentsZip && item.message.attachments.length > 0) {
      const folder = zip.folder(`${item.baseName} — attachments`);
      if (folder) {
        for (const att of item.message.attachments) {
          folder.file(sanitizeFilename(att.fileName), att.content);
        }
      }
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "uint8array" });
  const zipName =
    singleFile && options.attachmentsZip
      ? `${converted[0].baseName}.zip`
      : "msg-to-pdf-export.zip";

  return new NextResponse(Buffer.from(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
      "Cache-Control": "no-store",
      "X-App-Plan": ctx.plan,
    },
  });
}
