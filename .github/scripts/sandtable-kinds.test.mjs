// Kiểm sa bàn (artifacts/war/sandtable.js) với các kiểu dành cho trận xưa: đạo quân (troop), đồng lầy (marsh),
// địa danh chỉ có tên (place), khóa bên kia tùy ý (ming) và roadLabel. Chạy trên bản đồ phẳng (không nạp three.js),
// là đường dự phòng của mọi máy. Cần trình duyệt: CI chạy file này trong job "pages".
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';

const rd = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8');
const cols = 8, rows = 6, u16 = new Uint16Array(cols * rows);
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) u16[r * cols + c] = Math.abs(c - 3.5) * 15000; // một lòng ải giữa hai bên cao
const battle = {
  id: 'test', title: 'Thử', bbox: [21.6, 106.5, 21.66, 106.58], roadLabel: 'Đường cái quan',
  sides: { ming: { name: 'Quân Minh', color: '#2f5f96' }, vn: { name: 'Quân Lam Sơn', color: '#b23a2a' } },
  features: [
    { kind: 'road', short: 'đường', pts: [[21.655, 106.54], [21.605, 106.54]] },
    { kind: 'marsh', short: 'đồng lầy', r: 0.3, pts: [[21.63, 106.54], [21.628, 106.541]] },
    { kind: 'place', short: 'núi Thử', pts: [[21.63, 106.53]] },
  ],
  units: [
    { id: 'a', side: 'ming', kind: 'troop', name: 'Đạo quân thử', short: 'Quân Minh', at: [21.65, 106.54], rank: 3 },
    { id: 'b', side: 'vn', kind: 'troop', name: 'Phục binh thử', short: 'Phục binh', at: [21.63, 106.535], rank: 2 },
  ],
  views: { tilt: { label: 'Nghiêng', yaw: 0, pitch: .8, dist: 1, target: [21.63, 106.54] } },
  tracks: { real: { label: 'Chuyện thật', tag: 'real', keys: [{ date: '1', title: 'Một', text: 'x', show: ['a', 'b'], hit: ['a'] }, { date: '2', title: 'Hai', text: 'y', lose: ['a'] }] } },
  terrain: { cols, rows, min: 50, max: 400, widthKm: 8.3, heightKm: 6.6, h: Buffer.from(u16.buffer).toString('base64') },
};
const dir = mkdtempSync(join(tmpdir(), 'sandtable-'));
const file = join(dir, 'p.html');
writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${rd('../../artifacts/kit/kit.css')}${rd('../../artifacts/war/war.css')}</style>
<body><div id="board" style="display:flex;width:900px;height:600px"></div>
<script>${rd('../../artifacts/war/sandtable.js')}</script>
<script>window.st = Sandtable.mount(document.getElementById('board'), ${JSON.stringify(battle)}, {}); st.show('real', { at: 0 });</script></body>`);

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1000, height: 700 } });
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
await p.goto(pathToFileURL(file).href);
await p.waitForTimeout(400);
const legend = await p.locator('.st-legend').innerText();
for (const t of ['Quân Minh', 'Quân Lam Sơn', 'Đường cái quan', 'Đồng lầy']) assert.ok(legend.includes(t), `chú thích có "${t}": ${legend}`);
assert.ok(!legend.includes('Đường tiếp tế'), 'roadLabel thay chữ mặc định');
assert.ok(await p.locator('.st-lbl.feat.place', { hasText: 'núi Thử' }).count(), 'địa danh kiểu place có nhãn');
await p.evaluate(() => st.show('real', { at: 1 }));
await p.waitForTimeout(200);
assert.deepEqual(errors, [], 'không lỗi khi vẽ marsh, place, troop');
await browser.close();
console.log('sandtable-kinds: ok');
