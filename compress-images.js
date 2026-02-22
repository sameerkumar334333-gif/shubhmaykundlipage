#!/usr/bin/env node
/**
 * Compress all PNGs and output to assets/images/
 * Uses WebP for rashi images (best performance), PNG for favicon/logo
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LP = __dirname;
const OUT = path.join(LP, 'assets', 'images');
const PNGs = [
  'Zodiac1.png', 'Vrisabh.png', 'Gemini.png', 'Kark.png', 'singh.png',
  'Kanya.png', 'tula.png', 'Vrishchik.png', 'dhanu.png', 'makar.png',
  'kumbh.png', 'meen.png'
];
const FROM_ROOT = PNGs;
const FROM_ASSETS = []; // shubhmay-logo.png if present
const FAVICON = 'favicon.png';

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function compressPng(src, dest) {
  await sharp(src)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(dest);
}

async function compressWebP(src, dest, quality = 82) {
  await sharp(src)
    .webp({ quality, effort: 6 })
    .toFile(dest);
}

async function main() {
  await ensureDir(OUT);
  const results = [];

  // Rashi PNGs -> WebP (best perf) + compressed PNG (fallback)
  for (const name of FROM_ROOT) {
    const src = path.join(LP, name);
    if (!fs.existsSync(src)) continue;
    const base = path.basename(name, '.png');
    const outWebp = path.join(OUT, base + '.webp');
    const outPng = path.join(OUT, base + '.png');
    try {
      await compressWebP(src, outWebp);
      await compressPng(src, outPng);
      const statW = fs.statSync(outWebp);
      const statP = fs.statSync(outPng);
      results.push({ name, webp: statW.size, png: statP.size });
    } catch (e) {
      console.error('Error:', name, e.message);
    }
  }

  // Logo: keep PNG (small)
  for (const name of FROM_ASSETS) {
    const src = path.join(LP, 'assets', name);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(OUT, name);
    try {
      await compressPng(src, dest);
      results.push({ name, png: fs.statSync(dest).size });
    } catch (e) {
      console.error('Error:', name, e.message);
    }
  }

  // Favicon
  const favSrc = path.join(LP, FAVICON);
  if (fs.existsSync(favSrc)) {
    const dest = path.join(OUT, FAVICON);
    await compressPng(favSrc, dest);
    results.push({ name: FAVICON, png: fs.statSync(dest).size });
  }

  console.log('Compressed:', results.length, 'files to assets/images/');
}

main().catch(console.error);
