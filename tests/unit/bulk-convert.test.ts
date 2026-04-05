/**
 * Bulk conversion tests — the most important suite for a batch service.
 *
 * Two layers exercised:
 *   1. Direct: many parallel calls to renderEmailToPdfBuffer().
 *      Verifies the PDF generator is safe under concurrency and produces
 *      N valid, independent PDF buffers.
 *   2. Route: a single /api/convert request with N .msg files.
 *      Verifies the route packages everything into one ZIP correctly.
 *
 * The parser is mocked so these tests need no binary .MSG fixtures —
 * bulk throughput is what we're measuring, not parser fidelity.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import JSZip from "jszip";
import { renderEmailToPdfBuffer } from "@/lib/pdf-generator";
import {
  syntheticMessage,
  syntheticImageAttachment,
  syntheticMsgFile,
  isValidPdfBuffer,
} from "../helpers/synthetic";

// Mock next/headers for route tests
vi.mock("next/headers", () => {
  const fakeCookies = new Map<string, string>();
  return {
    cookies: vi.fn(async () => ({
      get: (name: string) => {
        const value = fakeCookies.get(name);
        return value ? { name, value } : undefined;
      },
      set: (name: string, value: string) => {
        fakeCookies.set(name, value);
      },
      getAll: () => Array.from(fakeCookies.entries()).map(([name, value]) => ({ name, value })),
    })),
  };
});

// Mock Supabase and usage for route tests
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } })),
  createServiceClient: vi.fn(async () => ({ from: vi.fn(() => ({})) })),
}));

vi.mock("@/lib/usage.ts", () => ({
  getUserContext: vi.fn(async () => ({ userId: null, email: null, plan: "guest" })),
  getUsageSummary: vi.fn(async () => ({ plan: "guest", used: 0, limit: 3, remaining: 3, approaching: false, exceeded: false })),
  checkCanConvert: vi.fn(async () => ({ ok: true })),
  incrementGuestUsage: vi.fn(async () => {}),
}));

vi.mock("@/lib/msg-parser", async () => {
  const helpers = await import("../helpers/synthetic");
  return {
    parseMsg: vi.fn((_buf: ArrayBuffer) =>
      helpers.syntheticMessage({
        subject: `Bulk test message ${Math.random().toString(36).slice(2, 7)}`,
      }),
    ),
  };
});

import { POST } from "@/app/api/convert/route";
import { parseMsg } from "@/lib/msg-parser";

const mockedParseMsg = vi.mocked(parseMsg);

beforeEach(() => {
  mockedParseMsg.mockClear();
});

const BULK_COUNT = 25;

describe("bulk conversion — direct renderer layer", () => {
  it(`renders ${BULK_COUNT} PDFs in parallel, all valid and unique`, async () => {
    const messages = Array.from({ length: BULK_COUNT }, (_, i) =>
      syntheticMessage({
        subject: `Report #${i + 1}`,
        bodyText: `This is bulk email number ${i + 1}.\n\n${"x ".repeat(200)}`,
      }),
    );

    const t0 = performance.now();
    const pdfs = await Promise.all(
      messages.map((m) =>
        renderEmailToPdfBuffer(m, {
          includeHeaders: true,
          embedAttachments: false,
        }),
      ),
    );
    const elapsed = performance.now() - t0;

    // Sanity — every result is an independent, valid PDF
    expect(pdfs).toHaveLength(BULK_COUNT);
    for (const pdf of pdfs) {
      expect(isValidPdfBuffer(pdf)).toBe(true);
      expect(pdf.length).toBeGreaterThan(500);
    }

    // No two buffers share a reference (catches accidental caching bugs)
    const unique = new Set(pdfs.map((b) => b));
    expect(unique.size).toBe(BULK_COUNT);

    // eslint-disable-next-line no-console
    console.log(
      `[bulk] rendered ${BULK_COUNT} PDFs in ${elapsed.toFixed(0)} ms ` +
        `(avg ${(elapsed / BULK_COUNT).toFixed(0)} ms/file)`,
    );
  });

  it("handles a mix of plain, long, and image-heavy messages concurrently", async () => {
    const jobs = [
      syntheticMessage(),
      syntheticMessage({ bodyText: "line\n".repeat(500) }),
      syntheticMessage({
        attachments: [
          syntheticImageAttachment("a.png"),
          syntheticImageAttachment("b.png"),
          syntheticImageAttachment("c.png"),
        ],
      }),
      syntheticMessage({ bodyText: "" }),
      syntheticMessage({ subject: "", bodyText: "Just a body, no subject." }),
    ];

    const pdfs = await Promise.all(
      jobs.map((m) =>
        renderEmailToPdfBuffer(m, {
          includeHeaders: true,
          embedAttachments: true,
        }),
      ),
    );

    for (const pdf of pdfs) expect(isValidPdfBuffer(pdf)).toBe(true);
  });

  it("does not leak state between renders (header toggle isolation)", async () => {
    // Render the same message twice with different options concurrently;
    // the two outputs should differ in size because headers are big.
    const message = syntheticMessage();
    const [withHeaders, withoutHeaders] = await Promise.all([
      renderEmailToPdfBuffer(message, {
        includeHeaders: true,
        embedAttachments: false,
      }),
      renderEmailToPdfBuffer(message, {
        includeHeaders: false,
        embedAttachments: false,
      }),
    ]);

    expect(isValidPdfBuffer(withHeaders)).toBe(true);
    expect(isValidPdfBuffer(withoutHeaders)).toBe(true);
    expect(withHeaders.length).not.toBe(withoutHeaders.length);
  });
});

describe("bulk conversion — /api/convert route layer", () => {
  it(`packages ${BULK_COUNT} files into a single ZIP in one request`, async () => {
    const files = Array.from({ length: BULK_COUNT }, (_, i) =>
      syntheticMsgFile(`bulk-${String(i + 1).padStart(2, "0")}.msg`),
    );

    const fd = new FormData();
    for (const f of files) fd.append("files", f, f.name);
    fd.append(
      "options",
      JSON.stringify({
        includeHeaders: true,
        embedAttachments: true,
        attachmentsZip: false,
      }),
    );

    const t0 = performance.now();
    const res = await POST(
      new Request("http://localhost/api/convert", {
        method: "POST",
        body: fd,
      }),
    );
    const elapsed = performance.now() - t0;

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/zip");

    const zip = await JSZip.loadAsync(await res.arrayBuffer());
    const pdfEntries = Object.keys(zip.files).filter((n) => n.endsWith(".pdf"));
    expect(pdfEntries).toHaveLength(BULK_COUNT);

    // Every PDF in the bundle is individually valid
    for (const name of pdfEntries) {
      const bytes = await zip.files[name].async("uint8array");
      expect(isValidPdfBuffer(bytes)).toBe(true);
    }

    // Parser invoked exactly once per file — no duplicates, no leaks
    expect(mockedParseMsg).toHaveBeenCalledTimes(BULK_COUNT);

    // eslint-disable-next-line no-console
    console.log(
      `[bulk:route] ${BULK_COUNT} files → ZIP in ${elapsed.toFixed(0)} ms ` +
        `(avg ${(elapsed / BULK_COUNT).toFixed(0)} ms/file)`,
    );
  });

  it("continues rejecting the batch if any single file is invalid", async () => {
    const files = [
      syntheticMsgFile("ok-1.msg"),
      syntheticMsgFile("ok-2.msg"),
      new File([new Uint8Array([1, 2])], "nope.txt"),
      syntheticMsgFile("ok-3.msg"),
    ];

    const fd = new FormData();
    for (const f of files) fd.append("files", f, f.name);
    fd.append(
      "options",
      JSON.stringify({
        includeHeaders: true,
        embedAttachments: false,
        attachmentsZip: false,
      }),
    );

    const res = await POST(
      new Request("http://localhost/api/convert", {
        method: "POST",
        body: fd,
      }),
    );
    expect(res.status).toBe(400);
    expect(mockedParseMsg).not.toHaveBeenCalled(); // fail-fast before any work
  });
});
