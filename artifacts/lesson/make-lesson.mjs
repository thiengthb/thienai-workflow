#!/usr/bin/env node
// Gắn lõi chung và khung buổi học vào một trang học (xem README.md trong thư mục này). Chạy lại được: thay bản cũ.
//
//   node artifacts/lesson/make-lesson.mjs learning/<môn>/pages/lesson-NN.html [lesson-id] [--out <thư-mục>] [--no-check] [--today YYYY-MM-DD]
//
// Trang chưa có: chép mẫu ra rồi dừng. Trang đã có: dựng bản đầy đủ (gắn khung) ra <out>/lesson-NN.html, chạy
// learning/teaching/check-page.cjs trên bản đó, qua thì ghi <out>/publish.json (mặc định build/lesson-<id> trong repo, đã gitignore; công cụ đăng của claude.ai không nhận file ở /tmp)
// để đăng bằng một lần gọi Artifact. File trong repo là nguồn: thẻ kit để rỗng, không chép kit và dữ liệu trận vào
// (kế hoạch docs/plans/2026-11-15-lean-learning.md). Nguồn còn kit đã điền (bài trước 2026-11-15) thì script tự làm rỗng.
// Trang phải có các thẻ rỗng (hoặc bản cũ) với id: kit-css, lesson-css (style), kit-js, lesson-js, lesson-kit (script).
// lesson-id: tham số, hoặc "id" trong <script id="lesson">, hoặc đoán từ đường dẫn (frontend-06).
import { readFileSync, writeFileSync, realpathSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { packHtml } from '../kit/pack.mjs';
import { dirname, join, basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { writePublish } from '../kit/publish.mjs';
import { reviewCards, subjects, REVIEW_CARDS } from '../review/make-review.mjs';
import { fileURLToPath } from 'node:url';
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

const here = dirname(fileURLToPath(import.meta.url));
// sample: trang tự hỏi Claude (nhận xét bài tự nói lại, giải thích chỗ chọn sai, hỏi về một bước, làm mẫu, tình huống thêm), xem lesson.js.
// dictation: nói thay gõ ở bước tự nói lại. tts: nút Nghe đọc to phần giải thích và mốc trên sa bàn.
export const CAPABILITIES = { db: {}, comments: {}, sample: {}, tts: {} };   // tts: "Nghe mốc đang xem" của bài chiến tranh
const read = (p) => lf(readFileSync(join(here, p), 'utf8'));
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

// Bước ôn 3 thẻ đầu buổi tự sinh lúc dựng (kế hoạch docs/plans/2026-11-15-lean-learning.md, checkpoint 3; thien chọn giữ trắc nghiệm
// 2026-11-17): nguồn chỉ có <section ... data-auto="cards"> rỗng, lệnh lấy thẻ đến hạn như gói buổi (prepare-lesson.mjs) và câu
// trắc nghiệm của từng thẻ trong learning/cards-quiz.json ({ "F2": { "opts": [2–3 lựa chọn], "a": số thứ tự đáp án đúng từ 0, "why": "..." } }).
export const QUIZ_FILE = 'cards-quiz.json';
const AUTO = /(<section class="step"[^>]*\bdata-auto="cards"[^>]*>)([\s\S]*?)(<\/section>)/;
const AUTO_NOTE = '<!-- Ôn 3 thẻ: make-lesson.mjs tự sinh lúc dựng từ learning/cards.md và learning/cards-quiz.json. Để trống. -->';
const escH = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Câu trắc nghiệm hợp lệ (learning/README.md, "Sau buổi"): 2–3 lựa chọn có chữ, a trỏ đúng một lựa chọn, có lời giải thích. */
export function validQuiz(q) {
  return !!q && Array.isArray(q.opts) && q.opts.length >= 2 && q.opts.length <= 3 && q.opts.every((o) => typeof o === 'string' && o.trim())
    && Number.isInteger(q.a) && q.a >= 0 && q.a < q.opts.length && typeof q.why === 'string' && !!q.why.trim();
}

/** Ghép thẻ ôn với câu trắc nghiệm: { cards: [{ id, question, opts, a, why }], missing: [thẻ chưa có câu hợp lệ] }. */
export function quizCards(cards, quiz = {}) {
  const ok = [], missing = [];
  for (const c of cards) (validQuiz(quiz[c.id]) ? ok.push({ id: c.id, question: c.question, opts: quiz[c.id].opts, a: quiz[c.id].a, why: quiz[c.id].why }) : missing.push(c));
  return { cards: ok, missing };
}

/** Nội dung bước ôn: mỗi thẻ một câu một lựa chọn, đúng khuôn câu viết tay (data-kind="review"), nút Tiếp mở khi trả lời hết. */
export function reviewStep(cards, next) {
  const items = cards.map((c, i) => `    <div class="card">
      <p><b>${i + 1}.</b> ${escH(c.question)}</p>
      <div class="q" data-q="${escH(c.id)}" data-a="${c.a}" data-kind="review"><p class="status" role="status"></p>
${c.opts.map((o) => `        <button class="opt" type="button">${escH(o)}</button>`).join('\n')}
        <p class="why">${escH(c.why)}</p>
      </div>
    </div>`);
  const lead = cards.length ? 'Trả lời theo trí nhớ. Câu sai sẽ được hỏi lại sớm hơn.' : 'Hôm nay không có thẻ nào đến hạn.';
  const gate = cards.length ? ` data-need="${cards.map((c) => escH(c.id)).join(' ')}" data-review-gate disabled` : '';
  return `
    <h2>Ôn nhanh</h2>
    <p class="small muted">${lead}</p>
${items.join('\n')}${items.length ? '\n' : ''}    <button class="btn primary next" type="button" data-go="${next}"${gate}>Tiếp</button>
  `;
}

/** Thẻ mẫu cho trang mẫu và bài kiểm trong CI (bố cục, không phải thẻ đến hạn thật): bản đăng mới là bản thật. */
export const SAMPLE_CARDS = [
  { id: 'F8', question: 'Thẻ trạng thái "Đã thanh toán" nên đặc hay nhạt?', opts: ['Đặc, cho dễ thấy', 'Nhạt: nền nhạt, chữ đậm màu'], a: 1, why: 'Trạng thái là để đọc, không phải để bấm. Khối đặc dành cho việc chính.' },
  { id: 'B2', question: '"Thêm thông báo đẩy lúc 8 giờ tối" là gì?', opts: ['Nhu cầu', 'Giải pháp'], a: 1, why: 'Nó nói cách làm. Nhu cầu nằm sau nó, ví dụ "tôi hay quên ôn bài".' },
  { id: 'W8', question: 'Vì sao Đại tướng Võ Nguyên Giáp hoãn trận đánh Điện Biên Phủ ngày 26/1/1954?', opts: ['Đánh nhanh thắng nhanh không còn chắc thắng', 'Thiếu lương thực'], a: 0, why: 'Địch đã củng cố, đánh theo kế hoạch cũ thì không chắc thắng, nên chuyển sang đánh chắc tiến chắc.' },
];

/** Trang có bước ôn tự sinh không. */
export const hasAutoReview = (html) => AUTO.test(lf(html));

/** Dòng nhắc AI viết câu trắc nghiệm cho các thẻ còn thiếu, dán thẳng vào learning/cards-quiz.json được. */
export function missingQuizText(missing) {
  return [`Thẻ ôn hôm nay chưa có câu trắc nghiệm trong learning/${QUIZ_FILE}: ${missing.map((c) => c.id).join(', ')}.`,
    'Thêm mỗi thẻ một dòng (2–3 lựa chọn, "a" là số thứ tự đáp án đúng tính từ 0, "why" một câu giải thích lấy từ bài), rồi chạy lại đúng lệnh này:',
    ...missing.map((c) => `  "${c.id}": {"opts": ["…", "…", "…"], "a": 0, "why": "…"},   ← ${c.question}`)].join('\n');
}

export function guessId(file) {
  const m = file.replace(/\\/g, '/').match(/learning\/([^/]+)\/pages\/lesson-(\d+)/);
  return m ? `${m[1]}-${m[2].padStart(2, '0')}` : basename(file, '.html');
}

/** Returns the page with every kit part filled in and the lesson-id meta set. cards: thẻ ôn đã ghép câu (quizCards), bắt buộc khi trang có bước ôn tự sinh. */
export function fill(html, id, file = '', { stuck, cards } = {}) {
  html = lf(html);
  if (AUTO.test(html)) {
    if (!Array.isArray(cards)) throw new Error('Trang có bước ôn tự sinh (data-auto="cards") mà chưa có thẻ: dựng bằng make-lesson.mjs');
    html = html.replace(AUTO, (m, a, b, c) => {
      const s = +((a.match(/data-s="(\d+)"/) || [])[1]);
      if (!Number.isInteger(s)) throw new Error('Bước ôn tự sinh thiếu data-s');
      return a + reviewStep(cards, s + 1) + c;
    });
  }
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
    const b = JSON.parse(lf(readFileSync(p, 'utf8')));
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

/** Thẻ kit và dữ liệu trận mà fill() điền vào, có trong trang này. */
function filledParts(html) {
  return [...Object.entries(PARTS), ...Object.entries(OPTIONAL)].map(([part, [tag]]) => ({ part, tag, re: new RegExp(`(<${tag} id="${part}">)([\\s\\S]*?)(</${tag}>)`) }))
    .filter((x) => x.re.test(html));
}
const NEW_FRAME = /<script id="kit-js">/;
const BATTLE = /(<script type="application\/json" id="battle" data-src="[^"]+">)([\s\S]*?)(<\/script>)/;

/** Nguồn của trang: bỏ mọi thứ fill() sinh ra (kit, dữ liệu trận, chỗ còn vướng, meta lesson-id), giữ nội dung bài. */
export function strip(html) {
  html = lf(html);
  if (!NEW_FRAME.test(html)) return html; // trang khung cũ (trước 2026-11-14): giữ nguyên, đóng băng
  for (const { re } of filledParts(html)) html = html.replace(re, (m, a, b, c) => a + c);
  html = html.replace(BATTLE, (m, a, b, c) => a + c);
  html = html.replace(AUTO, (m, a, b, c) => `${a}\n    ${AUTO_NOTE}\n  ${c}`);
  const conf = html.match(/<script type="application\/json" id="lesson">([\s\S]*?)<\/script>/);
  if (conf) {
    try {
      const obj = JSON.parse(conf[1]);
      if ('stuck' in obj) { delete obj.stuck; html = html.replace(conf[0], () => `<script type="application/json" id="lesson">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`); }
    } catch (e) { /* cấu hình hỏng: để fill() báo lỗi */ }
  }
  return html.replace(/<meta name="lesson-id"[^>]*>\n?/, '');
}

/** Tên các phần đã điền sẵn trong nguồn (CI chặn: nguồn trong repo không được mang kit). Trang khung cũ không có thẻ kit thì trả []. */
export function filledIn(html) {
  html = lf(html);
  if (!NEW_FRAME.test(html)) return [];
  const out = filledParts(html).filter(({ re }) => html.match(re)[2].trim()).map(({ part }) => part);
  const b = html.match(BATTLE);
  if (b && b[2].trim()) out.push('battle');
  const r = html.match(AUTO);
  if (r && r[2].replace(AUTO_NOTE, '').trim()) out.push('cards');
  return out;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const bool = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? (args.splice(i, 1), true) : false; };
  const outArg = flag('out'), noCheck = bool('no-check'), ackOpen = bool('ack-open');
  const today = flag('today') || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });   // cùng ngày với gói buổi
  const [file, id] = args;
  if (!file) { console.error('Cách dùng: node artifacts/lesson/make-lesson.mjs <trang.html> [lesson-id] [--out <thư-mục>] [--no-check] [--ack-open] [--today YYYY-MM-DD]'); process.exit(1); }
  // Trước khi dựng: nhánh chưa merge (PR đang mở) nào đã sửa bài của môn này thì dừng, để không làm trùng việc phiên khác (lỗi 2026-11-13, PR #44).
  const subjOpen = (file.replace(/\\/g, '/').match(/learning\/([^/]+)\/pages\//) || [])[1];
  if (subjOpen && !ackOpen) {
    try {
      const { openWork, report } = await import('../../templates/check-open-work.mjs');
      const { execFileSync } = await import('node:child_process');
      // Trang mới thì thư mục của nó có thể chưa có: đi lên tới thư mục cha đã có rồi mới hỏi git.
      let near = dirname(resolve(file)); while (!existsSync(near) && dirname(near) !== near) near = dirname(near);
      const root = (() => { try { return execFileSync('git', ['-C', near, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { return ''; } })();
      const paths = [`learning/${subjOpen}.md`, `learning/${subjOpen}/`], list = root && existsSync(join(root, 'learning')) ? openWork({ paths, cwd: root }) : [];
      if (list.length || list.stale) { console.error(report(list, paths) + '\nĐọc các nhánh đó (hoặc gộp vào nhánh của mình) rồi chạy lại với --ack-open.'); process.exit(1); }
    } catch (e) { console.error('Không kiểm được nhánh chưa merge (' + (e.message || e) + '). Xem trang Pull requests rồi chạy lại với --ack-open.'); process.exit(1); }
  }
  // Lần đầu: trang chưa có thì chép mẫu ra, để AI điền nội dung rồi chạy lại đúng lệnh này.
  if (!existsSync(file)) {
    mkdirSync(dirname(resolve(file)), { recursive: true });
    const subj = (file.replace(/\\/g, '/').match(/learning\/([^/]+)\/pages\//) || [])[1];
    copyFileSync(join(here, TEMPLATES[subj] || 'template.html'), file);
    console.log(`Đã chép mẫu ra ${file}. Thay mọi chỗ __…__ và nội dung mẫu, rồi chạy lại đúng lệnh này.`);
    process.exit(0);
  }
  const html = lf(readFileSync(file, 'utf8'));
  const conf = (() => { const m = html.match(/<script type="application\/json" id="lesson">([\s\S]*?)<\/script>/); try { return m ? JSON.parse(m[1]) : {}; } catch (e) { return {}; } })();
  let lid = id || conf.id;
  if (!lid || /^__/.test(lid)) lid = guessId(file);
  const sf = subjectFile(file), stuck = sf && existsSync(sf) ? stuckPoints(lf(readFileSync(sf, 'utf8'))) : [];
  // Bước ôn tự sinh: cùng 3 thẻ gói buổi đã in (prepare-lesson.mjs, cùng ngày), câu lấy từ learning/cards-quiz.json.
  let cards;
  if (hasAutoReview(html)) {
    const ldir = sf ? dirname(sf) : '', dir = (file.replace(/\\/g, '/').match(/learning\/([^/]+)\/pages\//) || [])[1];
    if (!ldir || !existsSync(join(ldir, 'cards.md'))) { console.error('Trang có bước ôn tự sinh nhưng không nằm trong learning/<môn>/pages/ cạnh learning/cards.md.'); process.exit(1); }
    const cardsText = lf(readFileSync(join(ldir, 'cards.md'), 'utf8'));
    const name = subjects(existsSync(join(ldir, 'README.md')) ? lf(readFileSync(join(ldir, 'README.md'), 'utf8')) : '', cardsText)[dir]?.name || '';
    const qf = join(ldir, QUIZ_FILE);
    let quiz = {};
    try { quiz = existsSync(qf) ? JSON.parse(lf(readFileSync(qf, 'utf8'))) : {}; } catch (e) { console.error(`learning/${QUIZ_FILE} không phải JSON hợp lệ: ${e.message}`); process.exit(1); }
    const q = quizCards(reviewCards(cardsText, ldir, today, REVIEW_CARDS, name), quiz);
    if (q.missing.length) { console.error(missingQuizText(q.missing)); process.exit(1); }
    cards = q.cards;
    console.log(`Bước ôn: ${cards.map((c) => c.id).join(', ') || 'không có thẻ'} (ngày ${today}).`);
  }
  const out = resolve(outArg || join(here, '../../build', `lesson-${lid}`));
  mkdirSync(out, { recursive: true });
  // Bản đầy đủ ra thư mục out; file trong repo giữ là nguồn (không kit, không dữ liệu trận chép lần hai).
  const built = join(out, basename(file));
  writeFileSync(built, packHtml(fill(html, lid, file, { stuck, cards })));   // thu gọn kit, bỏ icon không dùng (kit/pack.mjs)
  const src = strip(html);
  if (src !== html) { writeFileSync(file, src); console.log(`Đã làm gọn nguồn ${file}: bỏ kit đã điền, ${Math.round(html.length / 1024)} KB còn ${Math.round(src.length / 1024)} KB.`); }
  console.log(`Đã dựng ${built} (id ${lid})${stuck.length ? `, kèm ${stuck.length} chỗ còn vướng từ ${sf}` : ''}. Mở file này để xem, đừng mở nguồn.`);
  if (!noCheck) {
    // Kiểm luôn trên điện thoại và laptop (chữ giữ chỗ, lỗi JS, tràn ngang, vùng bấm, nút bấm không đổi gì).
    const r = spawnSync(process.execPath, [join(here, '../../learning/teaching/check-page.cjs'), built, join(out, 'check')], { stdio: 'inherit' });
    if (r.status !== 0) { console.error('Trang chưa qua bài kiểm, sửa nguồn rồi chạy lại. Chưa ghi publish.json.'); process.exit(1); }
  }
  const title = conf.title && !/^__/.test(conf.title) ? conf.title : lid;
  for (const l of writePublish(out, { file_path: built, capabilities: CAPABILITIES, icon: 'book', description: title })) console.log(l);
}
