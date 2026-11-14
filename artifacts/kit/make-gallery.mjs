#!/usr/bin/env node
// Dựng trang mẫu thành phần (artifacts/kit/gallery.html) với CSS chung gắn sẵn. Ra <out>/index.html, preview.html, publish.json.
//
//   node artifacts/kit/make-gallery.mjs [--out <thư-mục>] [--url <artifact đã đăng>]
//
// Sửa kit.css, lesson.css, it.css hay war.css xong thì dựng lại và đăng đè (--url) để xem mọi thành phần một lượt.
import { readFileSync, writeFileSync, mkdirSync, realpathSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { writePublish } from './publish.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const PARTS = { '/*KIT_CSS*/': 'kit.css', '/*LESSON_CSS*/': '../lesson/lesson.css', '/*IT_CSS*/': '../it/it.css', '/*WAR_CSS*/': '../war/war.css' };

export function render() {
  let html = readFileSync(join(here, 'gallery.html'), 'utf8');
  for (const [mark, file] of Object.entries(PARTS)) {
    if (!html.includes(mark)) throw new Error(`gallery.html thiếu chỗ gắn ${mark}`);
    html = html.replace(mark, () => readFileSync(join(here, file), 'utf8'));
  }
  return html;
}

export function build(out) {
  mkdirSync(out, { recursive: true });
  const html = render();
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'preview.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${html}\n</body></html>\n`);
  return join(out, 'preview.html');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2), opt = (n) => { const i = args.indexOf('--' + n); return i < 0 ? undefined : args.splice(i, 2)[1]; };
  const out = resolve(opt('out') || join(tmpdir(), 'kit-gallery')), url = opt('url');
  build(out);
  console.log(`Đã dựng trang mẫu thành phần vào ${out}/index.html`);
  for (const l of writePublish(out, { url, capabilities: {}, icon: 'palette', description: 'Mọi thành phần dùng chung của trang học, sáng và tối' })) console.log(l);
}
