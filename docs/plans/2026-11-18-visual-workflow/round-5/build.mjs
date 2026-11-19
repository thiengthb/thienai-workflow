// Dựng trang thử của vòng 5 (KH9 ga 3): bố cục trang kế hoạch theo loại nội dung. Ba loại (chờ duyệt, đang chạy, đã đóng),
// mỗi loại ba bản: A là trang hiện nay, B và C là bố cục mới. Bản mới là trang thật của make-plan.mjs, thêm dòng "Khối:"
// (khối nào, thứ tự nào) rồi lắp lại bằng variants.css và variants.js (chạy sau plan.js). Bản thien chọn sẽ chuyển vào
// artifacts/plan/ ở PR sau; bản không chọn thì bỏ, file ở đây đóng băng như các vòng trước.
//   node docs/plans/2026-11-18-visual-workflow/round-5/build.mjs [out]      ra <out>/<loại>-<bản>.html (không vào git)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url)), root = join(dir, '../../../..');
const { build } = await import(join(root, 'artifacts/plan/make-plan.mjs'));
const out = resolve(process.argv[2] || join(dir, 'shots/pages'));
mkdirSync(join(out, 'md'), { recursive: true });

// Ba file mẫu: KH9 lúc chờ duyệt (câu hỏi chưa trả lời), KH9 hôm nay (đang chạy, 5/10), KH6 (đã đóng sớm, 23/24).
export const VARIANTS = [
  { state: 'pending', key: 'a', name: 'A · Như hiện nay', blocks: '' },
  { state: 'pending', key: 'b', name: 'B · Phiếu hỏi trước', blocks: 'cau-hoi, tuyen, ban-do, them, nhat-ky · Vì: kế hoạch chờ duyệt, việc chính là trả lời' },
  { state: 'pending', key: 'c', name: 'C · Hỏi bên cạnh', blocks: 'dang-o, tuyen, ban-do, cau-hoi, them, nhat-ky · Vì: đọc kế hoạch bên trái, trả lời bên phải' },
  { state: 'running', key: 'a', name: 'A · Như hiện nay', blocks: '' },
  { state: 'running', key: 'b', name: 'B · Bảng tiến độ', blocks: 'dang-o, tuyen, ban-do, cau-hoi, them, nhat-ky · Vì: đang chạy, cần thấy việc nằm ở cột nào' },
  { state: 'running', key: 'c', name: 'C · Tuyến ngang', blocks: 'dang-o, tuyen, ban-do, cau-hoi, them, nhat-ky · Vì: đang chạy, ga đang làm là chính' },
  { state: 'closed', key: 'a', name: 'A · Như hiện nay', blocks: '' },
  { state: 'closed', key: 'b', name: 'B · Thẻ kết quả', blocks: 'dang-o, tuyen, phuong-an, them, nhat-ky · Vì: đã đóng, xem mỗi ga ra gì' },
  { state: 'closed', key: 'c', name: 'C · Ba cột tổng kết', blocks: 'tuyen, phuong-an, them, nhat-ky · Vì: đã đóng, xem được gì, đổi gì, còn lại gì' },
];

