/* 箱庭シミュレーター：zip を作る小さな部品（Windows・Mac に zip の道具が無くても動くように、node の zlib だけで書く）
   writeZip(出力のパス, [{ name: 'zip の中のパス（/ 区切り）', data: Buffer }]) */
'use strict';
const fs = require('fs'), zlib = require('zlib');
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc32(b) { let c = -1; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function dosTime(d) {
  return { time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() };
}
function writeZip(out, entries) {
  const parts = [], central = [], now = dosTime(new Date());
  let off = 0;
  entries.forEach(e => {
    const name = Buffer.from(e.name.replace(/\\/g, '/'), 'utf8'), raw = e.data, comp = zlib.deflateRawSync(raw, { level: 9 });
    const useC = comp.length < raw.length, body = useC ? comp : raw, crc = crc32(raw);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(0x0800, 6); h.writeUInt16LE(useC ? 8 : 0, 8);
    h.writeUInt16LE(now.time, 10); h.writeUInt16LE(now.date, 12); h.writeUInt32LE(crc, 14); h.writeUInt32LE(body.length, 18); h.writeUInt32LE(raw.length, 22);
    h.writeUInt16LE(name.length, 26); h.writeUInt16LE(0, 28);
    parts.push(h, name, body);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(useC ? 8 : 0, 10);
    c.writeUInt16LE(now.time, 12); c.writeUInt16LE(now.date, 14); c.writeUInt32LE(crc, 16); c.writeUInt32LE(body.length, 20); c.writeUInt32LE(raw.length, 24);
    c.writeUInt16LE(name.length, 28); c.writeUInt32LE(off, 42);
    central.push(c, name);
    off += h.length + name.length + body.length;
  });
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  fs.writeFileSync(out, Buffer.concat(parts.concat([cd, end])));
}
module.exports = { writeZip };
