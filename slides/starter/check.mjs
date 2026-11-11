#!/usr/bin/env node
// Machine check for a web deck built from this starter.
//   node check.mjs [deck.html] [--pdf] [--dark]
// Needs Playwright with Chromium (npm i -D playwright && npx playwright install chromium).
// Writes check/NN.png (each slide at its last step), check/sheet.png (all slides on one page, to judge the
// deck as a whole), check/deck.pdf with --pdf, and prints problems. Exit code 1 if any ERROR.
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const file = resolve(args.find((a) => !a.startsWith('--')) || 'deck.html');
const out = join(dirname(file), 'check');
const WPM = 150; // Vietnamese syllables per minute when speaking slowly with pauses
const MIN_PX = 22; // smallest text allowed on the 1600x900 stage (about 13pt)
const BODY_PX = 30; // smallest body text (about 18pt)
const MAX_WORDS = 30; // words on a slide outside the headline

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(pathToFileURL(file).href);
await page.waitForFunction(() => window.deckApi);
await page.evaluate(() => document.fonts.ready);
if (args.includes('--dark')) await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));

const problems = [];
const add = (lvl, i, msg) => problems.push({ lvl, i, msg });
const total = await page.evaluate(() => window.deckApi.total);
const budget = await page.evaluate(() => +document.body.dataset.budget || 0);
let spoken = 0;

for (let i = 0; i < total; i++) {
  await page.evaluate((i) => window.deckApi.go(i, 'end'), i);
  await page.waitForTimeout(700);
  const r = await page.evaluate(({ MIN_PX, BODY_PX }) => {
    const s = document.querySelector('.slide.on');
    const stage = s.getBoundingClientRect();
    const k = stage.width / 1600;
    const leaves = [...s.querySelectorAll('*')].filter((e) => {
      if (e.closest('.notes')) return false;
      const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      const st = getComputedStyle(e);
      return own && st.visibility !== 'hidden' && st.display !== 'none' && +st.opacity !== 0;
    });
    // Measure the text itself (direct text nodes), not the element box: an unbroken string can spill out of
    // its box, and two boxes can touch while their text does not.
    const textRect = (e) => {
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      for (const n of e.childNodes) {
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const q of range.getClientRects()) {
          if (!q.width || !q.height) continue;
          l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom);
        }
      }
      return l === Infinity ? e.getBoundingClientRect() : { left: l, top: t, width: r - l, height: b - t };
    };
    // Font size as drawn on the stage: SVG text is also scaled by its viewBox, so use the element's screen
    // transform divided by the deck-wide scale k.
    const stageFont = (e) => {
      const fs = parseFloat(getComputedStyle(e).fontSize);
      const m = e instanceof SVGGraphicsElement && e.getScreenCTM();
      return m ? Math.round(((fs * Math.hypot(m.a, m.b)) / k) * 10) / 10 : fs;
    };
    const boxes = leaves.map((e) => {
      const q = textRect(e);
      return { e, x: (q.left - stage.left) / k, y: (q.top - stage.top) / k, w: q.width / k, h: q.height / k,
        fs: stageFont(e), t: e.textContent.trim().slice(0, 40),
        label: !!e.closest('.kicker, .foot, .lbl, .muted, .small') };
    });
    const out = [], small = [], under = [], overlap = [];
    for (const b of boxes) {
      if (b.x < -1 || b.y < -1 || b.x + b.w > 1601 || b.y + b.h > 901) out.push(b.t);
      if (b.fs < MIN_PX) small.push(`${b.fs}px "${b.t}"`);
      else if (!b.label && b.fs < BODY_PX) under.push(`${b.fs}px "${b.t}"`);
    }
    for (let a = 0; a < boxes.length; a++) for (let c = a + 1; c < boxes.length; c++) {
      const A = boxes[a], C = boxes[c];
      if (A.e.contains(C.e) || C.e.contains(A.e)) continue;
      const ix = Math.min(A.x + A.w, C.x + C.w) - Math.max(A.x, C.x);
      const iy = Math.min(A.y + A.h, C.y + C.h) - Math.max(A.y, C.y);
      if (ix > 4 && iy > 4) overlap.push(`"${A.t}" đè "${C.t}"`);
    }
    const head = s.querySelector('h1, h2');
    const clone = s.cloneNode(true);
    clone.querySelectorAll('h1, h2, .kicker, .foot, .notes, .lbl').forEach((e) => e.remove());
    const words = clone.textContent.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    const notes = (s.querySelector('.notes')?.textContent || '').replace(/\[[^\]]*\]/g, ' ');
    const syl = notes.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    return { title: s.dataset.title || '', min: +s.dataset.min || 0, bare: s.dataset.bare !== undefined,
      head: head ? head.textContent.trim() : '', out, small, under, overlap, words, syl };
  }, { MIN_PX, BODY_PX });

  const n = String(i + 1).padStart(2, '0');
  await page.screenshot({ path: join(out, `${n}.png`) });
  const mins = r.syl / WPM;
  spoken += mins;
  const tag = `${n} ${r.title}`;
  r.out.forEach((t) => add('ERROR', tag, `chữ tràn ra ngoài khung: "${t}"`));
  r.overlap.forEach((t) => add('ERROR', tag, `chữ đè chữ: ${t}`));
  r.small.forEach((t) => add('ERROR', tag, `chữ nhỏ hơn ${MIN_PX}px, lên máy chiếu không đọc được: ${t}`));
  r.under.forEach((t) => add('WARN', tag, `chữ nội dung nhỏ hơn ${BODY_PX}px: ${t}`));
  if (!r.bare && r.words > MAX_WORDS) add('WARN', tag, `${r.words} từ ngoài tiêu đề (nên dưới ${MAX_WORDS}); chuyển bớt sang lời nói`);
  if (!r.bare && r.head && r.head.split(/\s+/).length < 4) add('WARN', tag, `tiêu đề "${r.head}" giống nhãn chủ đề; viết thành câu khẳng định`);
  if (!r.syl) add('WARN', tag, 'chưa có lời nói trong <aside class="notes">');
  if (r.min && mins > r.min * 1.25) add('WARN', tag, `lời nói khoảng ${mins.toFixed(1)} phút, dự kiến ${r.min} phút`);
}