const js = readFileSync(join(dir, 'variants.js'), 'utf8');
// Icon variants.js dùng: lấy định nghĩa từ kit.css (pack.mjs đã bỏ icon trang gốc không nhắc tới).
const kitCss = readFileSync(join(root, 'artifacts/kit/kit.css'), 'utf8');
const icons = [...new Set([...js.matchAll(/ic-([a-z0-9-]+)/g)].map((m) => m[1]))].map((n) => {
  const m = new RegExp(`--ic-${n}\\s*:\\s*(url\\("[^"]*"\\))`).exec(kitCss);
  if (!m) throw new Error('kit.css không có icon ' + n);
  return `:root { --ic-${n}: ${m[1]}; } .ic-${n} { --i: var(--ic-${n}); }`;
}).join('\n');
const css = icons + '\n' + readFileSync(join(dir, 'variants.css'), 'utf8');
for (const v of VARIANTS) {
  let md = readFileSync(join(dir, 'samples', v.state + '.md'), 'utf8');
  if (v.blocks) md = md.replace(/^(Trạng thái:.*)$/m, `$1\nKhối: ${v.blocks}`);
  const mdPath = join(out, 'md', `${v.state}-${v.key}.md`);
  writeFileSync(mdPath, md);
  const page = join(out, `${v.state}-${v.key}`);
  // Ngày cố định để bản đồ ngày và chữ "hôm nay" giống nhau mỗi lần chụp.
  build(mdPath, page, { repo: 'thiengthb/thienai-workflow', today: '2026-11-19' });
  const html = readFileSync(join(page, 'index.html'), 'utf8');
  const lay = v.key === 'a' ? '' : `${v.state}-${v.key}`;
  writeFileSync(join(out, `${v.state}-${v.key}.html`), `<!doctype html><html lang="vi"${lay ? ` data-lay="${lay}"` : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
${html}
${lay ? `<style>${css}</style>\n<script>${js}</script>` : ''}
</body></html>\n`);
  console.log(`Đã dựng ${v.state}-${v.key}: ${v.name}`);
}

// Trang bấm thử: một trang đổi loại và bản bằng nút ở đầu, mở bản đó trong khung bên dưới (đăng chung với 9 trang).
const L = { pending: 'Chờ duyệt', running: 'Đang chạy', closed: 'Đã đóng' };
const seg = (id, items) => `<div class="seg" role="group" aria-label="${id === 'st' ? 'Loại kế hoạch' : 'Bản'}" id="${id}">${items.map(([k, t], i) =>
  `<button type="button" data-k="${k}" aria-pressed="${i === 0}">${t}</button>`).join('')}</div>`;
writeFileSync(join(out, 'index.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vòng 5 · bố cục trang kế hoạch</title>
<style>
:root { color-scheme: light; --ink: #1b1b1a; --muted: #6b6862; --line: #e7e3da; --card: #fff; --bg: #f7f6f2; --acc: #0f6e85; }
* { box-sizing: border-box; } body { margin: 0; font: 15px/1.5 Onest, system-ui, sans-serif; background: var(--bg); color: var(--ink); display: grid; grid-template-rows: auto 1fr; height: 100vh; }
header { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--line); background: var(--card); }
header b { font-weight: 600; margin-right: auto; }
.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 8px; padding: 2px; gap: 2px; }
.seg button { font: inherit; font-size: 13.5px; border: 0; background: none; padding: 8px 12px; border-radius: 6px; color: var(--muted); cursor: pointer; min-height: 40px; }
.seg button[aria-pressed="true"] { background: var(--acc); color: #fff; }
.seg button:focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
#name { width: 100%; font-size: 13px; color: var(--muted); }
iframe { width: 100%; height: 100%; border: 0; background: #fff; }
</style></head><body>
<header><b>Vòng 5 · bố cục trang kế hoạch</b>${seg('st', Object.entries(L))}${seg('v', [['a', 'A · Như hiện nay'], ['b', 'B'], ['c', 'C']])}<span id="name" role="status"></span></header>
<iframe id="f" title="Bản đang xem" src="pending-a.html"></iframe>
<script>
const N = ${JSON.stringify(Object.fromEntries(VARIANTS.map((v) => [v.state + '-' + v.key, v.name])))};
const L = ${JSON.stringify(L)};
let st = 'pending', v = 'a';
function go() {
  document.getElementById('f').src = st + '-' + v + '.html';
  for (const [id, cur] of [['st', st], ['v', v]]) document.querySelectorAll('#' + id + ' button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === cur)));
  document.querySelectorAll('#v button').forEach((b) => { b.textContent = N[st + '-' + b.dataset.k]; });
  document.getElementById('name').textContent = L[st] + ' · ' + N[st + '-' + v] + '. Trang thật, bấm được; câu trả lời ở đây không gửi đi đâu.';
}
document.getElementById('st').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { st = b.dataset.k; go(); } });
document.getElementById('v').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { v = b.dataset.k; go(); } });
go();
</script></body></html>
`);
console.log('Đã dựng trang bấm thử ' + join(out, 'index.html'));
