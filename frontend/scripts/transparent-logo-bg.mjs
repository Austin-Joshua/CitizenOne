/**
 * Removes near-black or near-white plate from a logo PNG (writes RGBA with alpha).
 *
 * Usage:
 *   node scripts/transparent-logo-bg.mjs <input.png> [--white]           # overwrite input
 *   node scripts/transparent-logo-bg.mjs <input.png> <out.png> [--white]
 */
import sharp from 'sharp';
import { writeFile, unlink, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { argv } from 'node:process';

const rawArgs = argv.slice(2);
const whitePlate = rawArgs.includes('--white');
const args = rawArgs.filter((a) => a !== '--white');

const [inputPath, outputPath] = args;
if (!inputPath) {
  console.error('Usage: node scripts/transparent-logo-bg.mjs <input.png> [output.png] [--white]');
  process.exit(1);
}

const outFile = outputPath || inputPath;

/** Black plate: max(R,G,B) at or below this → transparent */
const BLACK_CUTOFF = 28;
/** White plate: min(R,G,B) at or above this → transparent */
const WHITE_CUTOFF = 236;
/** Blend band for softer edges (anti-alias) */
const EDGE_BAND = 55;

const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

/** Skip tiny squares (favicons); allow wide banner lockups and small lockups after trim. */
const MIN_W = whitePlate ? 48 : 120;
const MIN_H = whitePlate ? 20 : 32;
const MIN_AREA = whitePlate ? 48 * 24 : 120 * 80;
if (width * height < MIN_AREA || width < MIN_W) {
  console.warn(`Skip: ${width}×${height} is too small to treat as a full logo.`);
  process.exit(0);
}

const out = Buffer.from(data);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const a = out[i + 3];

    if (whitePlate) {
      const min = Math.min(r, g, b);
      if (min >= WHITE_CUTOFF) {
        out[i + 3] = 0;
      } else if (min > WHITE_CUTOFF - EDGE_BAND) {
        const t = (WHITE_CUTOFF - min) / EDGE_BAND;
        out[i + 3] = Math.round(a * Math.min(1, Math.max(0, t)));
      }
    } else {
      const max = Math.max(r, g, b);
      if (max <= BLACK_CUTOFF) {
        out[i + 3] = 0;
      } else if (max < BLACK_CUTOFF + EDGE_BAND) {
        const t = (max - BLACK_CUTOFF) / EDGE_BAND;
        out[i + 3] = Math.round(a * Math.min(1, Math.max(0, t)));
      }
    }
  }
}

const buf = await sharp(out, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

const trimmed = await sharp(buf).trim({ threshold: 2 }).png({ compressionLevel: 9 }).toBuffer();
const meta = await sharp(trimmed).metadata();

const dir = dirname(outFile);
const tmp = join(dir, `.citizen-one-logo.${process.pid}.tmp.png`);
await writeFile(tmp, trimmed);
try {
  await unlink(outFile);
} catch {
  /* absent */
}
await rename(tmp, outFile);
console.log(
  'Wrote',
  outFile,
  `${meta.width}×${meta.height} (${whitePlate ? 'white' : 'black'} plate, trimmed from ${width}×${height})`
);
