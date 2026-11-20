// Vòng gu 7 (20/11/2026, sớm hơn lịch 04/12 vì thien xin): màu nhấn theo claude.ai. Ba bản trên hai trang thật:
// A là màu hiện nay (trắng đen, xám của claude.ai), B và C thêm biến màu ở tones.css (đọc đầu file đó).
// Dựng trang kế hoạch đang chạy (artifacts/plan/fixture-running.md) và trang học frontend 10, chụp ở 860x760 @2x:
// trang kế hoạch chế độ tối (app của thien để tối), trang học chế độ sáng, ghép thành một ảnh mỗi bản vào shots/ (không vào git).
//   node docs/plans/2026-11-18-visual-workflow/round-7/build.mjs
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium as findChromium } from '../../../../artifacts/kit/shoot.mjs';

const dir = dirname(fileURLToPath(import.meta.url)), repo = join(dir, '../../../..');
const out = join(dir, 'shots'), pages = join(out, 'pages');
mkdirSync(pages, { recursive: true });
export const TONES = [
  { key: 'a', name: 'A · Như hiện nay' },
  { key: 'b', name: 'B · Nhấn như app' },
  { key: 'c', name: 'C · Màu theo nghĩa' },
];
const tones = readFileSync(join(dir, 'tones.css'), 'utf8');
// Đóng băng: dựng từ main lúc làm vòng 7 (BASE, trước khi bản B vào kit), không từ cây đang làm; nếu không, bản A
// "như hiện nay" sẽ ra màu của B. Lấy artifacts/, learning/ và templates/ (parse-plan dùng progress-page.mjs) của BASE bằng git archive (clone nông thì
// git fetch --depth=1 origin <BASE> trước).
const BASE = 'abd04f7bb8042ca8734c4eabce1d49533c651492';
const root = mkdtempSync(join(tmpdir(), 'round7-base-'));
const tmp = mkdtempSync(join(tmpdir(), 'round7-'));
process.on('exit', () => { rmSync(tmp, { recursive: true, force: true }); rmSync(root, { recursive: true, force: true }); });
execFileSync('tar', ['-x', '-C', root], { input: execFileSync('git', ['-C', repo, 'archive', BASE, 'artifacts', 'learning', 'templates'], { maxBuffer: 1 << 28 }) });
const { build: buildPlan } = await import(pathToFileURL(join(root, 'artifacts/plan/make-plan.mjs')).href);
const { fill, SAMPLE_CARDS } = await import(pathToFileURL(join(root, 'artifacts/lesson/make-lesson.mjs')).href);
buildPlan(join(root, 'artifacts/plan/fixture-running.md'), tmp, { today: '2026-11-20' });
const planHtml = readFileSync(join(tmp, 'index.html'), 'utf8');
const lessonSrc = join(root, 'learning/frontend/pages/lesson-10.html');
const lessonHtml = fill(readFileSync(lessonSrc, 'utf8'), '', lessonSrc, { cards: SAMPLE_CARDS });

// make-plan ra phần thân trang (không có <html>): bọc lại như vòng 6 bọc trang ôn thẻ.
const whole = (html) => /<html\b/i.test(html) ? html
  : `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${html}\n</body></html>\n`;
const withTone = (raw, key) => {
  const html = whole(raw);
  if (key === 'a') return html;
  const h = html.replace(/<html lang="vi"/, `<html lang="vi" data-tone="${key}"`).replace(/<\/head>/, `<style>${tones}</style>\n</head>`);
  if (!h.includes(`data-tone="${key}"`) || !h.includes('Vòng gu 7')) throw new Error('Không gắn được bộ màu vào trang');
  return h;
};
for (const t of TONES) {
  writeFileSync(join(pages, `plan-${t.key}.html`), withTone(planHtml, t.key));
  writeFileSync(join(pages, `lesson-${t.key}.html`), withTone(lessonHtml, t.key));
}

// Trang học: bước 5 (Ý chính, có bàn thử và nút chính), như vòng 6.
async function lessonStep(p, n) {
  await p.evaluate((n) => {
    const steps = [...document.querySelectorAll('.step')];
    steps.forEach((s) => s.classList.toggle('on', s.dataset.s == n));
    const c = document.getElementById('cnt'); if (c) c.textContent = `${steps.findIndex((s) => s.dataset.s == n) + 1}/${steps.length}`;
  }, n);
}
const chromium = findChromium();
const browser = await chromium.launch();
async function snap(file, scheme, act, path) {
  const ctx = await browser.newContext({ viewport: { width: 860, height: 760 }, deviceScaleFactor: 2, colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(file).href);
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important} *{animation:none!important;transition:none!important}' });
  if (act) await act(page);
  await page.waitForTimeout(400);
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path });
  await ctx.close();
}
for (const t of TONES) {
  await snap(join(pages, `plan-${t.key}.html`), 'dark', null, join(out, `plan-${t.key}.png`));
  await snap(join(pages, `lesson-${t.key}.html`), 'light', (p) => lessonStep(p, 5), join(out, `lesson-${t.key}.png`));
  // Ghép: nền ngoài là màu khung chat claude.ai (#191919 trái, trắng phải) để thấy trang có hợp với app không.
  const html = `<!doctype html><html><head><style>
    body{margin:0;width:1180px;height:620px;display:grid;grid-template-columns:1fr 1fr;font:500 13px system-ui,"Segoe UI",sans-serif}
    figure{margin:0;display:grid;place-content:center;gap:8px;justify-items:center}
    .d{background:#191919;color:#9b9b9b}.l{background:#fff;color:#666}
    img{display:block;width:540px;height:477px;border-radius:8px}.d img{border:1px solid #303030}.l img{border:1px solid #e6e6e6}</style></head><body>
    <figure class="d"><img src="plan-${t.key}.png"><figcaption>Trang kế hoạch, chế độ tối</figcaption></figure>
    <figure class="l"><img src="lesson-${t.key}.png"><figcaption>Trang học, chế độ sáng</figcaption></figure></body></html>`;
  writeFileSync(join(out, `combo-${t.key}.html`), html);
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 620 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(join(out, `combo-${t.key}.html`)).href);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, `tone-${t.key}.png`) });
  await ctx.close();
  console.log(`Đã chụp ${t.name}`);
}
await browser.close();
