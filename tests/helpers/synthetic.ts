/**
 * Shared test helpers: synthetic ParsedMessage objects, tiny PNG bytes,
 * and a helper to build a File that looks like a .msg upload without
 * needing any real Outlook binary fixture.
 */

import type { ParsedMessage, ParsedAttachment } from "@/lib/msg-parser";

/** 1×1 transparent PNG — smallest valid image for inline-embed tests. */
export const TINY_PNG: Uint8Array = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

export function syntheticMessage(overrides: Partial<ParsedMessage> = {}): ParsedMessage {
  return {
    subject: "Quarterly report — Q4 2025",
    from: "Alice Example <alice@example.com>",
    to: "Bob Example <bob@example.com>",
    cc: "",
    date: "Dec 12, 2025, 09:14",
    bodyText:
      "Hi Bob,\n\nHere is the Q4 summary. Revenue is up 12% quarter over quarter and we closed three enterprise deals last week.\n\nLet me know if you want the full breakdown.\n\nThanks,\nAlice",
    attachments: [],
    ...overrides,
  };
}

export function syntheticImageAttachment(
  fileName = "logo.png",
): ParsedAttachment {
  return {
    fileName,
    contentType: "image/png",
    content: TINY_PNG,
    isImage: true,
  };
}

export function syntheticDocAttachment(
  fileName = "contract.pdf",
): ParsedAttachment {
  return {
    fileName,
    contentType: "application/pdf",
    content: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
    isImage: false,
  };
}

/**
 * Build a File that the /api/convert route will accept. The *content* does
 * not need to be a real MSG — parser tests mock parseMsg, so any bytes will
 * do. The filename extension is what the route validates.
 */
export function syntheticMsgFile(
  name: string,
  byteLength = 1024,
): File {
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) bytes[i] = i % 256;
  return new File([bytes], name, { type: "application/vnd.ms-outlook" });
}

/** PDF magic bytes: `%PDF-` at the start, `%%EOF` near the end. */
export function isValidPdfBuffer(buf: Uint8Array | Buffer): boolean {
  if (buf.length < 10) return false;
  const head = String.fromCharCode(...buf.slice(0, 5));
  if (head !== "%PDF-") return false;
  const tail = String.fromCharCode(...buf.slice(Math.max(0, buf.length - 1024)));
  return tail.includes("%%EOF");
}
