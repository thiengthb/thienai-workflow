#!/usr/bin/env node
// Dựng trang kế hoạch nhìn được từ một file docs/plans/*.md (xem README.md trong thư mục này).
//
//   node artifacts/plan/make-plan.mjs <plan.md> <out-dir> [--repo owner/repo] [--url <link trang cũ>] [--trial "<chi tiết thử>"]
//   node artifacts/plan/make-plan.mjs --check <plan.md|thư-mục> ...   chỉ in chỗ lệch mẫu, không dựng; thoát 1 khi có lỗi
//
// Ra: <out-dir>/index.html (đã gộp kit), <out-dir>/preview.html để mở thử, <out-dir>/publish.json để đăng.
// File lệch mẫu thì lệnh in từng chỗ kèm số dòng. Chỉ "lỗi" (thiếu tiêu đề, thiếu checkpoint) mới chặn dựng trang.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, realpathSync } from 'node:fs';
import { dirname, join, resolve, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { packHtml } from '../kit/pack.mjs';
import { writePublish } from '../kit/publish.mjs';
import { parsePlanFile } from './parse-plan.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (html) => String(html).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const ddmm = (iso) => { const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? `${m[2]}/${m[1]}` : ''; };
const icon = (n) => `<i class="ic ic-${n}" aria-hidden="true"></i>`;

const STATE_CHIP = { 'đang chạy': 'accent', 'chờ duyệt': 'warn', 'tạm dừng': '', 'xong': 'good', 'bỏ': '' };
const STOP_LABEL = { done: 'xong', now: 'đang chạy', todo: 'chưa tới', dropped: 'bỏ' };

/** Thân trang (HTML) và dữ liệu cho plan.js. */
export function render(plan, { id, repo = '', source = '', trial = '' } = {}) {
  const stateChip = `<span class="chip ${STATE_CHIP[plan.state.split(' ')[0] === 'chờ' ? 'chờ duyệt' : plan.state] ?? ''}">${esc(plan.stateFull || plan.state)}</span>`;
  const pct = plan.ticks.total ? Math.round(100 * plan.ticks.done / plan.ticks.total) : 0;
  const now = plan.checkpoints[plan.current];
  const toc = [['dang-o', 'Đang ở đâu'], ['tuyen', 'Checkpoint']];

  // Dòng có nhãn ("Đang ở:", "Còn thiếu:", "thien cần làm:") hiện thẳng; dòng không nhãn gập vào "Ghi chú thêm".
  const keyed = plan.where.filter((w) => w.key), loose = plan.where.filter((w) => !w.key);
  const where = plan.where.length ? `<div class="where card">${keyed.map((w) =>
    `<div class="w-row${w.ask ? ' ask' : ''}"><span class="label ${w.ask ? 'k2' : 'k1'}">${esc(w.key)}</span><p>${w.html}</p></div>`).join('')}${loose.length
    ? `<details class="acc w-more"><summary>Ghi chú thêm <span class="chip">${loose.length}</span></summary><ul class="list">${loose.map((w) => `<li>${w.html}</li>`).join('')}</ul></details>` : ''}</div>` : '';
  const jump = now ? `<a class="jump" href="#${now.id}"><span>Ga đang chạy · <b>${now.num}. ${esc(now.name)}</b></span>${icon('arrow-right')}</a>` : '';

  const stops = plan.checkpoints.map((c) => {
    const chips = [
      c.gate && c.state !== 'done' ? `<span class="chip warn">${icon('calendar')}mốc ${ddmm(c.gate)}</span>` : '',
      `<span class="chip${c.state === 'now' ? ' accent' : c.state === 'done' ? ' good' : ''}">${STOP_LABEL[c.state]}</span>`,
      c.total ? `<span class="chip">${c.done}/${c.total} việc</span>` : '',
      c.estimate && c.state !== 'done' ? `<span class="chip">${icon('clock')}~${String(c.estimate).replace('.', ',')} phiên</span>` : '',
    ].join('');
    const tasks = c.tasks.length || c.notes.length ? `<details class="acc"${c.state === 'now' ? ' open' : ''}><summary>Việc con${c.total ? ` · ${c.done}/${c.total}` : ''}</summary><div>
      ${c.tasks.length ? `<ul class="tasks">${c.tasks.map((t) => `<li class="${t.done ? 'done' : ''}"><span class="tick" role="img" aria-label="${t.done ? 'đã xong' : 'chưa xong'}">${t.done ? icon('check') : ''}</span><span>${t.html}</span></li>`).join('')}</ul>` : ''}
      ${c.notes.map((n) => `<p class="small muted">${n}</p>`).join('')}</div></details>` : '';
    return `<li class="stop ${c.state}${c.gate ? ' gate' : ''}" id="${c.id}" data-ck="${esc(c.num)}">
  <span class="dot" aria-hidden="true">${c.state === 'done' ? icon('check') : esc(c.num)}</span>
  <div class="box">
    <div class="head"><h3><span class="vh">Ga ${esc(c.num)}: </span>${c.nameHtml}</h3><span class="chips">${chips}</span></div>
    ${c.note ? `<p class="small muted">${c.note}</p>` : ''}
    ${c.doneWhen ? `<p class="done-when"><b>Xong khi:</b> ${c.doneWhen}</p>` : ''}
    ${tasks}
  </div>
</li>`;
  }).join('\n');
  const legend = `<p class="legend"><span><i class="lg done"></i>xong</span><span><i class="lg now"></i>đang chạy</span><span><i class="lg todo"></i>chưa tới</span>${plan.checkpoints.some((c) => c.gate) ? '<span><i class="lg gate"></i>mốc cố định</span>' : ''}</p>`;
  const mapNeeded = plan.checkpoints.filter((c) => c.state !== 'dropped' && (c.doneDate || c.gate || c.estimate != null)).length >= 2;
  const daymap = mapNeeded ? `<div class="daymap card" id="daymap">
    <svg id="map" aria-hidden="true"></svg>
    <div class="knob" id="knob" hidden>
      <label for="pace"><b id="pace-v">3</b> phiên mỗi tuần</label>
      <input id="pace" type="range" min="1" max="6" step="1" value="3">
    </div>
    <p class="readout" id="readout" role="status"></p>
  </div>` : '';

  let options = '';
  if (plan.options?.length) {
    toc.push(['phuong-an', 'Phương án']);
    const chosen = plan.options.find((o) => o.chosen);
    options = `<section id="phuong-an" aria-labelledby="h-pa">
  <span class="label">Các phương án đã xét</span>
  <h2 id="h-pa">${chosen ? `Chọn ${esc(chosen.key || plain(chosen.nameHtml))}, và đây là chỗ yếu của nó` : 'Các cách đã cân nhắc'}</h2>
  <div class="opts">${plan.options.map((o) => `<div class="opt card${o.chosen ? ' pick' : ''}"><span class="k">${esc(o.key || '·')}</span><div class="c">
    <span class="t">${o.nameHtml}${o.chosen ? '<span class="chip accent">đã chọn</span>' : ''}</span>
    <dl>${o.rows.map((r) => `<dt>${esc(r.label)}</dt><dd>${r.html}</dd>`).join('')}</dl></div></div>`).join('')}</div>
</section>`;
  }
  const notDo = plan.notDo.length ? `<div class="card pad"><h3>Không làm lần này</h3><ul class="list">${plan.notDo.map((x) => `<li>${x}</li>`).join('')}</ul></div>` : '';

  const open = plan.questions.length && !plan.answered;
  toc.push(['cau-hoi', open ? 'Câu hỏi' : 'Góp ý']);
  const answeredList = plan.questions.length && plan.answered ? `<div class="card pad"><h3>${plan.questionsTitle}</h3><ol class="list">${plan.questions.map((q) => `<li>${q.q}${q.options.find((o) => o.rec && !o.other) ? ` <span class="muted">${q.options.find((o) => o.rec).html}</span>` : ''}</li>`).join('')}</ol></div>` : '';
  const ask = `<section id="cau-hoi" aria-labelledby="h-q">
  <span class="label">${open ? 'Câu hỏi' : 'Góp ý'}</span>
  <h2 id="h-q">${open ? `${plan.questions.length} câu làm đổi việc. Để nguyên đề xuất là "ok"` : 'Bạn thấy trang này thế nào?'}</h2>
  ${answeredList}
  <div class="qs" id="qs"></div>
  ${trial ? `<div class="trial" id="trial"><h3>${icon('sparkles')}Chi tiết thử của trang này</h3><p class="small">${esc(trial)}</p>
    <div class="row" role="group" aria-label="Chi tiết thử"><button class="choice" type="button" aria-pressed="false" data-trial="Thích" disabled><i></i>Thích</button><button class="choice" type="button" aria-pressed="false" data-trial="Không" disabled><i></i>Không</button></div></div>` : ''}
  <div class="reply card pad">
    <label class="label" for="note">Ghi chú của bạn (không bắt buộc)</label>
    <textarea id="note" maxlength="3000" disabled placeholder="Ví dụ: ga 3 làm trước ga 4 được không?"></textarea>
    <p class="label">Câu trả lời sẽ gửi</p>
    <div class="preview" id="preview"></div>
    <div class="acts"><button class="btn" id="copy" type="button" disabled>${icon('copy')}Chép</button><button class="btn accent" id="send" type="button" disabled>Gửi cho Claude</button></div>
    <p class="status" id="status" aria-live="polite"></p>
  </div>
</section>`;

  const acc = (title, html, count) => `<details class="acc"><summary>${title}${count != null ? ` <span class="chip">${count}</span>` : ''}</summary><div class="md">${html}</div></details>`;
  const table = (head, rows) => rows.length ? `<div class="table"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="muted small">Chưa có.</p>';
  let more = '';
  if (plan.extras.length || notDo) {
    toc.push(['them', 'Thêm']);
    more = `<section id="them" aria-labelledby="h-them"><span class="label">Thêm</span><h2 id="h-them">Phạm vi, thời gian, nghiên cứu</h2>${notDo}<div class="accs">${plan.extras.map((e) => acc(e.title, e.html)).join('')}</div></section>`;
  }
  toc.push(['nhat-ky', 'Nhật ký']);
  const log = `<section id="nhat-ky" aria-labelledby="h-log"><span class="label">Nhật ký</span><h2 id="h-log">Đã đổi gì, gặp lỗi gì</h2><div class="accs">
  ${acc('Đã đổi so với bản duyệt', table(['Ngày', 'Đổi gì', 'Vì sao'], plan.changes), plan.changes.length)}
  ${acc('Lỗi gặp', table(['Ngày', 'Lỗi', 'Đã xử lý'], plan.errors), plan.errors.length)}</div></section>`;

  const metaChips = [stateChip,
    plan.approvedDate ? `<span class="chip">Duyệt ${ddmm(plan.approvedDate)}</span>` : '',
    plan.updated ? `<span class="chip">Cập nhật ${ddmm(plan.updated)}</span>` : '',
    plan.nick ? `<span class="chip">Nick ${esc(plan.nick)}</span>` : ''].join('');
  const body = `<nav class="toc" id="toc" aria-label="Mục lục"><div class="in">${toc.map(([h, t]) => `<a href="#${h}">${t}</a>`).join('')}</div></nav>
<main class="wrap">
<header class="ph">
  <span class="label">Kế hoạch${repo ? ' · ' + esc(repo.split('/').pop()) : ''}</span>
  <h1>${plan.titleHtml}</h1>
  ${plan.goal ? `<p class="lead">${plan.goal}</p>` : ''}
  <div class="meta">${metaChips}</div>
  <div class="prog"><div class="bar" role="img" aria-label="${plan.ticks.done} trên ${plan.ticks.total} việc đã xong"><span style="width:${pct}%"></span></div><span class="mono">${plan.ticks.done}/${plan.ticks.total} việc</span></div>
</header>
<section id="dang-o" aria-labelledby="h-where"><span class="label">Đang ở đâu</span><h2 id="h-where" class="vh">Đang ở đâu</h2>${where}${jump}</section>
<section id="tuyen" aria-labelledby="h-line">
  <span class="label">Checkpoint</span>
  <h2 id="h-line">${plan.checkpoints.length} ga, mỗi ga xong khi bạn tự kiểm được</h2>
  ${daymap}
  <ol class="line">${stops}</ol>
  ${legend}
</section>
${options}
${ask}
${more}
${log}
<footer>${source ? `Sinh từ <a href="${esc(source)}">${esc(source.replace(/^https:\/\/github\.com\//, ''))}</a>` : ''}${plan.links.length ? ' · ' + plan.links.map((l) => (l.key ? esc(l.key) + ': ' : '') + l.html).join(' · ') : ''}</footer>
</main>`;
  const data = {
    id, title: plain(plan.titleHtml), state: plan.state, open: !!open, trial,
    questions: open ? plan.questions.map((q) => ({ id: q.id, q: q.q, qText: q.qText, options: q.options.map((o) => ({ html: o.html, text: o.text.replace(/\*\*|`/g, ''), rec: !!o.rec, other: !!o.other, why: o.why })) })) : [],
    checkpoints: plan.checkpoints.map((c) => ({ id: c.id, num: c.num, name: c.name.replace(/\*\*|`/g, ''), state: c.state, est: c.estimate, gate: c.gate, doneDate: c.doneDate })),
  };
  return { body, data };
}

export function build(mdPath, out, { repo = '', url = '', trial = '', today = '' } = {}) {
  const md = readFileSync(mdPath, 'utf8');
  const rel = repoPath(mdPath);
  const linkBase = repo && rel ? `${repo}:${rel}` : '';
  const { plan, issues } = parsePlanFile(md, { linkBase, today });
  const fatal = issues.filter((i) => i.level === 'lỗi');
  if (fatal.length) { const e = new Error(fatal.map((i) => `${mdPath}:${i.line}: ${i.msg}`).join('\n')); e.issues = issues; throw e; }
  const id = basename(mdPath).replace(/\.md$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const hasMap = plan.checkpoints.some((c) => c.estimate != null);
  const { body, data } = render(plan, { id, repo, source: repo && rel ? `https://github.com/${repo}/blob/main/${rel}` : '',
    trial: trial || (hasMap ? 'Bản đồ ga theo ngày và núm "mỗi tuần làm được mấy phiên", lấy từ bản Thật xa của vòng gu 1, giữ nền sáng và chữ cỡ thường.' : 'Tuyến checkpoint vẽ như tuyến tàu; ga xong tô xanh, ga đang chạy viền cam.') });
  const html = packHtml(readFileSync(join(here, 'template.html'), 'utf8')
    .replace('__TITLE__', () => esc(plain(plan.titleHtml)))
    .replace('/*KIT_CSS*/', () => readFileSync(join(here, '../kit/kit.css'), 'utf8'))
    .replace('/*KIT_JS*/', () => readFileSync(join(here, '../kit/kit.js'), 'utf8'))
    .replace('/*PLAN_JS*/', () => readFileSync(join(here, 'plan.js'), 'utf8'))
    .replace('<!--BODY-->', () => body)
    .replace('__PLAN__', () => JSON.stringify(data).replace(/</g, '\\u003c')));
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'preview.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${html}\n</body></html>\n`);
  const lines = writePublish(out, { url, capabilities: { comments: {}, db: {} }, icon: 'plan', description: 'Kế hoạch: ' + plain(plan.titleHtml) });
  return { plan, issues, lines, id };
}

/** Đường dẫn của file trong repo git chứa nó (để link về GitHub), hay '' khi không trong repo. */
function repoPath(file) {
  try {
    const top = execFileSync('git', ['-C', dirname(resolve(file)), 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return relative(realpathSync(top), realpathSync(resolve(file))).split('\\').join('/');
  } catch { return ''; }
}

/** In chỗ lệch mẫu của một file; trả về số lỗi chặn dựng. */
export function report(file, issues, log = console.log) {
  const shown = issues.filter((i) => i.level !== 'ghi chú');
  const notes = issues.length - shown.length;
  if (!shown.length) log(`${file}: đúng mẫu${notes ? ` (${notes} ghi chú)` : ''}.`);
  for (const i of shown) log(`${file}:${i.line}: ${i.level}: ${i.msg}`);
  return issues.filter((i) => i.level === 'lỗi').length;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf('--' + n); if (i < 0) return ''; const v = args[i + 1]; if (!v || v.startsWith('--')) { console.error(`--${n} cần một giá trị`); process.exit(2); } return args.splice(i, 2)[1]; };
  if (args[0] === '--check') {
    const files = args.slice(1).flatMap((p) => statSync(p).isDirectory() ? readdirSync(p).filter((f) => f.endsWith('.md')).sort().map((f) => join(p, f)) : [p]);
    if (!files.length) { console.error('Cách dùng: node make-plan.mjs --check <plan.md|thư-mục> ...'); process.exit(2); }
    let bad = 0;
    for (const f of files) {
      const md = readFileSync(f, 'utf8');
      if (!/^## Checkpoint/m.test(md)) { console.log(`${f}: bỏ qua, viết trước mẫu (không có "## Checkpoint").`); continue; }
      bad += report(f, parsePlanFile(md).issues);
    }
    process.exit(bad ? 1 : 0);
  }
  const repo = opt('repo') || 'thiengthb/thienai-workflow', url = opt('url'), trial = opt('trial');
  const [mdPath, out] = args;
  if (!mdPath || !out) { console.error('Cách dùng: node make-plan.mjs <plan.md> <out-dir> [--repo owner/repo] [--url <link trang cũ>] [--trial "<chi tiết thử>"]'); process.exit(2); }
  try {
    const { plan, issues, lines } = build(mdPath, resolve(out), { repo, url, trial });
    report(mdPath, issues);
    console.log(`Đã dựng "${plain(plan.titleHtml)}" (${plan.checkpoints.length} ga, ${plan.questions.length} câu hỏi${plan.answered ? ' đã trả lời' : ''}) vào ${resolve(out)}/index.html`);
    for (const l of lines) console.log(l);
  } catch (e) { console.error(e.message); process.exit(1); }
}
