#!/usr/bin/env node
// Mở từng trang trong trình duyệt và bắt lỗi trước khi thien thấy. CI chạy file này ở mọi PR (.github/workflows/test.yml).
//
//   node artifacts/kit/check-pages.mjs [trang.html ...] [--out <thư-mục-ảnh>]
//
// Không đưa trang nào: kiểm mọi trang bài trong learning/*/pages/ và một trang mẫu dựng từ mỗi mẫu trong artifacts/
// (bài thường, bài chiến tranh, bài frontend, bài BA, trang chọn phương án, trang so sánh, trang ôn thẻ, trang mẫu thành phần).
// Mỗi trang mở ở 3 khổ (1180x760 khung xem trên claude.ai, 820x1180 máy tính bảng, 390x844 điện thoại), cả tối lẫn sáng,
// hiện hết mọi bước, giả có Claude để hiện cả các ô hỏi Claude. Báo LỖI khi:
//   1. Có lỗi JavaScript.
//   2. Trang tràn ngang (phải cuộn sang phải).
//   3. Một khung to trên màn mà mọi thứ bên trong bị ẩn: trông như ô trắng trống (lỗi màn điện thoại trắng 2026-11-14).
//   4. Chữ quá mờ so với nền: tương phản dưới 3:1. Dưới 4.5:1 với chữ nhỏ thì chỉ cảnh báo.
//   5. Còn chữ giữ chỗ của mẫu như __TITLE__ (chỉ với trang trong repo).
//   6. Thiếu thẻ viewport: điện thoại dựng trang rộng 980px rồi thu nhỏ.
//   7. axe-core (kiểm truy cập theo WCAG 2.1 AA) thấy lỗi mức nặng: nút không có tên, ô nhập không nhãn, aria sai...
//      Lỗi mức vừa và nhẹ chỉ cảnh báo. Độ tương phản do mục 4 kiểm, nên tắt luật đó của axe.
// Ảnh chụp cả trang ở mọi khổ nằm trong thư mục ảnh (mặc định .check-pages/), CI đính kèm vào lần chạy để xem lại.
// Cần Playwright (máy Claude cloud có sẵn; CI cài trong bước riêng) và axe-core (npm install --no-save axe-core@4.14.0;
// thiếu thì bỏ qua mục 7 và nói rõ).
import { createRequire } from 'node:module';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { join, resolve, dirname, basename, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');

export const SIZES = [
  { name: '1180', viewport: { width: 1180, height: 760 } },
  { name: '820', viewport: { width: 820, height: 1180 }, touch: true },
  { name: '390', viewport: { width: 390, height: 844 }, touch: true },
];
export const SCHEMES = ['dark', 'light'];

/** Mọi trang bài đã có trong repo. */
export function repoPages() {
  const base = join(root, 'learning');
  return readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(base, d.name, 'pages')))
    .flatMap((d) => readdirSync(join(base, d.name, 'pages')).filter((f) => f.endsWith('.html')).sort().map((f) => join(base, d.name, 'pages', f)));
}

