import { deflateSync } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(name, data) {
  const type = Buffer.from(name), length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([length, type, data, crc]);
}
await mkdir('public/icons', { recursive: true });
for (const size of [16, 32, 48, 128]) {
  const pixels = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const white = (u > .2 && u < .29 && v > .23 && v < .64) || (u > .43 && u < .52 && v > .23 && v < .64) || (u > .2 && u < .52 && v > .58 && v < .71) || (u > .64 && u < .74 && v > .23 && v < .71) || (u > .59 && u < .79 && v > .23 && v < .32) || (u > .59 && u < .79 && v > .45 && v < .53);
    const i = y * (size * 4 + 1) + 1 + x * 4;
    pixels.set(white ? [244,247,250,255] : [39,93,199,255], i);
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size); ihdr.writeUInt32BE(size,4); ihdr[8]=8; ihdr[9]=6;
  await writeFile('public/icons/' + size + '.png', Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR',ihdr),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]));
}