// Contact sheet: every slide on one page, to judge rhythm and consistency of the whole deck.
const cols = 4, w = 400, h = 225;
const imgs = [...Array(total)].map((_, i) => `<img src="${String(i + 1).padStart(2, '0')}.png" style="width:${w}px;height:${h}px">`).join('');
writeFileSync(join(out, 'sheet.html'), `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:8px;padding:8px">${imgs}</body>`);
const sheet = await browser.newPage({ viewport: { width: cols * (w + 8) + 8, height: Math.ceil(total / cols) * (h + 8) + 8 } });
await sheet.goto(pathToFileURL(join(out, 'sheet.html')).href);
await sheet.screenshot({ path: join(out, 'sheet.png'), fullPage: true });

if (args.includes('--pdf')) {
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: join(out, 'deck.pdf'), width: '1600px', height: '900px', printBackground: true });
}
await browser.close();

if (budget && spoken > budget) add('ERROR', 'cả bài', `lời nói khoảng ${spoken.toFixed(1)} phút, vượt ${budget} phút được phép`);
for (const p of problems) console.log(`${p.lvl.padEnd(5)} ${p.i}: ${p.msg}`);
console.log(`\n${total} slide, lời nói khoảng ${spoken.toFixed(1)} phút ở ${WPM} tiếng mỗi phút${budget ? ` (được ${budget} phút)` : ''}. Ảnh ở ${out}`);
process.exit(problems.some((p) => p.lvl === 'ERROR') ? 1 : 0);
