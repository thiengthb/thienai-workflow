// Dựng trang thử của vòng 6 (KH9 ga 4, vòng gu bố cục đầu tiên cho mẫu khác): trang ôn thẻ và trang học ở khổ nửa màn
// hình (khoảng 860px, cạnh chat) và 2/3 màn hình (khoảng 950px, project beta). Mỗi trang ba bản: A là trang hiện nay, B và C
// là bố cục mới, lắp lại bằng <loại>-variants.css và <loại>-variants.js (chạy sau script của mẫu). Bản thien chọn sẽ viết
// gọn vào artifacts/review/ hay artifacts/lesson/ ở PR sau; bản không chọn thì bỏ, file ở đây đóng băng như các vòng trước.
//   node docs/plans/2026-11-18-visual-workflow/round-6/build.mjs [out]      ra <out>/<loại>-<bản>.html (không vào git)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url)), root = join(dir, '../../../..');
const out = resolve(process.argv[2] || join(dir, 'shots/pages'));
mkdirSync(out, { recursive: true });

// Mẫu: thẻ thật trong learning/cards.md ngày 20/11 (10 thẻ đến hạn, ba môn); buổi frontend 10 (có bàn thử ở bước 3–5).
// Thẻ đổi hộp sau này thì danh sách khác đi; muốn đúng như ảnh thì dựng từ cards.md ở commit của PR vòng này.
const TODAY = '2026-11-20', LESSON = 'learning/frontend/pages/lesson-10.html';
export const VARIANTS = [
  { kind: 'review', key: 'a', name: 'A · Như hiện nay' },
  { kind: 'review', key: 'b', name: 'B · Thẻ và hàng chờ' },
  { kind: 'review', key: 'c', name: 'C · Hai nửa thẻ' },
  { kind: 'lesson', key: 'a', name: 'A · Như hiện nay' },
  { kind: 'lesson', key: 'b', name: 'B · Tuyến bước' },
  { kind: 'lesson', key: 'c', name: 'C · Theo nội dung' },
];

const kitCss = readFileSync(join(root, 'artifacts/kit/kit.css'), 'utf8');
/** CSS và JS của một loại, kèm định nghĩa icon JS nhắc tới (pack.mjs đã bỏ icon trang gốc không dùng). */
function extra(kind) {
  const js = readFileSync(join(dir, kind + '-variants.js'), 'utf8'), css = readFileSync(join(dir, kind + '-variants.css'), 'utf8');
  const icons = [...new Set([...(js + css).matchAll(/(?<![a-z0-9-])(?:--)?ic-([a-z0-9-]+)/g)].map((m) => m[1]))].map((n) => {
    const m = new RegExp(`--ic-${n}\\s*:\\s*(url\\("[^"]*"\\))`).exec(kitCss);
    if (!m) throw new Error('kit.css không có icon ' + n);
    return `:root { --ic-${n}: ${m[1]}; }`;
  }).join('\n');
  return `<style>${icons}\n${css}</style>\n<script>${js}</script>\n`;
}

const { build: buildReview } = await import(join(root, 'artifacts/review/make-review.mjs'));
buildReview(join(root, 'learning/cards.md'), join(out, 'review-src'), { today: TODAY });
const reviewHtml = readFileSync(join(out, 'review-src/index.html'), 'utf8');
const { fill, SAMPLE_CARDS } = await import(join(root, 'artifacts/lesson/make-lesson.mjs'));
const lessonSrc = join(root, LESSON);
const lessonHtml = fill(readFileSync(lessonSrc, 'utf8'), '', lessonSrc, { cards: SAMPLE_CARDS });

