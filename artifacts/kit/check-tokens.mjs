#!/usr/bin/env node
// Một bộ màu chung (đề xuất U2): mọi màu của khung trang nằm ở :root trong artifacts/kit/kit.css.
// File này báo khi CSS dùng chung viết thẳng mã màu (#hex, rgb(), hsl()) thay vì var(--tên),
// và khi dùng var(--tên) mà không chỗ nào định nghĩa tên đó (gõ nhầm tên thì màu mất, không ai thấy).
//
//   node artifacts/kit/check-tokens.mjs        in chỗ sai, thoát mã 1 nếu có
//
// Không kiểm: legacy.css (chỉ cho trang cũ), màu riêng của từng bài (khối <style> không tên trong mẫu
// lesson/it/war, thuộc tính style="--c:…" trên thẻ, sandtable.js vẽ địa hình), vì đó là nội dung bài.
import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
/** CSS dùng chung: cả file. */
export const CSS_FILES = ['artifacts/kit/kit.css', 'artifacts/lesson/lesson.css', 'artifacts/it/it.css', 'artifacts/war/war.css'];
/** Mẫu trang có khối <style> riêng của khung trang (không phải nội dung bài). */
export const TEMPLATE_FILES = ['artifacts/review/template.html', 'artifacts/decide/template.html', 'artifacts/compare/template.html', 'artifacts/plan/template.html', 'artifacts/flow/template.html', 'artifacts/kit/gallery.html'];

const COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g;
const lineAt = (text, i) => text.slice(0, i).split('\n').length;

/** Bỏ chú thích CSS nhưng giữ nguyên số dòng và vị trí ký tự. */
/** Khối định nghĩa màu: bộ chọn chỉ là :root (có thể kèm [data-theme] hay :not(...)), không phải ":root .x". */
const defines = (sel) => sel.split(',').every((p) => /^:root(?:\[[^\]]+\]|:not\(\[[^\]]+\]\))*$/.test(p.trim()));
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

/** Mã màu viết thẳng trong css, trừ khi nằm trong khối có bộ chọn bắt đầu bằng :root (chỗ định nghĩa màu). */
export function literalColours(css, offset = 0, whole = css) {
  const text = stripComments(css), out = [], stack = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') { stack.push(text.slice(start, i).trim()); start = i + 1; }
    else if (ch === '}') { check(start, i); stack.pop(); start = i + 1; }
    else if (ch === ';') { check(start, i); start = i + 1; }
  }
  function check(a, b) {
    if (stack.some(defines)) return;
    for (const m of text.slice(a, b).matchAll(COLOUR)) {
      const at = a + m.index;
      out.push({ line: lineAt(whole, offset + at), msg: `màu viết thẳng "${text.slice(at, at + 9).split(/[\s;,)]/)[0]}…": dùng var(--tên) trong kit.css` });
    }
  }
  return out;
}

/** Các khối <style> có nội dung trong một trang mẫu: [{ css, offset }]. */
export function styleBlocks(html) {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => ({ css: m[1], offset: m.index + m[0].indexOf('>') + 1 }));
}

/** Tên --x được dùng qua var(--x) mà không có var dự phòng. */
export function usedVars(css) {
  return [...stripComments(css).matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map((m) => ({ name: m[1], index: m.index }));
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (/\.(css|html|js|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Mọi tên --x được định nghĩa ở đâu đó trong artifacts/ (CSS, thuộc tính style, setProperty trong JS). */
export function definedVars(root = ROOT) {
  const names = new Set();
  for (const f of walk(join(root, 'artifacts'))) {
    const t = lf(readFileSync(f, 'utf8'));
    for (const m of t.matchAll(/(--[\w-]+)\s*:/g)) names.add(m[1]);
    for (const m of t.matchAll(/setProperty\(\s*['"`](--[\w-]+)/g)) names.add(m[1]);
  }
  return names;
}

export function checkTokens(root = ROOT) {
  const problems = [], defined = definedVars(root);
  const sources = [
    ...CSS_FILES.map((f) => ({ f, blocks: [{ css: lf(readFileSync(join(root, f), 'utf8')), offset: 0 }] })),
    ...TEMPLATE_FILES.map((f) => ({ f, blocks: styleBlocks(lf(readFileSync(join(root, f), 'utf8'))) })),
  ];
  for (const { f, blocks } of sources) {
    const whole = f.endsWith('.html') ? lf(readFileSync(join(root, f), 'utf8')) : blocks[0].css;
    for (const { css, offset } of blocks) {
      for (const p of literalColours(css, offset, whole)) problems.push({ file: f, ...p });
      for (const v of usedVars(css)) if (!defined.has(v.name)) problems.push({ file: f, line: lineAt(whole, offset + v.index), msg: `var(${v.name}) chưa được định nghĩa ở đâu` });
    }
  }
  return problems;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const problems = checkTokens();
  for (const p of problems) console.log(`✗ ${p.file}:${p.line} ${p.msg}`);
  console.log(problems.length ? `${problems.length} chỗ cần sửa` : `ok tokens: ${CSS_FILES.length + TEMPLATE_FILES.length} file chỉ dùng màu trong kit.css`);
  process.exit(problems.length ? 1 : 0);
}
