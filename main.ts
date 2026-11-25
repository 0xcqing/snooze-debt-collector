import { mkdirSync, writeFileSync, readFileSync, chmodSync } from "node:fs";
import { join } from "node:path";

const PITCH =
  "The Snooze Debt Collector lets you hit snooze, then follows you to work with a tiny invoice for nine minutes plus interest.";

const MAX_CHARS = 200;

const configuredDir: string = (process.env.MAKEFUN_OUTPUT_DIR || "").trim();
const outputDir: string = configuredDir.length > 0 ? configuredDir : "/output";
const outputPath: string = join(outputDir, "entry.txt");

function fail(message: string): never {
  console.error("entry error: " + message);
  process.exit(1);
}

function assertEntry(pitch: string): void {
  const chars = Array.from(pitch).length;
  if (chars < 1 || chars > MAX_CHARS) {
    fail("pitch must be 1.." + MAX_CHARS + " characters, got " + chars);
  }
  if (pitch.trim().length === 0) {
    fail("pitch is only white space");
  }
  if (/[\r\n]/.test(pitch)) {
    fail("pitch must be a single line of text");
  }
}

function main(): void {
  assertEntry(PITCH);

  mkdirSync(outputDir, { recursive: true, mode: 0o755 });

  const content: string = PITCH + "\n";
  writeFileSync(outputPath, content, { encoding: "utf8", mode: 0o644 });
  chmodSync(outputPath, 0o644);

  const bytes: Buffer = readFileSync(outputPath);
  if (bytes.length < 1 || bytes.length > MAX_CHARS) {
    fail("entry.txt must be 1.." + MAX_CHARS + " bytes, got " + bytes.length);
  }
  if (!bytes.equals(Buffer.from(content, "utf8"))) {
    fail("entry.txt does not hold the pitch plus one trailing newline");
  }
  if (bytes[bytes.length - 1] !== 0x0a) {
    fail("entry.txt does not end with a newline");
  }
  const newlineCount = bytes.reduce((n, b) => (b === 0x0a ? n + 1 : n), 0);
  if (newlineCount !== 1 || bytes.includes(0x0d)) {
    fail("entry.txt must hold exactly one newline and no carriage returns");
  }

  const chars = Array.from(PITCH).length;
  console.log("wrote " + outputPath);
  console.log("pitch: " + PITCH);
  console.log("chars=" + chars + " bytes=" + bytes.length + " trailing_newline=yes");
}

main();
