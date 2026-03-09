#!/usr/bin/env node
/**
 * Generate all app icons from public/icon.svg
 * Usage: node scripts/generate-icons.mjs
 * Requires: npx sharp-cli (or `npm i -g sharp-cli`)
 */
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const src = resolve(root, "public/icon.svg");
const pub = resolve(root, "public");
const tauriIcons = resolve(root, "src-tauri/icons");

mkdirSync(tauriIcons, { recursive: true });

const sharp = (args) => execSync(`npx sharp-cli ${args}`, { stdio: "inherit" });

const sizes = [
  // Web favicons & PWA
  { size: 16, out: `${pub}/favicon-16x16.png` },
  { size: 32, out: `${pub}/favicon-32x32.png` },
  { size: 48, out: `${pub}/favicon-48x48.png` },
  { size: 64, out: `${pub}/favicon-64x64.png` },
  { size: 180, out: `${pub}/apple-touch-icon.png` },
  { size: 192, out: `${pub}/icon-192.png` },
  { size: 512, out: `${pub}/icon-512.png` },
  { size: 1024, out: `${pub}/icon-1024.png` },
  // Tauri desktop icons
  { size: 32, out: `${tauriIcons}/32x32.png` },
  { size: 128, out: `${tauriIcons}/128x128.png` },
  { size: 256, out: `${tauriIcons}/128x128@2x.png` },
  { size: 512, out: `${tauriIcons}/icon.png` },
];

console.log("Generating PNG icons...");
for (const { size, out } of sizes) {
  sharp(`-i "${src}" -o "${out}" resize ${size} ${size}`);
  console.log(`  ✓ ${size}x${size} → ${out.split(/[/\\]/).pop()}`);
}

// Generate ICO from multiple sizes (for Windows)
console.log("\nGenerating ICO (Windows)...");
// sharp-cli can't make ICO, so we'll use the 256px PNG as icon.ico placeholder
// For proper ICO, use `cargo tauri icon` or ImageMagick
sharp(`-i "${src}" -o "${tauriIcons}/icon.ico" resize 256 256`);
console.log("  ✓ icon.ico (256x256 PNG, rename to .ico)");

// macOS icns — same approach, placeholder
sharp(`-i "${src}" -o "${tauriIcons}/icon.icns" resize 512 512`);
console.log("  ✓ icon.icns (placeholder — use `cargo tauri icon` for proper icns)");

console.log("\n✅ Done! For proper .ico/.icns, install Rust and run:");
console.log("   cd frontend && cargo tauri icon public/icon-1024.png");
