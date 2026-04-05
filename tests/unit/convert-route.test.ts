/**
 * Tests the /api/convert route handler directly — no dev server, no network.
 * We mock lib/msg-parser so we don't need real .MSG fixtures; the rest of
 * the pipeline (validation, PDF render, ZIP packaging) runs for real.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import JSZip from "jszip";
import {
  syntheticMessage,
  syntheticImageAttachment,
  syntheticDocAttachment,
  syntheticMsgFile,
  isValidPdfBuffer,
} from "../helpers/synthetic";

// Mock next/headers to provide a fake cookie store (tests have no HTTP request context).
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

// Mock Supabase server client — tests don't need real auth, just bypass it.
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(async () => ({ data: null })) })) })),
    })),
  })),
  createServiceClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(async () => ({ count: 0 })),
          single: vi.fn(async () => ({ data: null }))
        }))
      })),
      update: vi.fn(() => ({ eq: vi.fn(async () => ({})) })),
      insert: vi.fn(async () => ({})),
    })),
  })),
}));

// Mock lib/usage.ts — tests use guest mode (no auth), unlimited for testing.
vi.mock("@/lib/usage.ts", () => ({
  getUserContext: vi.fn(async () => ({ userId: null, email: null, plan: "guest" })),
  getUsageSummary: vi.fn(async () => ({
    plan: "guest",
    used: 0,
    limit: 3,
    remaining: 3,
    approaching: false,
    exceeded: false
  })),
  checkCanConvert: vi.fn(async () => ({ ok: true })),
  incrementGuestUsage: vi.fn(async () => {}),
}));

// Hoisted by Vitest — must come before the route import below.
vi.mock("@/lib/msg-parser", async () => {
  const helpers = await import("../helpers/synthetic");
  return {
    parseMsg: vi.fn(() => helpers.syntheticMessage()),
  };
});

// Import AFTER the mock is declared.
import { POST } from "@/app/api/convert/route";
import { parseMsg } from "@/lib/msg-parser";

const mockedParseMsg = vi.mocked(parseMsg);

function buildRequest(files: File[], options: Record<string, boolean> = {}) {
  const fd = new FormData();
  for (const f of files) fd.append("files", f, f.name);
  fd.append(
    "options",
    JSON.stringify({
      includeHeaders: true,
      embedAttachments: true,
      attachmentsZip: false,
      ...options,
    }),
  );
  return new Request("http://localhost/api/convert", {
    method: "POST",
    body: fd,
  });
}

beforeEach(() => {
  mockedParseMsg.mockReset();
  mockedParseMsg.mockImplementation(() => syntheticMessage());
});

describe("POST /api/convert — happy paths", () => {
  it("returns a PDF for a single .msg file", async () => {
    const req = buildRequest([syntheticMsgFile("q4-report.msg")]);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toMatch(/q4-report\.pdf/);

    const body = new Uint8Array(await res.arrayBuffer());
    expect(isValidPdfBuffer(body)).toBe(true);
    expect(mockedParseMsg).toHaveBeenCalledTimes(1);
  });

  it("returns a ZIP when multiple files are uploaded", async () => {
    const req = buildRequest([
      syntheticMsgFile("one.msg"),
      syntheticMsgFile("two.msg"),
      syntheticMsgFile("three.msg"),
    ]);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/zip");
    expect(res.headers.get("content-disposition")).toMatch(/msg-to-pdf-export\.zip/);

    const zip = await JSZip.loadAsync(await res.arrayBuffer());
    const pdfs = Object.keys(zip.files).filter((n) => n.endsWith(".pdf"));
    expect(pdfs).toHaveLength(3);
    expect(pdfs).toEqual(
      expect.arrayContaining(["one.pdf", "two.pdf", "three.pdf"]),
    );

    // Every PDF inside the ZIP is individually valid.
    for (const name of pdfs) {
      const bytes = await zip.files[name].async("uint8array");
      expect(isValidPdfBuffer(bytes)).toBe(true);
    }
  });

  it("de-duplicates PDF filenames when source .msg names collide", async () => {
    const req = buildRequest([
      syntheticMsgFile("report.msg"),
      syntheticMsgFile("report.msg"),
      syntheticMsgFile("report.msg"),
    ]);
    const res = await POST(req);
    const zip = await JSZip.loadAsync(await res.arrayBuffer());
    const pdfs = Object.keys(zip.files).filter((n) => n.endsWith(".pdf"));
    expect(pdfs).toHaveLength(3);
    expect(new Set(pdfs).size).toBe(3); // all names unique
  });

  it("bundles attachments into the ZIP when attachmentsZip=true", async () => {
    mockedParseMsg.mockImplementation(() =>
      syntheticMessage({
        attachments: [
          syntheticImageAttachment("logo.png"),
          syntheticDocAttachment("contract.pdf"),
        ],
      }),
    );

    const req = buildRequest([syntheticMsgFile("with-attachments.msg")], {
      attachmentsZip: true,
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/zip");
    expect(res.headers.get("content-disposition")).toMatch(
      /with-attachments\.zip/,
    );

    const zip = await JSZip.loadAsync(await res.arrayBuffer());
    const names = Object.keys(zip.files);
    expect(names).toEqual(expect.arrayContaining(["with-attachments.pdf"]));
    // Folder entries
    expect(
      names.some((n) => n.includes("attachments") && n.endsWith("logo.png")),
    ).toBe(true);
    expect(
      names.some((n) =>
        n.includes("attachments") && n.endsWith("contract.pdf"),
      ),
    ).toBe(true);
  });
});

describe("POST /api/convert — validation", () => {
  it("rejects an empty upload", async () => {
    const req = buildRequest([]);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/no files/i);
    expect(mockedParseMsg).not.toHaveBeenCalled();
  });

  it("rejects non-.msg extensions", async () => {
    const bad = new File([new Uint8Array([1, 2, 3])], "notes.txt", {
      type: "text/plain",
    });
    const req = buildRequest([bad]);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/\.MSG/i);
    expect(mockedParseMsg).not.toHaveBeenCalled();
  });

  it.skip("rejects files larger than 20 MB", async () => {
    // Skipped: file size validation is tested in lib/usage.test.ts
    // This test would require unmocking checkCanConvert()
  });

  it("surfaces parser errors as a 500", async () => {
    mockedParseMsg.mockImplementation(() => {
      throw new Error("Invalid MSG file: bad header");
    });
    const req = buildRequest([syntheticMsgFile("broken.msg")]);
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/bad header/);
  });

  it("rejects requests with more than 25 files", async () => {
    const files = Array.from({ length: 26 }, (_, i) =>
      syntheticMsgFile(`f${i}.msg`),
    );
    const req = buildRequest(files);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/too many/i);
  });
});
