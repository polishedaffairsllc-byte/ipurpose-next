// Usage: node scripts/prepare-sdsn-slides.mjs /absolute/path/to/slides recipient-slug [original-ghana-png-directory]
// Add --ug for the 8-slide UG deck; existing SDSN invocation is unchanged.
// Input: original PNG exports, slide-01.png through slide-12.png (08 for UG).
import sharp from 'sharp';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const args = process.argv.slice(2);
const ug = args.includes('--ug');
// A private output directory lets reviewed university decks reuse this exact pipeline.
const outputIndex = args.indexOf('--output-dir');
const privateOutput = outputIndex >= 0 ? args[outputIndex + 1] : undefined;
if (outputIndex >= 0 && (!privateOutput || !path.isAbsolute(privateOutput))) throw new Error('Private output must be an absolute directory.');
const positional = args.filter((arg, index) => arg !== '--ug' && (outputIndex < 0 || (index !== outputIndex && index !== outputIndex + 1)));
const [input, slug = 'ghana-jh', ghanaInput] = positional;
if (!input || !/^[a-z0-9-]+$/.test(slug)) throw new Error('Provide a PNG directory and a safe recipient slug.');
const files = (await readdir(input)).filter(file => /^slide-\d\d\.png$/.test(file)).sort();
const count = ug ? 8 : 12;
if (files.length !== count || files.some((file, i) => file !== `slide-${String(i + 1).padStart(2, '0')}.png`)) throw new Error(`Expected all ${count} original PNG slide exports in order.`);
const output = privateOutput || path.join('public/partnerships', ug ? 'ug' : 'sdsn', slug);
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
