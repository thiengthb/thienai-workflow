// Chụp 6 bản của vòng 6 ở hai khổ thien hay mở: 860x760 (nửa màn hình cạnh chat) và 950x760 (2/3 màn hình, project beta),
// ghép thành một ảnh 1180x620 @2x mỗi bản vào shots/ cạnh file này (không vào git). decision.json trỏ tới các ảnh đó.
// Chạy build.mjs trước (ra shots/pages/).
//   node docs/plans/2026-11-18-visual-workflow/round-6/shoot.mjs        thư mục có Playwright, như make-decision
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

// Trang ôn thẻ: chụp lúc đang giữa lượt (thẻ 1 nhớ, thẻ 2 quên, thẻ 3 đã gõ và lật đáp án), chỗ các bản khác nhau nhiều nhất.
const MINE = ['Mưa làm đường lầy, quân Minh đi xa và mang nặng nên khó hơn.', 'Không nhớ rõ.', 'Nhờ dấu cộng trừ và chữ, không chỉ nhờ màu.'];
async function reviewState(p) {
  for (let i = 0; i < 3; i++) {
    await p.fill('#mine', MINE[i]);
    await p.click('#show');
    if (i < 2) await p.click(i === 0 ? '#yes' : '#no');
  }
}
// Trang học: 860 chụp bước có sân khấu (bước 5, Ý chính), 950 chụp bước chữ (bước 7, Tự nói lại).
async function lessonStep(p, n) {
  await p.evaluate((n) => {
    const steps = [...document.querySelectorAll('.step')];
    steps.forEach((s) => s.classList.toggle('on', s.dataset.s == n));
    const c = document.getElementById('cnt'); if (c) c.textContent = `${steps.findIndex((s) => s.dataset.s == n) + 1}/${steps.length}`;
  }, n);
}
const jobs = [
  ...['a', 'b', 'c'].map((k) => [`review-${k}`, reviewState, reviewState, 'Đang giữa lượt: thẻ 1 nhớ, thẻ 2 quên, thẻ 3 vừa lật đáp án']),
  ...['a', 'b', 'c'].map((k) => [`lesson-${k}`, (p) => lessonStep(p, 5), (p) => lessonStep(p, 7), 'Trái: bước có bàn thử (Ý chính). Phải: bước chữ (Tự nói lại)']),
];

const browser = await chromium.launch();
async function snap(file, w, h, act, path) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: 'light' });
  const page = await ctx.newPage();
  if (fontCss) await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(pathToFileURL(file).href);
  if (fontCss) await page.addStyleTag({ content: fontCss });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important} *{animation:none!important}' });
  await act(page);
  await page.waitForTimeout(500);
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path });
  await ctx.close();
}
for (const [key, act860, act950, cap] of jobs) {
  await snap(join(pages, key + '.html'), 860, 760, act860, `${out}/${key}-860.png`);
  await snap(join(pages, key + '.html'), 950, 760, act950, `${out}/${key}-950.png`);
  const html = `<!doctype html><html><head><style>${fontCss}
    body{margin:0;width:1180px;height:620px;background:#f4f4f3;font:500 13px Onest,sans-serif;color:#62625e;display:grid;grid-template-columns:auto auto;gap:24px;justify-content:center;align-content:center}
    figure{margin:0;display:grid;gap:8px} img{display:block;border:1px solid #e4e4e1;border-radius:8px;box-shadow:0 6px 18px rgba(28,28,27,.08)}
    .a img{width:540px;height:477px}.b img{width:596px;height:477px}p{grid-column:1/-1;margin:0;text-align:center}</style></head><body>
    <figure class="a"><figcaption>Nửa màn hình · 860px</figcaption><img src="${key}-860.png"></figure>
    <figure class="b"><figcaption>2/3 màn hình · 950px</figcaption><img src="${key}-950.png"></figure><p>${cap}</p></body></html>`;
  writeFileSync(`${out}/${key}-combo.html`, html);
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 620 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(`${out}/${key}-combo.html`).href);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${key}.png` });
  await ctx.close();
  console.log('ok', key);
}
await browser.close();
