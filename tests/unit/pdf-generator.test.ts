import { describe, it, expect } from "vitest";
import { renderEmailToPdfBuffer } from "@/lib/pdf-generator";
import {
  syntheticMessage,
  syntheticImageAttachment,
  syntheticDocAttachment,
  isValidPdfBuffer,
} from "../helpers/synthetic";

describe("renderEmailToPdfBuffer", () => {
  it("produces a valid PDF with headers enabled", async () => {
    const buf = await renderEmailToPdfBuffer(syntheticMessage(), {
      includeHeaders: true,
      embedAttachments: true,
    });
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(500);
    expect(isValidPdfBuffer(buf)).toBe(true);
  });

  it("produces a valid PDF with headers disabled", async () => {
    const buf = await renderEmailToPdfBuffer(syntheticMessage(), {
      includeHeaders: false,
      embedAttachments: false,
    });
    expect(isValidPdfBuffer(buf)).toBe(true);
  });

  it("handles an empty body without crashing", async () => {
    const buf = await renderEmailToPdfBuffer(
      syntheticMessage({ bodyText: "" }),
      { includeHeaders: true, embedAttachments: true },
    );
    expect(isValidPdfBuffer(buf)).toBe(true);
  });

  it("embeds image attachments inline", async () => {
    const buf = await renderEmailToPdfBuffer(
      syntheticMessage({
        attachments: [
          syntheticImageAttachment("logo.png"),
          syntheticImageAttachment("hero.png"),
        ],
      }),
      { includeHeaders: true, embedAttachments: true },
    );
    expect(isValidPdfBuffer(buf)).toBe(true);
    // PDFs with embedded images are meaningfully bigger than text-only ones.
    expect(buf.length).toBeGreaterThan(1500);
  });

  it("lists non-image attachments when embedding is on", async () => {
    const buf = await renderEmailToPdfBuffer(
      syntheticMessage({
        attachments: [syntheticDocAttachment("contract.pdf")],
      }),
      { includeHeaders: true, embedAttachments: true },
    );
    expect(isValidPdfBuffer(buf)).toBe(true);
  });

  it("omits attachment list entirely when embedAttachments is false", async () => {
    const buf = await renderEmailToPdfBuffer(
      syntheticMessage({
        attachments: [syntheticDocAttachment("contract.pdf")],
      }),
      { includeHeaders: true, embedAttachments: false },
    );
    expect(isValidPdfBuffer(buf)).toBe(true);
  });

  it("handles very long bodies (pagination)", async () => {
    const longBody = Array.from({ length: 120 }, (_, i) =>
      `Paragraph ${i + 1}: ${"lorem ipsum dolor sit amet ".repeat(12)}`,
    ).join("\n\n");
    const buf = await renderEmailToPdfBuffer(
      syntheticMessage({ bodyText: longBody }),
      { includeHeaders: true, embedAttachments: false },
    );
    expect(isValidPdfBuffer(buf)).toBe(true);
    // Multi-page documents should be noticeably larger.
    expect(buf.length).toBeGreaterThan(5000);
  });
});
