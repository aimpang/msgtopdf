import MsgReader from "@kenjiuno/msgreader";
import { htmlToText } from "html-to-text";

export interface ParsedAttachment {
  fileName: string;
  contentType?: string;
  content: Uint8Array;
  isImage: boolean;
}

export interface ParsedMessage {
  subject: string;
  from: string;
  to: string;
  cc: string;
  date: string;
  bodyText: string;
  attachments: ParsedAttachment[];
}

const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "bmp", "webp"]);

function extToContentType(ext: string): string | undefined {
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "webp":
      return "image/webp";
    default:
      return undefined;
  }
}

function joinRecipients(
  recipients: Array<{ name?: string; email?: string; recipType?: string }> | undefined,
  type: "to" | "cc",
): string {
  if (!recipients) return "";
  return recipients
    .filter((r) => (r.recipType ?? "to").toLowerCase() === type)
    .map((r) => {
      if (r.name && r.email) return `${r.name} <${r.email}>`;
      return r.email ?? r.name ?? "";
    })
    .filter(Boolean)
    .join(", ");
}

function formatDate(raw: string | Date | undefined): string {
  if (!raw) return "";
  const d = typeof raw === "string" ? new Date(raw) : raw;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function parseMsg(buffer: ArrayBuffer): ParsedMessage {
  // @kenjiuno/msgreader accepts an ArrayBuffer
  const reader = new MsgReader(buffer);
  const info = reader.getFileData() as {
    subject?: string;
    senderName?: string;
    senderEmail?: string;
    body?: string;
    bodyHtml?: string;
    messageDeliveryTime?: string;
    clientSubmitTime?: string;
    recipients?: Array<{ name?: string; email?: string; recipType?: string }>;
    attachments?: Array<{
      fileName?: string;
      displayName?: string;
      extension?: string;
      mimeType?: string;
      contentLength?: number;
      content?: Uint8Array;
    }>;
    error?: string;
  };

  if (info.error) {
    throw new Error(`Invalid MSG file: ${info.error}`);
  }

  const bodyHtml = info.bodyHtml ?? "";
  const bodyRaw = info.body ?? "";
  const bodyText = bodyHtml
    ? htmlToText(bodyHtml, {
        wordwrap: false,
        selectors: [
          { selector: "a", options: { ignoreHref: false } },
          { selector: "img", format: "skip" },
          { selector: "table", options: { uppercaseHeaderCells: false } },
        ],
      })
    : bodyRaw;

  const from = info.senderName && info.senderEmail
    ? `${info.senderName} <${info.senderEmail}>`
    : info.senderEmail ?? info.senderName ?? "";

  const attachments: ParsedAttachment[] = [];
  if (info.attachments) {
    for (const meta of info.attachments) {
      try {
        // msgreader needs the original meta object to resolve content
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resolved = reader.getAttachment(meta as any) as {
          fileName?: string;
          content?: Uint8Array;
        };
        const content = resolved?.content ?? meta.content;
        const fileName =
          resolved?.fileName ?? meta.fileName ?? meta.displayName ?? "attachment";
        if (!content || content.length === 0) continue;

        const ext = (fileName.split(".").pop() ?? "").toLowerCase();
        const isImage = IMAGE_EXT.has(ext);
        attachments.push({
          fileName,
          content,
          contentType: meta.mimeType ?? extToContentType(ext),
          isImage,
        });
      } catch {
        // skip unreadable attachment
      }
    }
  }

  return {
    subject: info.subject ?? "(no subject)",
    from,
    to: joinRecipients(info.recipients, "to"),
    cc: joinRecipients(info.recipients, "cc"),
    date: formatDate(info.messageDeliveryTime ?? info.clientSubmitTime),
    bodyText: bodyText.trim(),
    attachments,
  };
}