/** Dựng một trang mẫu từ mỗi mẫu trong artifacts/ vào dir. Trả về [{ name, file }]. */
export async function buildFixtures(dir, browser) {
  const { fill } = await import('../lesson/make-lesson.mjs');
  const out = [];
  const lessons = { lesson: '../lesson/template.html', war: '../war/template.html', frontend: '../it/template-frontend.html', ba: '../it/template-ba.html' };
  for (const [name, tpl] of Object.entries(lessons)) {
    const html = readFileSync(join(here, tpl), 'utf8').replace(/__ID__/g, `demo-${name}`).replace(/__[A-Z][A-Z0-9_]*__/g, 'Trang mẫu');
    // file trận của bài chiến tranh tính đường dẫn từ chỗ trang nằm trong learning/<môn>/pages/
    const file = join(dirname(join(here, tpl)), name === 'war' ? '../../learning/war/pages/fixture.html' : 'fixture.html');
    const page = join(dir, `${name}.html`);
    // Bài thường kèm hai chỗ còn vướng cố định, để lời dặn có phần này được kiểm (ask-prompts).
    const stuck = name === 'lesson' ? ['2026-11-12, buổi 5: chưa bắt được chữ màu và biểu tượng nhỏ giành mắt', '2026-11-12, buổi 5: hỏi Claude ở bước "Thử trước": "màu trạng thái có tính là màu nhấn không?"'] : undefined;
    writeFileSync(page, fill(html, `demo-${name}`, file, { stuck }));
    out.push({ name, file: page });
  }
  // Ảnh giả cho trang chọn phương án và trang so sánh: chụp một khối màu có chữ.
  const ctx = await browser.newContext({ viewport: { width: 600, height: 400 } });
  const p = await ctx.newPage();
  const shot = async (f, label, bg) => {
    await p.setContent(`<body style="margin:0;display:grid;place-items:center;height:100vh;background:${bg};font:600 40px sans-serif;color:#fff">${label}</body>`);
    await p.screenshot({ path: join(dir, f) });
  };
  await shot('a.png', 'Phương án A', '#3b6ea5'); await shot('b.png', 'Phương án B', '#4f8a5b'); await shot('c.png', 'Phương án C', '#9a5b3b');
  await ctx.close();
  const { build: decide } = await import('../decide/make-decision.mjs');
  decide({ id: 'demo-decide', question: 'Chọn bố cục nào cho trang học?', context: 'Trang mẫu để kiểm.', options: [
    { key: 'a', name: 'A · Một cột', image: 'a.png', summary: 'Mọi thứ xếp dọc.', pros: ['Gọn trên điện thoại'], cons: ['Dài'] },
    { key: 'b', name: 'B · Hai cột', image: 'b.png', summary: 'Sân khấu bên trái, chữ bên phải.', pros: ['Thấy cả hai'], cons: ['Chật ở khổ nhỏ'] },
    { key: 'c', name: 'C · Thẻ', image: 'c.png', summary: 'Mỗi bước một thẻ.', pros: ['Rõ từng bước'], cons: ['Nhiều lần bấm'] }],
    criteria: [{ name: 'Điện thoại', values: { a: 'tốt', b: 'kém', c: 'vừa' } }], recommend: { key: 'a', why: 'Gọn nhất.' } }, dir, join(dir, 'decide'));
  // preview.html: trang bọc khung như khi đăng lên claude.ai (có thẻ viewport), để khổ điện thoại hiện đúng
  out.push({ name: 'decide', file: join(dir, 'decide/preview.html') });
  const { build: round } = await import('../compare/make-round.mjs');
  round({ id: 'demo-compare', title: 'Trang mẫu so sánh', items: [{ id: 'home', label: 'Trang chủ', sides: [
    { key: 'old', name: 'Cũ', file: 'a.png' }, { key: 'new', name: 'Mới', file: 'b.png' }] }] }, dir, join(dir, 'compare'));
  out.push({ name: 'compare', file: join(dir, 'compare/preview.html') });
  // Trang ôn thẻ: bảng thẻ và bài giả cố định, để kết quả không đổi theo ngày hay theo learning/cards.md.
  writeFileSync(join(dir, 'lesson-1.md'), '# Bài 1\n\nHọc ngày 2026-11-01\n\n## Ý chính\n\nMỗi màn chỉ một chỗ dùng màu nhấn đặc; phần phụ để nhạt.\n\n'
    + '## Tự kiểm\n\n1. Hai nút đặc cùng màu đặt cạnh nhau thì sao?\n   <details><summary>Đáp án</summary>Mắt không biết bấm nút nào. Để một nút đặc, nút kia viền.</details>\n');
  writeFileSync(join(dir, 'cards.md'), '| Thẻ | Môn | Câu hỏi | Đáp án ở | Hộp | Hỏi lại |\n|---|---|---|---|---|---|\n'
    + '| F1 | Frontend | Hai nút đặc cùng màu cạnh nhau thì sao? | [bài 1](lesson-1.md) | 2 | 2026-11-13 |\n'
    + '| F2 | Frontend | Muốn nút chính nổi hơn mà không thêm màu thì làm gì? | [bài 1](lesson-1.md) | 1 | 2026-11-14 |\n');
  const { build: review } = await import('../review/make-review.mjs');
  review(join(dir, 'cards.md'), join(dir, 'review'), { today: '2026-11-14' });
  out.push({ name: 'review', file: join(dir, 'review/preview.html') });
  // Trang mẫu thành phần: mọi mảnh dùng chung ở một trang (make-gallery.mjs).
  const { build: gallery } = await import('./make-gallery.mjs');
  out.push({ name: 'gallery', file: gallery(join(dir, 'gallery')) });
  return out;
}

