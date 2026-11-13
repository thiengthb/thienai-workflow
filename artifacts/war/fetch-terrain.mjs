#!/usr/bin/env node
// Lấy độ cao thật cho một trận và ghi vào file dữ liệu trận (xem README.md trong thư mục này). Chạy một lần cho mỗi trận.
//
//   node artifacts/war/fetch-terrain.mjs learning/war/battles/<trận>.json [--cols 160] [--zoom 13]
//
// Đọc "bbox": [nam, tây, bắc, đông] (độ) trong file, tải ô độ cao Terrarium (AWS Open Data, miễn phí, không cần khóa),
// lấy mẫu thành lưới cols × rows, ghi vào "terrain": { cols, rows, min, max, widthKm, heightKm, h: base64 Uint16 }.
// Rồi kéo các điểm có "snap" về đúng chỗ trên địa hình thật: "high" (đỉnh đồi gần nhất), "low" (chỗ trũng, cho sông).
// Nguồn: https://registry.opendata.aws/terrain-tiles/ (gộp SRTM, GMTED và các nguồn khác, độ phân giải khoảng 30 m).
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? Number(args.splice(i, 2)[1]) : d; };
const COLS = flag('cols', 160), Z = flag('zoom', 13);
const file = args[0];
if (!file) { console.error('Cách dùng: node artifacts/war/fetch-terrain.mjs <trận>.json [--cols 160] [--zoom 13]'); process.exit(1); }
const battle = JSON.parse(readFileSync(file, 'utf8'));
const [S, W, N, E] = battle.bbox || [];
if (![S, W, N, E].every(Number.isFinite) || S >= N || W >= E) { console.error('Thiếu "bbox": [nam, tây, bắc, đông] trong file trận'); process.exit(1); }

// Đọc PNG 8 bit RGB/RGBA không xen dòng (đúng kiểu ô Terrarium), trả về hàm lấy độ cao theo pixel.
function decodePng(buf) {
  let p = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8 || d[12]) throw new Error('PNG không phải 8 bit, không xen dòng'); }
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 0; if (!bpp) throw new Error('PNG không phải RGB');
  const raw = inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), row = px.subarray(y * stride, (y + 1) * stride), up = y ? px.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? row[x - bpp] : 0, b = up ? up[x] : 0, c = up && x >= bpp ? up[x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      row[x] = v & 255;
    }
  }
  return (x, y) => { const i = y * stride + x * bpp; return px[i] * 256 + px[i + 1] + px[i + 2] / 256 - 32768; };
}

const n = 2 ** Z;
const tx = (lon) => (lon + 180) / 360 * n;
const ty = (lat) => { const r = lat * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n; };
const tiles = new Map();
async function tile(x, y) {
  const k = x + '/' + y;
  if (!tiles.has(k)) {
    const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Không tải được ${url}: ${res.status}`);
    tiles.set(k, decodePng(Buffer.from(await res.arrayBuffer())));
  }
  return tiles.get(k);
}
async function elev(lat, lon) {
  const fx = tx(lon), fy = ty(lat), x = Math.floor(fx), y = Math.floor(fy);
  return (await tile(x, y))(Math.min(255, Math.floor((fx - x) * 256)), Math.min(255, Math.floor((fy - y) * 256)));
}

const kmLat = 110.57, kmLon = 111.32 * Math.cos((S + N) / 2 * Math.PI / 180);
const widthKm = (E - W) * kmLon, heightKm = (N - S) * kmLat;
const ROWS = Math.round(COLS * heightKm / widthKm);
const grid = new Float32Array(COLS * ROWS);
// Lấy trung bình 3×3 điểm quanh mỗi ô lưới để bớt nhiễu của dữ liệu gốc.
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
  let s = 0;
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
    const lat = N - (r + .5 + i / 3) / ROWS * (N - S), lon = W + (c + .5 + j / 3) / COLS * (E - W);
    s += await elev(lat, lon);
  }
  grid[r * COLS + c] = s / 9;
}
let min = Infinity, max = -Infinity;
for (const v of grid) { if (v < min) min = v; if (v > max) max = v; }
const u16 = new Uint16Array(grid.length);
grid.forEach((v, i) => { u16[i] = Math.round((v - min) / (max - min || 1) * 65535); });
battle.terrain = { source: 'AWS Terrain Tiles (Terrarium), zoom ' + Z, cols: COLS, rows: ROWS, min: Math.round(min), max: Math.round(max),
  widthKm: +widthKm.toFixed(3), heightKm: +heightKm.toFixed(3), h: Buffer.from(u16.buffer).toString('base64') };

// Kéo điểm về đúng địa hình: tìm trong bán kính "snapKm" (mặc định 0,4 km) ô cao nhất hoặc thấp nhất.
const cell = (lat, lon) => [Math.max(0, Math.min(ROWS - 1, Math.floor((N - lat) / (N - S) * ROWS))), Math.max(0, Math.min(COLS - 1, Math.floor((lon - W) / (E - W) * COLS)))];
function snap([lat, lon], mode, km = .4) {
  const [r0, c0] = cell(lat, lon), rr = Math.ceil(km / (heightKm / ROWS)), rc = Math.ceil(km / (widthKm / COLS));
  let best = [r0, c0], bv = grid[r0 * COLS + c0];
  for (let r = r0 - rr; r <= r0 + rr; r++) for (let c = c0 - rc; c <= c0 + rc; c++) {
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS || ((r - r0) / rr) ** 2 + ((c - c0) / rc) ** 2 > 1) continue;
    const v = grid[r * COLS + c];
    if (mode === 'high' ? v > bv : v < bv) { bv = v; best = [r, c]; }
  }
  return [+(N - (best[0] + .5) / ROWS * (N - S)).toFixed(5), +(W + (best[1] + .5) / COLS * (E - W)).toFixed(5)];
}
let moved = 0;
for (const u of battle.units || []) if (u.snap && u.at) { u.at = snap(u.raw || (u.raw = u.at), u.snap, u.snapKm); moved++; }
for (const f of battle.features || []) if (f.snap && f.pts) { f.pts = (f.raw || (f.raw = f.pts)).map((p) => snap(p, f.snap, f.snapKm)); moved++; }
// Mảng số viết trên một dòng cho dễ đọc file.
const text = JSON.stringify(battle, null, 1).replace(/\[\s+([-\d.,\s]+?)\s+\]/g, (m, x) => '[' + x.replace(/\s+/g, '') + ']')
  .replace(/\[\s+((?:\[[-\d.,]+\],?\s*)+)\]/g, (m, x) => '[' + x.replace(/\s+/g, '') + ']');
writeFileSync(file, text + '\n');
console.log(`Đã ghi địa hình ${COLS}×${ROWS} (${widthKm.toFixed(1)} × ${heightKm.toFixed(1)} km, cao ${Math.round(min)}–${Math.round(max)} m) và kéo ${moved} điểm về địa hình thật vào ${file}`);
