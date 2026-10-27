// Usage: node scripts/prepare-sdsn-slides.mjs /absolute/path/to/slides ghana-jh
// Input: the original 2881 x 1620 PNG exports, slide-01.png through slide-12.png.
import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
const [input, slug = 'ghana-jh'] = process.argv.slice(2);
if (!input || !/^[a-z0-9-]+$/.test(slug)) throw new Error('Provide a PNG directory and a safe recipient slug.');
const files = (await readdir(input)).filter(file => /^slide-\d\d\.png$/.test(file)).sort();
if (files.length !== 12) throw new Error('Expected all 12 original PNG slide exports.');
const output = path.join('public/partnerships/sdsn', slug);
await mkdir(output, { recursive: true });
for (const file of files) {
  const source = path.join(input, file);
  const meta = await sharp(source).metadata();
  if (meta.width < 2880) throw new Error(`${file} is below 2880px; obtain a larger original export. Do not upscale.`);
  for (const width of [1280, 1920, 2880]) {
    const name = file.replace('.png', `${width === 2880 ? '' : `-${width}`}.webp`);
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(output, name));
  }
}
console.log(`Prepared ${files.length} slides at three widths for ${slug}.`);
