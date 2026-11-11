import { zipSync } from 'fflate';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const files = {};
async function collect(directory) {
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else files[relative('dist', path).replaceAll('\\', '/')] = [await readFile(path), { mtime: new Date(1980, 0, 1) }];
  }
}
await collect('dist');
const zipped = zipSync(files, { level: 9 });
const path = 'user-agent-local.zip';
await writeFile(path, zipped);
console.log(path + ' — ' + zipped.length + ' bytes — SHA-256 ' + createHash('sha256').update(zipped).digest('hex'));
