// Usage: node scripts/prepare-sdsn-slides.mjs /absolute/path/to/slides recipient-slug [original-ghana-png-directory]
// Input: the original 2881 x 1620 PNG exports, slide-01.png through slide-12.png.
import sharp from 'sharp';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const [input, slug = 'ghana-jh', ghanaInput] = process.argv.slice(2);
if (!input || !/^[a-z0-9-]+$/.test(slug)) throw new Error('Provide a PNG directory and a safe recipient slug.');
const files = (await readdir(input)).filter(file => /^slide-\d\d\.png$/.test(file)).sort();
if (files.length !== 12) throw new Error('Expected all 12 original PNG slide exports.');
const output = path.join('public/partnerships/sdsn', slug);
await mkdir(output, { recursive: true });
const shared = [];
const unique = [];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
for (const file of files) {
  const source = path.join(input, file);
  const meta = await sharp(source).metadata();
  if (meta.width < 2880) throw new Error(`${file} is below 2880px; obtain a larger original export. Do not upscale.`);
  if (ghanaInput && sha256(await readFile(source)) === sha256(await readFile(path.join(ghanaInput, file)))) {
    shared.push(file);
    continue;
  }
  unique.push(file);
  for (const width of [1280, 1920, 2880]) {
    const name = file.replace('.png', `${width === 2880 ? '' : `-${width}`}.webp`);
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(output, name));
  }
}
console.log(JSON.stringify({ slug, unique, sharedWithGhana: shared, widths: [1280, 1920, 2880] }, null, 2));
