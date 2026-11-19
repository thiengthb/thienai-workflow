// Dựng trang thử của vòng 4 (bảng dán luồng cho BA 6): một trang, ba bản A, B, C đổi bằng nút ở đầu, bấm xếp thẻ được thật
// (artifacts/it/it-stage.js). Ra out/board.html (không vào git), rồi shoot.mjs chụp.
//   node docs/plans/2026-11-18-visual-workflow/round-4/build.mjs [out]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url)), root = join(dir, '../../../..');
const { fill } = await import(join(root, 'artifacts/lesson/make-lesson.mjs'));
const out = resolve(process.argv[2] || join(dir, 'shots/pages'));
mkdirSync(out, { recursive: true });
const tpl = readFileSync(join(root, 'artifacts/it/template-ba.html'), 'utf8');

// Cùng 4 thẻ cho cả ba bản: luồng báo vắng cho phụ huynh (app điểm danh của bài BA 3). Người: cam, app: xanh (B, C).
const cards = (inked) => [
  ['c', 'p', '?', 'SV đồng ý cho gửi?', '#be185d', 'Phải hỏi sinh viên trước khi có gì để gửi.'],
  ['a', 'p', 'GV', 'Điểm danh', '#2563eb', ''],
  ['d', 'a', '✉', 'Gửi tin cho PH', '#be185d', ''],
  ['b', 'a', '⚙', 'Đếm buổi vắng', '#475569', '']]
  .map(([c, k, i, t, col, why]) => `<button class="bd-card" type="button" data-c="${c}" data-kind="${k}"${inked ? '' : ` style="--c:${col}"`}${why ? ` data-why="${why}"` : ''}><i>${i}</i>${t}</button>`).join('\n        ');
const zones4 = (cls) => [1, 2, 3, 4].map((n) => `<button class="zone" type="button" data-z="s${n}" data-n="${n}" data-reset><span>Bước ${n}</span></button>`).join('');
const paneA = `<div class="pane board" data-pane="flow-a" data-answer='{"a":"s1","b":"s2","c":"s3","d":"s4"}'>
      <div class="bd-area"><div class="zones flow">${zones4()}</div><div class="tray"><span class="label">Các bước</span></div>
        ${cards(false)}</div></div>`;
const paneB = `<div class="pane board inked" data-pane="flow-b" data-answer='{"a":"s1","b":"s2","c":"s3","d":"s4"}'>
      <div class="legend-ink"><span><i class="p"></i>Người làm</span><span><i class="a"></i>App làm</span></div>
      <div class="bd-area"><div class="zones flow line">${zones4()}</div><div class="tray"><span class="label">Các bước</span></div>
        ${cards(true)}</div></div>`;
const lanes = ['p', 'a'].flatMap((l) => [1, 2, 3, 4].map((n) => `<button class="zone" type="button" data-z="${l}${n}" data-reset style="--lr:${l === 'p' ? 1 : 2};--sc:${n}"><span>${l === 'p' ? 'Người' : 'App'}, bước ${n}</span></button>`)).join('');
const paneC = `<div class="pane board inked" data-pane="flow-c" data-answer='{"a":"p1","b":"a2","c":"p3","d":"a4"}'>
      <div class="bd-area"><div class="zones lanes">${lanes}
          ${[1, 2, 3, 4].map((n) => `<span class="col" data-col="${n}" style="--n:${n}">${n}</span>`).join('')}
          <span class="lane p">Người</span><span class="lane a">App</span></div>
        <div class="tray"><span class="label">Các bước</span></div>
        ${cards(true)}</div></div>`;

const step = (v, on, text) => `<section class="step${on ? ' on' : ''}" data-s="${v}" data-stage="flow-${v}">
    <h2>Luồng báo vắng cho phụ huynh</h2>
    <p>${text}</p>
    <button class="btn" type="button" data-check="flow-${v}" data-need="placed-flow-${v}" disabled>Kiểm tra</button>
    <p class="fb" data-echo="flow-${v}" data-same="${v === 'c' ? 'Đúng bước và đúng làn. Hai bước của app nằm xen giữa việc của người: chỗ chuyển làn là chỗ hay tắc.' : 'Đúng thứ tự. Bước hỏi sinh viên đồng ý chỉ lộ ra khi xét đủ các bên.'}"></p>
  </section>`;
const bar = `<div class="round-bar"><div class="seg" role="group" aria-label="Bản" id="rv">${[['a', 'A · Bảng đang dùng'], ['b', 'B · Tuyến ga'], ['c', 'C · Làn bơi']]
  .map(([v, t]) => `<button type="button" data-v="${v}" aria-pressed="${v === 'a'}" data-noreplay>${t}</button>`).join('')}</div></div>`;

const head = tpl.slice(0, tpl.indexOf('<div id="stage">'));
const tail = tpl.slice(tpl.indexOf('<script id="kit-js">'));
let html = head.replace('<title>__TITLE__</title>', '<title>Vòng 4 · bảng dán luồng</title>')
  .replace('/* Phần riêng của bài viết ở đây. */', () => readFileSync(join(dir, 'variants.css'), 'utf8'))
  .replace('<span>BA · __TITLE__</span><span id="cnt">1/9</span>', '<span>Vòng 4 · bảng dán luồng cho BA 6</span><span id="cnt">thử</span>')
  .replace(/__ID__/g, 'ba-flow-round-4').replace(/__TITLE__/g, 'Vòng 4 · bảng dán luồng')
  + `${bar}\n  <div id="stage">\n    ${paneA}\n    ${paneB}\n    ${paneC}\n  </div>\n`
  + step('a', true, 'Xếp 4 thẻ theo thứ tự: bấm một thẻ, rồi bấm ô của bước.') + '\n'
  + step('b', false, 'Xếp 4 thẻ theo thứ tự: bấm một thẻ, rồi bấm ga. Ga có thẻ thì hiện dấu tick. Cam là việc người làm, xanh là việc app làm.') + '\n'
  + step('c', false, 'Xếp 4 thẻ vào đúng bước và đúng làn: ai làm bước đó, người hay app? Bấm một thẻ, rồi bấm ô.') + '\n</div>\n'
  + tail.replace('/* Phần riêng của bài: ghi thêm vào R, gọi Lesson.done(\'<khóa>\') khi một việc xong. */', `
/* Vòng 4: nút đổi bản (bật bước của bản đó, sân khấu đổi theo); ô có thẻ thì thêm .filled (bản B, C; chọn bản nào thì chuyển vào it-stage.js). */
(() => {
  const g = document.getElementById('rv');
  g.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return;
    document.querySelectorAll('.step').forEach((s) => s.classList.toggle('on', s.dataset.s === b.dataset.v));
    g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const n = document.getElementById('cnt'); if (n) n.textContent = b.textContent.split(' · ')[0]; });
  const mark = () => document.querySelectorAll('.board').forEach((bd) => {
    const place = ((window.R.boards || {})[bd.dataset.pane] || {}).place || {}, used = new Set(Object.values(place));
    bd.querySelectorAll('.zone').forEach((z) => z.classList.toggle('filled', used.has(z.dataset.z)));
    bd.querySelectorAll('.col').forEach((c) => c.classList.toggle('done', ['p', 'a'].some((l) => used.has(l + c.dataset.col))));
  });
  document.addEventListener('click', () => setTimeout(mark, 0));
})();`);
html = fill(html, 'ba-flow-round-4', join(root, 'learning/ba/pages/fixture.html'), {});
writeFileSync(join(out, 'board.html'), html);
console.log('Đã dựng ' + join(out, 'board.html'));
