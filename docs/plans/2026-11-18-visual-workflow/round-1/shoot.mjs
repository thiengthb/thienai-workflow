// Chụp 3 bản của vòng gu 1 (quen, một nấc, thật xa): máy tính 1180x760 và điện thoại 390x844,
// ghép thành một ảnh 1180x760 @2x mỗi bản vào shots/ cạnh file này (không đưa vào git). decision.json trỏ tới các ảnh đó.
//
//   node docs/plans/2026-11-18-visual-workflow/round-1/shoot.mjs     chạy ở thư mục có Playwright, như make-decision
//   FONTSOURCE=<node_modules/@fontsource> node ...                   máy không tải được Google Fonts: dùng Onest cài từ npm
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium as findChromium } from '../../../../artifacts/kit/shoot.mjs';
const chromium = findChromium();
const dir = dirname(fileURLToPath(import.meta.url)), out = join(dir, 'shots');
mkdirSync(out, { recursive: true });
const fs = process.env.FONTSOURCE || '';
const fontCss = fs && existsSync(fs) ? [['onest', [400, 500, 600, 700]], ['jetbrains-mono', [500]]].flatMap(([f, ws]) => ws.map((w) =>
  readFileSync(`${fs}/${f}/${w}.css`, 'utf8').replace(/url\(\.\/files\//g, `url(file://${fs}/${f}/files/`))).join('\n') : '';
const jobs = [
  { key: 'quen', file: 'quen.html', desk: null, phone: 'h2:nth-of-type(3)' },
  { key: 'mot-nac', file: 'mot-nac.html', desk: null, phone: '#tuyen' },
  { key: 'that-xa', file: 'that-xa.html', desk: '.step:nth-of-type(2)', phone: '.step:nth-of-type(2)' },
];
const browser = await chromium.launch();
async function snap(file, w, h, sel, path) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: 'light' });
  const page = await ctx.newPage();
  if (fontCss) await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(pathToFileURL(`${dir}/${file}`).href);
  if (fontCss) await page.addStyleTag({ content: fontCss });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  if (sel) await page.evaluate((s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); const st = document.querySelector('.stage'); if (s.startsWith('.step') && innerWidth < 760) { const k = e.querySelector('.k').getBoundingClientRect(); window.scrollTo(0, window.scrollY + k.top - st.getBoundingClientRect().height - 20); return; } window.scrollTo(0, window.scrollY + (s.startsWith('.step') ? r.top + Math.min(r.height, window.innerHeight) / 2 - window.innerHeight / 2 : r.top - (s.startsWith('#') ? 60 : 8))); }, sel);
  await page.waitForTimeout(700);
  await page.screenshot({ path });
  await ctx.close();
}
for (const j of jobs) {
  await snap(j.file, 1180, 760, j.desk, `${out}/${j.key}-desk.png`);
  await snap(j.file, 390, 844, j.phone, `${out}/${j.key}-phone.png`);
  const html = `<!doctype html><html><head><style>${fontCss}
    body{margin:0;width:1180px;height:760px;background:#f3f1ec;font:500 13px Onest;color:#6b6862;display:grid;grid-template-columns:auto auto;gap:28px;justify-content:center;align-items:center}
    figure{margin:0;display:grid;gap:8px} img{display:block;border:1px solid #e7e3da;border-radius:8px;box-shadow:0 6px 18px rgba(27,27,26,.08)}
    .d img{width:800px;height:515px}.p img{width:310px;height:671px;border-radius:18px}</style></head><body>
    <figure class="d"><figcaption>Máy tính · 1180×760</figcaption><img src="${j.key}-desk.png"></figure>
    <figure class="p"><figcaption>Điện thoại · 390×844</figcaption><img src="${j.key}-phone.png"></figure></body></html>`;
  writeFileSync(`${out}/${j.key}-combo.html`, html);
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 760 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(`${out}/${j.key}-combo.html`).href);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${j.key}.png` });
  await ctx.close();
  console.log('ok', j.key);
}
await browser.close();
