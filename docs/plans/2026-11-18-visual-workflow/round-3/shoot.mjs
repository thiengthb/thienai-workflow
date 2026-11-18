// Chụp 3 bản của vòng gu 3 (style slide MLN122) trên trang mẫu học thuật: máy tính sáng 1180x760, điện thoại sáng và tối 390x844,
// ghép thành một ảnh 1180x760 @2x mỗi bản vào shots/ cạnh file này (không đưa vào git). decision.json trỏ tới các ảnh đó.
//
//   node docs/plans/2026-11-18-visual-workflow/round-3/shoot.mjs     chạy ở máy có Playwright, như make-decision
//   FONTSOURCE=<node_modules/@fontsource> node ...                   máy không tải được Google Fonts: dùng Onest, JetBrains Mono,
//                                                                     Bricolage Grotesque cài từ npm (thiếu thì chữ mono vỡ dấu tiếng Việt trong ảnh)
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium as findChromium } from '../../../../artifacts/kit/shoot.mjs';
import { execFileSync } from 'node:child_process';
const chromium = findChromium();
const dir = dirname(fileURLToPath(import.meta.url)), out = join(dir, 'shots');
mkdirSync(out, { recursive: true });
execFileSync(process.execPath, [join(dir, 'build.mjs'), join(out, 'pages')], { stdio: 'inherit' });
const KEYS = ['a', 'b', 'c'];
const fs = process.env.FONTSOURCE ? resolve(process.env.FONTSOURCE) : '';
const fontCss = fs && existsSync(fs) ? [['onest', [400, 500, 600, 700, 800]], ['jetbrains-mono', [500, 600]], ['bricolage-grotesque', [700, 800]]].flatMap(([f, ws]) => ws.map((w) =>
  readFileSync(`${fs}/${f}/${w}.css`, 'utf8').replace(/url\(\.\/files\//g, `url(file://${fs}/${f}/files/`))).join('\n') : '';
const browser = await chromium.launch();

async function snap(key, w, h, scheme, path) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: scheme });
  const p = await ctx.newPage();
  if (fontCss) await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await p.goto(pathToFileURL(join(out, 'pages', `${key}.html`)).href);
  if (fontCss) await p.addStyleTag({ content: fontCss });
  await p.evaluate(() => document.fonts.ready);
  // Điện thoại: cuộn tới hình 2 (biểu đồ) để thấy hình, quan điểm, nút; máy tính: đầu trang (tiêu đề, sơ đồ, biểu đồ).
  if (w < 760) await p.evaluate(() => { const h = document.querySelectorAll('.fig')[1]; window.scrollTo(0, h.getBoundingClientRect().top + scrollY - 16); });
  await p.waitForTimeout(1200);   // chờ các thẻ hiện dần xong
  await p.screenshot({ path });
  await ctx.close();
}

for (const k of KEYS) {
  await snap(k, 1180, 760, 'light', `${out}/${k}-desk.png`);
  await snap(k, 390, 844, 'light', `${out}/${k}-phone.png`);
  await snap(k, 390, 844, 'dark', `${out}/${k}-phone-dark.png`);
  const html = `<!doctype html><html><head><style>
    body{margin:0;width:1180px;height:760px;background:#ecebe8;font:500 13px system-ui;color:#5d5b57;display:grid;grid-template-columns:auto auto auto;gap:20px;justify-content:center;align-items:center}
    figure{margin:0;display:grid;gap:8px} img{display:block;border:1px solid #d9d7d2;border-radius:8px}
    .d img{width:640px;height:412px}.p img{width:220px;height:476px;border-radius:16px}</style></head><body>
    <figure class="d"><figcaption>Máy tính · sáng</figcaption><img src="${k}-desk.png"></figure>
    <figure class="p"><figcaption>Điện thoại · sáng</figcaption><img src="${k}-phone.png"></figure>
    <figure class="p"><figcaption>Điện thoại · tối</figcaption><img src="${k}-phone-dark.png"></figure></body></html>`;
  writeFileSync(`${out}/${k}-combo.html`, html);
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 760 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(pathToFileURL(`${out}/${k}-combo.html`).href);
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/${k}.png` });
  await ctx.close();
}
await browser.close();
console.log(`Đã chụp ${KEYS.length} bản vào ${out}`);
