#!/usr/bin/env node
// Dựng trang mẫu thành phần (artifacts/kit/gallery.html) với CSS chung gắn sẵn. Ra <out>/index.html, preview.html, publish.json.
//
//   node artifacts/kit/make-gallery.mjs [--out <thư-mục>] [--url <artifact đã đăng>] [--palettes <file.css>]
//
// --palettes: file các bảng màu đang thử (khối :root[data-palette="…"], nhãn ở dòng "palette <khóa>: <nhãn>"), gắn sau kit.css
// kèm nút đổi bảng màu ở đầu trang. Dùng cho vòng thử gu màu, ví dụ docs/plans/2026-11-18-visual-workflow/round-2/palettes.css.
//
// Sửa kit.css, diagram.js, lesson.css, it.css hay war.css xong thì dựng lại và đăng đè (--url) để xem mọi thành phần một lượt.
import { readFileSync, writeFileSync, mkdirSync, realpathSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePublish } from './publish.mjs';
import { packHtml } from './pack.mjs';
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

const here = dirname(fileURLToPath(import.meta.url));
const PARTS = { '/*KIT_CSS*/': 'kit.css', '/*LESSON_CSS*/': '../lesson/lesson.css', '/*IT_CSS*/': '../it/it.css', '/*WAR_CSS*/': '../war/war.css',
  '/*KIT_JS*/': 'kit.js', '/*DAGRE_JS*/': 'vendor/dagre.min.js', '/*DIAGRAM_JS*/': 'diagram.js' };

export function render({ palettes } = {}) {
  let html = lf(readFileSync(join(here, 'gallery.html'), 'utf8'));
  for (const [mark, file] of Object.entries(PARTS)) {
    if (!html.includes(mark)) throw new Error(`gallery.html thiếu chỗ gắn ${mark}`);
    html = html.replace(mark, () => lf(readFileSync(join(here, file), 'utf8')));
  }
  if (palettes) {
    const css = lf(readFileSync(palettes, 'utf8'));
    const list = [...css.matchAll(/palette ([\w-]+): ([^*\n]+?)\s*\*\//g)].map((m) => ({ key: m[1], label: m[2] }));
    if (!list.length) throw new Error(`${palettes}: không thấy dòng "palette <khóa>: <nhãn>" nào`);
    html = html.replace('</main>', () => `</main>\n<style id="g-palettes">\n${css}</style>\n<script>window.G_PALETTES = ${JSON.stringify(list)};</script>`);
  }
  return html;
}

export function build(out, opts) {
  mkdirSync(out, { recursive: true });
  const html = packHtml(render(opts), { icons: false, blocks: false });   // trang mẫu giữ đủ icon và mọi khối để xem
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'preview.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${html}\n</body></html>\n`);
  return join(out, 'preview.html');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2), opt = (n) => { const i = args.indexOf('--' + n); return i < 0 ? undefined : args.splice(i, 2)[1]; };
  const out = resolve(opt('out') || join(here, '../../build/kit-gallery')), url = opt('url'), palettes = opt('palettes');
  build(out, { palettes: palettes && resolve(palettes) });
  console.log(`Đã dựng trang mẫu thành phần vào ${out}/index.html`);
  for (const l of writePublish(out, { url, capabilities: {}, icon: 'palette', description: 'Mọi thành phần dùng chung của trang học, sáng và tối' })) console.log(l);
}
