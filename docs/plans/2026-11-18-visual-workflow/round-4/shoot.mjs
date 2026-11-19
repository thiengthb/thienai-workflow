// Chụp 3 bản của vòng 4 (bảng dán luồng cho BA 6) sau khi xếp 2 thẻ: máy tính sáng 1180x760, điện thoại sáng và tối 390x844,
// ghép thành một ảnh 1180x760 @2x mỗi bản vào shots/ cạnh file này (không vào git). decision.json trỏ tới các ảnh đó.
//   node docs/plans/2026-11-18-visual-workflow/round-4/shoot.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium as findChromium } from '../../../../artifacts/kit/shoot.mjs';
const chromium = findChromium();
const dir = dirname(fileURLToPath(import.meta.url)), out = join(dir, 'shots');
mkdirSync(out, { recursive: true });
execFileSync(process.execPath, [join(dir, 'build.mjs'), join(out, 'pages')], { stdio: 'inherit' });
const plan = { a: [['a', 's1'], ['b', 's2']], b: [['a', 's1'], ['b', 's2']], c: [['a', 'p1'], ['b', 'a2']] };
const browser = await chromium.launch();
async function snap(v, w, h, scheme, path) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: scheme, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(pathToFileURL(join(out, 'pages', 'board.html')).href);
  await p.evaluate(() => document.fonts.ready);
  await p.click(`#rv button[data-v="${v}"]`);
  for (const [c, z] of plan[v]) { await p.click(`[data-pane="flow-${v}"] .bd-card[data-c="${c}"]`); await p.click(`[data-pane="flow-${v}"] .zone[data-z="${z}"]`); }
  await p.waitForTimeout(600);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path });
  await ctx.close();
}
for (const k of Object.keys(plan)) {
  await snap(k, 1180, 760, 'light', `${out}/${k}-desk.png`);
  await snap(k, 390, 844, 'light', `${out}/${k}-phone.png`);
  await snap(k, 390, 844, 'dark', `${out}/${k}-phone-dark.png`);
  writeFileSync(`${out}/${k}-combo.html`, `<!doctype html><html><head><style>
    body{margin:0;width:1180px;height:760px;background:#ecebe8;font:500 13px system-ui;color:#5d5b57;display:grid;grid-template-columns:auto auto auto;gap:20px;justify-content:center;align-items:center}
    figure{margin:0;display:grid;gap:8px} img{display:block;border:1px solid #d9d7d2;border-radius:8px}
    .d img{width:640px;height:412px}.p img{width:220px;height:476px;border-radius:16px}</style></head><body>
    <figure class="d"><figcaption>Máy tính · sáng</figcaption><img src="${k}-desk.png"></figure>
    <figure class="p"><figcaption>Điện thoại · sáng</figcaption><img src="${k}-phone.png"></figure>
    <figure class="p"><figcaption>Điện thoại · tối</figcaption><img src="${k}-phone-dark.png"></figure></body></html>`);
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 760 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(pathToFileURL(`${out}/${k}-combo.html`).href);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/${k}.png` });
  await ctx.close();
}
await browser.close();
console.log(`Đã chụp 3 bản vào ${out}`);