for (const v of VARIANTS) {
  const lay = v.key === 'a' ? '' : `${v.kind}-${v.key}`;
  let html;
  if (v.kind === 'review') {
    html = `<!doctype html><html lang="vi"${lay ? ` data-lay="${lay}"` : ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
${reviewHtml}
${lay ? extra('review') : ''}</body></html>\n`;
  } else {
    html = lay ? lessonHtml.replace(/<html lang="vi">/, `<html lang="vi" data-lay="${lay}">`).replace(/<\/body>\s*<\/html>\s*$/, () => extra('lesson') + '</body>\n</html>\n') : lessonHtml;
    if (lay && !html.includes(`data-lay="${lay}"`)) throw new Error('Không gắn được data-lay vào trang học');
  }
  writeFileSync(join(out, `${v.kind}-${v.key}.html`), html);
  console.log(`Đã dựng ${v.kind}-${v.key}: ${v.name}`);
}

// Trang bấm thử: đổi trang, bản và bề ngang khung bằng nút ở đầu, mở bản đó trong khung bên dưới (đăng chung với 6 trang).
const L = { review: 'Ôn thẻ', lesson: 'Trang học' };
const seg = (id, label, items) => `<div class="seg" role="group" aria-label="${label}" id="${id}">${items.map(([k, t], i) =>
  `<button type="button" data-k="${k}" aria-pressed="${i === 0}">${t}</button>`).join('')}</div>`;
writeFileSync(join(out, 'index.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vòng 6 · ôn thẻ và trang học ở nửa màn hình</title>
<style>
:root { color-scheme: light; --ink: #1c1c1b; --muted: #62625e; --line: #e4e4e1; --card: #fff; --bg: #f4f4f3; }
* { box-sizing: border-box; } body { margin: 0; font: 15px/1.5 Onest, system-ui, sans-serif; background: var(--bg); color: var(--ink); display: grid; grid-template-rows: auto 1fr; height: 100vh; }
header { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--line); background: var(--card); }
header b { font-weight: 600; margin-right: auto; }
.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 8px; padding: 2px; gap: 2px; background: var(--card); }
.seg button { font: inherit; font-size: 13.5px; border: 0; background: none; padding: 8px 12px; border-radius: 6px; color: var(--muted); cursor: pointer; min-height: 40px; }
.seg button[aria-pressed="true"] { background: var(--ink); color: #fff; }
.seg button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
#name { width: 100%; font-size: 13px; color: var(--muted); }
.stagebox { overflow: auto; display: flex; justify-content: center; }
iframe { width: 100%; height: 100%; border: 0; background: #fff; flex: none; }
iframe.fixed { border-left: 1px solid var(--line); border-right: 1px solid var(--line); }
</style></head><body>
<header><b>Vòng 6 · ôn thẻ và trang học</b>${seg('k', 'Trang', Object.entries(L))}${seg('v', 'Bản', [['a', 'A · Như hiện nay'], ['b', 'B'], ['c', 'C']])}${seg('w', 'Bề ngang khung', [['', 'Vừa khung'], ['860', '860px'], ['950', '950px']])}<span id="name" role="status"></span></header>
<div class="stagebox"><iframe id="f" title="Bản đang xem" src="review-a.html"></iframe></div>
<script>
const N = ${JSON.stringify(Object.fromEntries(VARIANTS.map((v) => [v.kind + '-' + v.key, v.name])))};
const L = ${JSON.stringify(L)};
let k = 'review', v = 'a', w = '';
function go() {
  const f = document.getElementById('f');
  if (!f.src.endsWith(k + '-' + v + '.html')) f.src = k + '-' + v + '.html';
  f.style.width = w ? w + 'px' : ''; f.classList.toggle('fixed', !!w);
  for (const [id, cur] of [['k', k], ['v', v], ['w', w]]) document.querySelectorAll('#' + id + ' button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === cur)));
  document.querySelectorAll('#v button').forEach((b) => { b.textContent = N[k + '-' + b.dataset.k]; });
  document.getElementById('name').textContent = L[k] + ' · ' + N[k + '-' + v] + '. Trang thật, bấm được; câu trả lời ở đây không gửi đi đâu.';
}
for (const [id, set] of [['k', (x) => { k = x; }], ['v', (x) => { v = x; }], ['w', (x) => { w = x; }]])
  document.getElementById(id).addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { set(b.dataset.k); go(); } });
go();
</script></body></html>
`);
console.log('Đã dựng trang bấm thử ' + join(out, 'index.html'));
