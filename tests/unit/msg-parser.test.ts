/**
 * Parser tests that run against *real* .MSG files.
 *
 * Drop any Outlook .msg files into tests/fixtures/ and this suite will
 * discover and test them automatically. If the folder is empty, the
 * suite is skipped cleanly — CI stays green even when no private
 * fixtures are committed.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMsg } from "@/lib/msg-parser";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(here, "../fixtures");

const fixtureFiles = existsSync(fixturesDir)
  ? readdirSync(fixturesDir).filter((f) => f.toLowerCase().endsWith(".msg"))
  : [];

describe.skipIf(fixtureFiles.length === 0)("parseMsg — real .MSG fixtures", () => {
  for (const name of fixtureFiles) {
    it(`parses ${name} without error`, () => {
      const abs = path.join(fixturesDir, name);
      const raw = readFileSync(abs);
      // Copy into a standalone ArrayBuffer slice — Node Buffers share the
      // underlying memory pool, which can confuse msgreader.
      const ab = raw.buffer.slice(
        raw.byteOffset,
        raw.byteOffset + raw.byteLength,
      );

      const message = parseMsg(ab);

      expect(message).toBeTruthy();
      expect(typeof message.subject).toBe("string");
      expect(typeof message.from).toBe("string");
      expect(typeof message.bodyText).toBe("string");
      expect(Array.isArray(message.attachments)).toBe(true);
      // Every attachment has the minimum required shape
      for (const att of message.attachments) {
        expect(att.fileName).toBeTruthy();
        expect(att.content).toBeInstanceOf(Uint8Array);
      }
    });
  }
});

// This test always runs — it tells the developer HOW to exercise the suite
// above if they want parser-level coverage.
describe("parseMsg — fixture availability", () => {
  it("reports fixture status", () => {
    if (fixtureFiles.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        "[msg-parser] No .msg fixtures found at tests/fixtures/. " +
          "Drop real Outlook files there to enable real-parser tests.",
      );
    } else {
      // eslint-disable-next-line no-console
      console.log(
        `[msg-parser] Running against ${fixtureFiles.length} fixture(s): ` +
          fixtureFiles.join(", "),
      );
    }
    expect(true).toBe(true);
  });
});