// Chạy trong trang: tìm khung rỗng và chữ mờ. Trả về { empty: [...], contrast: [...] }.
function inspect() {
  // Trong suốt (opacity gần 0, tính dồn cả các lớp cha, kể cả khung đang xét) cũng là không thấy.
  const faded = (e, stop) => { let o = 1; for (let n = e; n && n.nodeType === 1 && n !== stop; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o <= 0.05; };
  const shown = (e) => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || faded(e, null)) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const rendered = (e) => { for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } if (faded(e, null)) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const name = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + [...e.classList].map((c) => '.' + c).join('');
  const where = (e) => { const s = e.closest('[data-s]'); return (s ? `bước ${s.dataset.s} ` : '') + name(e); };
  const ownText = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const SKIP = new Set(['CANVAS', 'IMG', 'SVG', 'INPUT', 'TEXTAREA', 'SELECT', 'VIDEO', 'IFRAME', 'BUTTON', 'BR', 'HR', 'SCRIPT', 'STYLE', 'PICTURE', 'OBJECT']);
  const empty = [];
  for (const e of document.body.querySelectorAll('*')) {
    if (SKIP.has(e.tagName) || e.closest('svg') || !e.children.length || ownText(e)) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 64 || r.height < 64 || !rendered(e)) continue;
    const cs = getComputedStyle(e);
    if (cs.backgroundImage !== 'none') continue;
    if ([...e.children].every((k) => !shown(k))) empty.push(`${where(e)} (${Math.round(r.width)}x${Math.round(r.height)})`);
  }
  const rgb = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const page = rgb(getComputedStyle(document.body).backgroundColor);
  const canvas = page && page.a > 0.5 ? page : (matchMedia('(prefers-color-scheme: dark)').matches ? { r: 18, g: 18, b: 18, a: 1 } : { r: 255, g: 255, b: 255, a: 1 });
  const hits = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  /** Nền thật sau chữ: chồng các lớp nền từ trong ra ngoài. Gặp ảnh nền, hay chữ nằm đè lên ảnh hoặc canvas
      (nhãn trên sa bàn), thì không đoán được màu nền: bỏ qua. */
  const backdrop = (e) => {
    const layers = [], box = e.getBoundingClientRect();
    for (let n = e; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== 'none') return null;
      if (n !== e && [...n.querySelectorAll('canvas, img, video')].some((m) => !m.contains(e) && rendered(m) && hits(m.getBoundingClientRect(), box))) return null;
      const c = rgb(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 0.99) break; }
    }
    let bg = layers.length && layers[layers.length - 1].a >= 0.99 ? layers.pop() : canvas;
    while (layers.length) bg = over(layers.pop(), bg);
    return bg;
  };
  const contrast = [], seen = new Set();
  for (const e of document.body.querySelectorAll('*')) {
    if (!ownText(e) || e.closest('svg, button:disabled, [aria-disabled="true"], [disabled], [aria-hidden="true"]') || !rendered(e)) continue;
    const cs = getComputedStyle(e);
    let op = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
    if (op < 0.05) continue;
    const bg = backdrop(e), fg = rgb(cs.color);
    if (!bg || !fg) continue;
    const col = over({ ...fg, a: fg.a * op }, bg);
    const [hi, lo] = [lum(col), lum(bg)].sort((x, y) => y - x);
    const ratio = (hi + 0.05) / (lo + 0.05);
    const size = parseFloat(cs.fontSize), big = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const need = big ? 3 : 4.5;
    if (ratio >= need) continue;
    const text = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim().slice(0, 40);
    const key = text + '|' + ratio.toFixed(1);
    if (seen.has(key)) continue; seen.add(key);
    contrast.push({ bad: ratio < 3, msg: `${where(e)} "${text}" tương phản ${ratio.toFixed(1)}:1 (cần ${need}:1)` });
  }
  return { empty, contrast };
}

/** Mã nguồn axe-core để chèn vào trang, hoặc null nếu chưa cài. */
export function axeSource() {
  try { return readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8'); } catch (e) { return null; }
}

/** Chạy axe trong trang đã mở; trả về [{ bad, msg }]. */
export async function axeCheck(p, source) {
  await p.addScriptTag({ content: source });
  const res = await p.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, rules: { 'color-contrast': { enabled: false } }, resultTypes: ['violations'] });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')), count: v.nodes.length }));
  });
  return res.map((v) => ({ bad: v.impact === 'critical' || v.impact === 'serious',
    msg: `${v.id} (${v.impact}): ${v.help}, ${v.count} chỗ, ví dụ ${v.nodes.join(' | ')}` }));
}

