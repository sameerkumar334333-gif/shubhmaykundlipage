#!/usr/bin/env node
/**
 * Generate 100% favicon setup from source image.
 * Run: node generate-favicon.js
 */
const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

const LP = __dirname;
const ASSETS = path.join(LP, 'assets', 'images');
const SOURCE = path.join(LP, 'favicon.jpg'); // high-res source
const FALLBACK = path.join(ASSETS, 'favicon.png'); // or use existing 32x32

async function main() {
  const src = fs.existsSync(SOURCE) ? SOURCE : FALLBACK;
  if (!fs.existsSync(src)) {
    console.error('No favicon source found (favicon.jpg or assets/images/favicon.png)');
    process.exit(1);
  }
  await sharp(src).resize(32, 32).png().toFile(path.join(ASSETS, 'favicon-32x32.png'));
  await sharp(src).resize(16, 16).png().toFile(path.join(ASSETS, 'favicon-16x16.png'));
  await sharp(src).resize(180, 180).png().toFile(path.join(ASSETS, 'apple-touch-icon.png'));
  // Overwrite main favicon.png with clean 32x32
  await sharp(src).resize(32, 32).png().toFile(path.join(ASSETS, 'favicon.png'));

  const buf32 = await sharp(src).resize(32, 32).png().toBuffer();
  const buf16 = await sharp(src).resize(16, 16).png().toBuffer();
  const ico = await toIco([buf16, buf32]);
  fs.writeFileSync(path.join(LP, 'favicon.ico'), ico);

  console.log('Favicon generated: favicon.ico, assets/images/favicon*.png, apple-touch-icon.png');
}

main().catch(console.error);
