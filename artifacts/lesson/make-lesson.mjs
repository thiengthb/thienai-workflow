#!/usr/bin/env node
// Gắn lõi chung và khung buổi học vào một trang học (xem README.md trong thư mục này). Chạy lại được: thay bản cũ.
//
//   node artifacts/lesson/make-lesson.mjs learning/<môn>/pages/lesson-NN.html [lesson-id] [--out <thư-mục>] [--no-check]
//
// Trang chưa có: chép mẫu ra rồi dừng. Trang đã có: gắn khung, chạy learning/teaching/check-page.cjs,
// qua thì ghi <out>/publish.json (mặc định thư mục tạm lesson-<id>) để đăng bằng một lần gọi Artifact.
// Trang phải có các thẻ rỗng (hoặc bản cũ) với id: kit-css, lesson-css (style), kit-js, lesson-js, lesson-kit (script).
// lesson-id: tham số, hoặc "id" trong <script id="lesson">, hoặc đoán từ đường dẫn (frontend-06).
import { readFileSync, writeFileSync, realpathSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join, basename, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { writePublish } from '../kit/publish.mjs';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// sample: trang tự hỏi Claude (nhận xét bài tự nói lại, giải thích chỗ chọn sai, hỏi về một bước, làm mẫu, tình huống thêm), xem lesson.js.
// dictation: nói thay gõ ở bước tự nói lại. tts: nút Nghe đọc to phần giải thích và mốc trên sa bàn.
export const CAPABILITIES = { db: {}, comments: {}, sample: {}, dictation: {}, tts: {} };
const read = (p) => readFileSync(join(here, p), 'utf8');
const PARTS = {
  'kit-css': ['style', '../kit/kit.css'],
  'lesson-css': ['style', 'lesson.css'],
  'kit-js': ['script', '../kit/kit.js'],
  'lesson-js': ['script', 'lesson.js'],
  'lesson-kit': ['script', '../kit/autosave.js'],   // tự lưu chỗ đang học theo tên nút, chế độ học lại
};
// Phần thêm, chỉ gắn khi trang có thẻ đó: sa bàn cho bài chiến tranh (artifacts/war/README.md).
const OPTIONAL = {
  'war-css': ['style', '../war/war.css'],
  'war-js': ['script', '../war/sandtable.js', '../war/war-lesson.js'],
  // Sân khấu bài IT: bàn thử (frontend) và bảng dán (BA) (artifacts/it/README.md).
  'it-css': ['style', '../it/it.css'],
  'it-js': ['script', '../it/it-stage.js'],
};
// Mẫu riêng theo môn khi chép trang mới: bài chiến tranh có sẵn sa bàn, frontend có bàn thử, BA có bảng dán.
const TEMPLATES = { war: '../war/template.html', frontend: '../it/template-frontend.html', ba: '../it/template-ba.html' };

// Chỗ còn vướng (đề xuất T4): các dòng "- ..." trong mục này của learning/<môn>.md được ghi vào cấu hình bài ("stuck"),
// để Claude trong trang biết thien còn vướng gì ở các buổi trước khi thien hỏi hay nhờ nhận xét.
export const STUCK = 'Chỗ còn vướng';
/** Các dòng "- ..." trong mục "## Chỗ còn vướng" của file môn, giữ max dòng mới nhất (ở cuối). */
export function stuckPoints(md, max = 6) {
  const m = md.match(new RegExp(`^## ${STUCK}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
  if (!m) return [];
  return m[1].split('\n').filter((l) => /^- /.test(l)).map((l) => l.slice(2).trim()).slice(-max);
}
/** File môn của một trang learning/<môn>/pages/x.html là learning/<môn>.md. */
export function subjectFile(file) {
  const m = resolve(file).replace(/\\/g, '/').match(/^(.*\/learning)\/([^/]+)\/pages\/[^/]+$/);
  return m ? `${m[1]}/${m[2]}.md` : null;
}

export function guessId(file) {
  const m = file.replace(/\\/g, '/').match(/learning\/([^/]+)\/pages\/lesson-(\d+)/);
  return m ? `${m[1]}-${m[2].padStart(2, '0')}` : basename(file, '.html');
}

/** Returns the page with every kit part filled in and the lesson-id meta set. */
export function fill(html, id, file = '', { stuck } = {}) {
  const all = [...Object.entries(PARTS), ...Object.entries(OPTIONAL).filter(([part, [tag]]) => new RegExp(`<${tag} id="${part}">`).test(html))];
  for (const [part, [tag, ...srcs]] of all) {
    const re = new RegExp(`<${tag} id="${part}">[\\s\\S]*?</${tag}>`);
    if (!re.test(html)) throw new Error(`Thiếu <${tag} id="${part}"> trong trang`);
    const src = srcs.join(', '), body = srcs.map(read).join('\n');
    if (body.includes(`</${tag}`)) throw new Error(`${src} chứa </${tag}>`);
    html = html.replace(re, () => `<${tag} id="${part}">\n${body}</${tag}>`);
  }
  // Dữ liệu trận: <script type="application/json" id="battle" data-src="../battles/<trận>.json">, đường dẫn tính từ trang.
  html = html.replace(/<script type="application\/json" id="battle" data-src="([^"]+)">[\s\S]*?<\/script>/, (m, src) => {
    const p = resolve(dirname(resolve(file || '.')), src);
    if (!existsSync(p)) throw new Error(`Không thấy file trận ${src} (tính từ trang)`);
    const b = JSON.parse(readFileSync(p, 'utf8'));
    if (!b.terrain) throw new Error(`File trận ${src} chưa có địa hình: chạy node artifacts/war/fetch-terrain.mjs ${p}`);
    delete b.raw; (b.units || []).forEach((u) => delete u.raw); (b.features || []).forEach((f) => delete f.raw);
    return `<script type="application/json" id="battle" data-src="${src}">${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`;
  });
  const conf = html.match(/<script type="application\/json" id="lesson">([\s\S]*?)<\/script>/);
  let jsonId = '';
  if (conf) { try { jsonId = JSON.parse(conf[1]).id || ''; } catch (e) { throw new Error('<script id="lesson"> không phải JSON hợp lệ'); } }
  const lid = id || (jsonId && !/^__.*__$/.test(jsonId) ? jsonId : '');
  if (!lid) throw new Error('Thiếu lesson-id: ghi "id" trong <script id="lesson"> hoặc truyền làm tham số');
  // Ghi cùng một id vào cấu hình của bài, để lesson.js (sessions/<id>) và phần tự lưu (drafts/<id>) không lệch nhau.
  if (conf) {
    const obj = Object.assign(JSON.parse(conf[1]), { id: lid });
    if (Array.isArray(stuck)) { if (stuck.length) obj.stuck = stuck; else delete obj.stuck; }
    html = html.replace(conf[0], () => `<script type="application/json" id="lesson">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`);
  }
  html = html.replace(/<meta name="lesson-id"[^>]*>\n?/, '');
  html = html.replace(/<meta name="viewport"[^>]*>/, (m) => `${m}\n<meta name="lesson-id" content="${lid.replace(/"/g, '')}">`);
  return html;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const bool = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? (args.splice(i, 1), true) : false; };
  const outArg = flag('out'), noCheck = bool('no-check');
  const [file, id] = args;
  if (!file) { console.error('Cách dùng: node artifacts/lesson/make-lesson.mjs <trang.html> [lesson-id] [--out <thư-mục>] [--no-check]'); process.exit(1); }
  // Lần đầu: trang chưa có thì chép mẫu ra, để AI điền nội dung rồi chạy lại đúng lệnh này.
  if (!existsSync(file)) {
    mkdirSync(dirname(resolve(file)), { recursive: true });
    const subj = (file.replace(/\\/g, '/').match(/learning\/([^/]+)\/pages\//) || [])[1];
    copyFileSync(join(here, TEMPLATES[subj] || 'template.html'), file);
    console.log(`Đã chép mẫu ra ${file}. Thay mọi chỗ __…__ và nội dung mẫu, rồi chạy lại đúng lệnh này.`);
    process.exit(0);
  }
  const html = readFileSync(file, 'utf8');
  const conf = (() => { const m = html.match(/<script type="application\/json" id="lesson">([\s\S]*?)<\/script>/); try { return m ? JSON.parse(m[1]) : {}; } catch (e) { return {}; } })();
  let lid = id || conf.id;
  if (!lid || /^__/.test(lid)) lid = guessId(file);
  const sf = subjectFile(file), stuck = sf && existsSync(sf) ? stuckPoints(readFileSync(sf, 'utf8')) : [];
  writeFileSync(file, fill(html, lid, file, { stuck }));
  console.log(`Đã gắn bộ khung vào ${file} (id ${lid})${stuck.length ? `, kèm ${stuck.length} chỗ còn vướng từ ${sf}` : ''}.`);
  const out = resolve(outArg || join(tmpdir(), `lesson-${lid}`));
  if (!noCheck) {
    // Kiểm luôn trên điện thoại và laptop (chữ giữ chỗ, lỗi JS, tràn ngang, vùng bấm, nút bấm không đổi gì).
    const r = spawnSync(process.execPath, [join(here, '../../learning/teaching/check-page.cjs'), file, join(out, 'check')], { stdio: 'inherit' });
    if (r.status !== 0) { console.error('Trang chưa qua bài kiểm, sửa rồi chạy lại. Chưa ghi publish.json.'); process.exit(1); }
  }
  const title = conf.title && !/^__/.test(conf.title) ? conf.title : lid;
  for (const l of writePublish(out, { file_path: resolve(file), capabilities: CAPABILITIES, icon: 'book', description: title })) console.log(l);
}
