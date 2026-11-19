// Chụp 9 bản của vòng 5: máy tính 1180x760 và điện thoại 390x844, ghép thành một ảnh 1180x760 @2x mỗi bản vào shots/
// cạnh file này (không vào git). decision.json trỏ tới các ảnh đó. Chạy build.mjs trước (ra shots/pages/).
//   node docs/plans/2026-11-18-visual-workflow/round-5/shoot.mjs        thư mục có Playwright, như make-decision
//   FONTSOURCE=<node_modules/@fontsource> node ...                      máy không tải được Google Fonts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium as findChromium } from '../../../../artifacts/kit/shoot.mjs';
const chromium = findChromium();
const dir = dirname(fileURLToPath(import.meta.url)), out = join(dir, 'shots'), pages = join(out, 'pages');
mkdirSync(out, { recursive: true });
const fs = process.env.FONTSOURCE ? resolve(process.env.FONTSOURCE) : '';
const fontCss = fs && existsSync(fs) ? [['onest', [400, 500, 600, 700]], ['jetbrains-mono', [500]]].flatMap(([f, ws]) => ws.map((w) =>
  readFileSync(`${fs}/${f}/${w}.css`, 'utf8').replace(/url\(\.\/files\//g, `url(file://${fs}/${f}/files/`))).join('\n') : '';
// Chỗ chụp: null là màn đầu; selector là cuộn tới khối đó (chỗ mỗi bản khác nhau nhiều nhất).
const jobs = [
  ['pending-a', null, '#cau-hoi'], ['pending-b', null, null], ['pending-c', null, '.side-ask'],
  ['running-a', '#tuyen', '#tuyen'], ['running-b', null, '#tuyen'], ['running-c', '#tuyen', '#tuyen'],
  ['closed-a', '#tuyen', '#tuyen'], ['closed-b', '#tuyen', null], ['closed-c', null, '#tong-ket'],
];
const browser = await chromium.launch();
async function snap(file, w, h, sel, path) {
  const phone = w < 500;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: phone, hasTouch: phone, colorScheme: 'light' });
  const page = await ctx.newPage();
  if (fontCss) await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(pathToFileURL(file).href);
  if (fontCss) await page.addStyleTag({ content: fontCss });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  if (sel) await page.evaluate((s) => { const e = document.querySelector(s); const bar = innerWidth < 1160 ? 56 : 12;
    window.scrollTo(0, window.scrollY + e.getBoundingClientRect().top - bar); }, sel);
  await page.waitForTimeout(700);
  await page.screenshot({ path });
  await ctx.close();
}
for (const [key, desk, ph] of jobs) {
  await snap(join(pages, key + '.html'), 1180, 760, desk, `${out}/${key}-desk.png`);
  await snap(join(pages, key + '.html'), 390, 844, ph, `${out}/${key}-phone.png`);
  const html = `<!doctype html><html><head><style>${fontCss}
    body{margin:0;width:1180px;height:760px;background:#f3f1ec;font:500 13px Onest;color:#6b6862;display:grid;grid-template-columns:auto auto;gap:28px;justify-content:center;align-items:center}
    figure{margin:0;display:grid;gap:8px} img{display:block;border:1px solid #e7e3da;border-radius:8px;box-shadow:0 6px 18px rgba(27,27,26,.08)}
    .d img{width:800px;height:515px}.p img{width:310px;height:671px;border-radius:18px}</style></head><body>
    <figure class="d"><figcaption>Máy tính · 1180×760</figcaption><img src="${key}-desk.png"></figure>
    <figure class="p"><figcaption>Điện thoại · 390×844</figcaption><img src="${key}-phone.png"></figure></body></html>`;
  writeFileSync(`${out}/${key}-combo.html`, html);
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 760 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(`${out}/${key}-combo.html`).href);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${key}.png` });
  await ctx.close();
  console.log('ok', key);
}
await browser.close();