/** Kiểm các trang; trả về { fails, warns, lines }. */
export async function checkPages(pages, { out = join(root, '.check-pages'), browser, log = console.log } = {}) {
  let fails = 0, warns = 0;
  const lines = [];
  const say = (l) => { lines.push(l); log(l); };
  const axe = axeSource();
  if (!axe && process.env.CI) fails++;   // trên CI phải có axe, không được lặng lẽ bỏ qua
  if (!axe) say((process.env.CI ? 'LỖI ' : '') + 'Bỏ qua kiểm truy cập (mục 7): chưa cài axe-core. Cài: npm install --no-save --no-package-lock axe-core@4.14.0');
  for (const { name, file, own } of pages) {
    const src = readFileSync(file, 'utf8');
    if (own) {
      const holders = [...new Set(src.match(/__[A-Z][A-Z0-9_]*__/g) || [])];
      if (holders.length) { fails++; say(`LỖI [${name}] còn chữ giữ chỗ của mẫu: ${holders.join(', ')}`); }
    }
    mkdirSync(join(out, name), { recursive: true });
    for (const scheme of SCHEMES) for (const size of SIZES) {
      const tag = `[${name} ${scheme} ${size.name}]`;
      const ctx = await browser.newContext({ viewport: size.viewport, colorScheme: scheme, isMobile: !!size.touch, hasTouch: !!size.touch, deviceScaleFactor: 1 });
      // Giả có Claude (chỉ khả năng sample) để các ô hỏi Claude hiện ra và được kiểm luôn; không có db nên không lưu gì.
      await ctx.addInitScript(() => {
        try { localStorage.clear(); } catch (e) {}
        const sample = async () => ({ text: 'Trả lời thử.', truncated: false });
        window.claude = { use: async (n) => (n === 'sample' ? sample : null) };
      });
      const p = await ctx.newPage();
      const errors = [];
      p.on('pageerror', (e) => errors.push(e.message));
      p.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|net::ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
      await p.goto(pathToFileURL(file).href, { waitUntil: 'load' });
      await p.waitForTimeout(600);
      // hiện hết mọi bước để kiểm cả bước sau (bài học giấu bước chưa tới)
      await p.addStyleTag({ content: '.step{display:block!important;opacity:1!important;transform:none!important}' });
      await p.waitForTimeout(400);
      // thiếu <meta name="viewport">: điện thoại dựng trang rộng 980px rồi thu nhỏ, chữ li ti
      const layout = await p.evaluate(() => window.innerWidth);
      if (layout > size.viewport.width + 1) { fails++; say(`LỖI ${tag} thiếu thẻ viewport: trang dựng rộng ${layout}px trên màn ${size.viewport.width}px`); }
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) { fails++; say(`LỖI ${tag} tràn ngang ${overflow}px`); }
      const { empty, contrast } = await p.evaluate(inspect);
      for (const e of empty) { fails++; say(`LỖI ${tag} khung trống, mọi thứ bên trong bị ẩn: ${e}`); }
      for (const c of contrast) { if (c.bad) { fails++; say(`LỖI ${tag} chữ mờ: ${c.msg}`); } else { warns++; say(`cảnh báo ${tag} chữ hơi mờ: ${c.msg}`); } }
      for (const e of [...new Set(errors)]) { fails++; say(`LỖI ${tag} JavaScript: ${e}`); }
      // Truy cập: chạy một lần mỗi chế độ màu ở khổ rộng nhất (luật của axe ít khi đổi theo khổ màn).
      if (axe && size === SIZES[0]) for (const a of await axeCheck(p, axe)) { if (a.bad) { fails++; say(`LỖI ${tag} truy cập: ${a.msg}`); } else { warns++; say(`cảnh báo ${tag} truy cập: ${a.msg}`); } }
      await p.screenshot({ path: join(out, name, `${scheme}-${size.name}.png`), fullPage: true });
      await ctx.close();
    }
  }
  return { fails, warns, lines };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const oi = args.indexOf('--out');
  const out = resolve(oi >= 0 ? args.splice(oi, 2)[1] : join(root, '.check-pages'));
  const { chromium } = createRequire(import.meta.url)('playwright');
  const browser = await chromium.launch();
  let pages;
  if (args.length) pages = args.map((f) => ({ name: basename(f, '.html'), file: resolve(f), own: true }));
  else {
    const fx = await buildFixtures(mkdtempSync(join(tmpdir(), 'check-pages-')), browser);
    pages = [...fx.map((f) => ({ ...f, name: 'mau-' + f.name })),
      ...repoPages().map((f) => ({ name: relative(join(root, 'learning'), f).replace(/\/pages\//, '-').replace(/\.html$/, ''), file: f, own: true }))];
  }
  const { fails, warns } = await checkPages(pages, { out, browser });
  await browser.close();
  console.log(`\nXong ${pages.length} trang x ${SIZES.length} khổ x ${SCHEMES.length} chế độ: ${fails} lỗi, ${warns} cảnh báo. Ảnh chụp ở ${out}`);
  process.exit(fails ? 1 : 0);
}
