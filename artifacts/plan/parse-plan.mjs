// Đọc một file kế hoạch viết theo templates/PLAN.template.md thành dữ liệu cho trang kế hoạch (make-plan.mjs),
// kèm danh sách chỗ lệch mẫu có số dòng. Không đoán: dòng không nhận ra thì báo, và vẫn hiện nguyên chữ trên trang.
//
//   parsePlanFile(md, { linkBase: 'owner/repo:docs/plans/x.md' }) → { plan, issues }
//   issues: [{ level: 'lỗi' | 'lệch' | 'ghi chú', line, msg }]; có 'lỗi' thì không dựng được trang.
import { inline as mdInline, blocks as mdBlocks, tableRows } from '../../templates/progress-page.mjs';

/** Link trần (https://...) thành link markdown có chữ ngắn, để không tràn dòng trên điện thoại. */
export function linkify(t) {
  return String(t).replace(/(^|[^(\[<])(https:\/\/[^\s)<>\]]+?)(?=[.,;:]?(?:\s|$|\)))/g, (_, a, u) => {
    const short = u.replace(/^https:\/\/(www\.)?/, '').replace(/^claude\.ai\/(artifact|code)\/(\w{5})\w+/, 'claude.ai/$1/$2…');
    return `${a}[${short.length > 40 ? short.slice(0, 39) + '…' : short}](${u})`;
  });
}
let linkBase = '';
const ln = (t) => mdInline(linkify(t), linkBase);
const blocks = (lines) => mdBlocks(lines.map(linkify), linkBase);

const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
export const STATES = ['đang chạy', 'chờ duyệt', 'tạm dừng', 'xong', 'bỏ'];
export const REQUIRED = ['Đang ở đâu', 'Mục tiêu', 'Không làm', 'Checkpoint', 'Đã đổi', 'Lỗi gặp'];
/** Mục có chỗ riêng trên trang; mục khác hiện ở phần "Thêm" theo đúng thứ tự trong file. */
const KNOWN = [...REQUIRED, 'Các phương án đã xét', 'Câu hỏi'];

/** Markdown thành { title, titleLine, intro: [{ text, line }], sections: [{ title, level, line, lines: [{ text, line }] }] }. */
export function outline(md) {
  const out = { title: '', titleLine: 0, intro: [], sections: [] };
  let cur = null, fence = false;
  lf(md).split('\n').forEach((text, k) => {
    const line = k + 1;
    if (/^\s*```/.test(text)) fence = !fence;
    const h = fence ? null : /^(#{1,3})\s+(.*?)\s*#*\s*$/.exec(text);
    if (h && h[1].length === 1 && !out.title && !cur) { out.title = h[2]; out.titleLine = line; return; }
    if (h && h[1].length >= 2) { cur = { title: h[2], level: h[1].length, line, lines: [] }; out.sections.push(cur); return; }
    (cur ? cur.lines : out.intro).push({ text, line });
  });
  return out;
}

const ISO = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
/** Ngày muộn nhất (YYYY-MM-DD) nhắc trong chữ, hoặc ''. */
export const lastDate = (s, max = '9999') => [...String(s).matchAll(ISO)].map((m) => m[0]).filter((d) => d <= max).sort().pop() || '';
/** "bỏ" đứng riêng (\b không nhận chữ có dấu). */
const DROP = /(^|[\s(,;])bỏ(?=[\s,.:;)]|$)/i;

/** "1,5" → 1.5; "1–2" → 1.5; không phải số → NaN. */
export function sessions(s) {
  const nums = String(s).replace(/,/g, '.').match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length > 2) return NaN;
  return nums.map(Number).reduce((a, b) => a + b, 0) / nums.length;
}

/** "Trạng thái: x · Duyệt: y · nick tnt697 · Chat: <link>" → { fields: {Trạng thái: 'x', ...}, free: ['nick tnt697'] }. */
export function metaLine(text) {
  const fields = {}, free = [];
  for (const seg of text.split(/\s+·\s+/)) {
    const m = /^([^:()[\]]{1,24}):\s*(.*)$/.exec(seg.trim());
    if (m) fields[m[1].trim()] = m[2].trim(); else if (seg.trim()) free.push(seg.trim());
  }
  return { fields, free };
}

/** Mục gạch đầu dòng cấp 1 (gộp dòng tiếp theo thụt vào), giữ số dòng của gạch đầu. */
function items(lines) {
  const out = [];
  for (const { text, line } of lines) {
    const m = /^(?:[-*]|\d+\.)\s+(.*)$/.exec(text);
    if (m) out.push({ text: m[1], line, sub: [] });
    else if (out.length && /^\s+([-*])\s+/.test(text)) out[out.length - 1].sub.push({ text: text.replace(/^\s+[-*]\s+/, ''), line });
    else if (out.length && /^\s+\S/.test(text)) {
      const last = out[out.length - 1];
      if (last.sub.length) last.sub[last.sub.length - 1].text += ' ' + text.trim(); else last.text += ' ' + text.trim();
    }
  }
  return out;
}

/** Ngày của mốc "mốc 01/12" trong tên checkpoint, tính năm theo ngày duyệt. */
function gateDate(name, approved) {
  const iso = /mốc\s+(\d{4}-\d{2}-\d{2})/i.exec(name);
  if (iso) return iso[1];
  const m = /mốc\s+(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/i.exec(name);
  if (!m) return '';
  const base = /^(\d{4})-(\d{2})/.exec(approved || '');
  let y = m[3] ? +m[3] : base ? +base[1] : new Date().getUTCFullYear();
  if (!m[3] && base && +m[2] < +base[2]) y++;
  return `${y}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
}

/** Câu hỏi: "1. Câu? Đề xuất: X." với các lựa chọn thụt vào ("   - Có (đề xuất)"), hay không có lựa chọn (lấy câu đề xuất). */
function questions(sec, issue, answered) {
  if (answered) issue = () => {};
  return items(sec.lines).map((it, k) => {
    let q = it.text, opts;
    if (it.sub.length) {
      opts = it.sub.map((o) => ({ text: o.text.replace(/\s*\(đề xuất\)\s*$/i, ''), rec: /\(đề xuất\)\s*$/i.test(o.text) }));
      if (!opts.some((o) => o.rec)) issue('lệch', it.line, `câu hỏi ${k + 1} có lựa chọn nhưng không lựa chọn nào ghi "(đề xuất)": thien không trả lời "ok" được.`);
    } else {
      const m = /^(.*?)\s*Đề xuất:\s*(.+)$/i.exec(q);
      if (m) {
        q = m[1];
        const rec = m[2].replace(/\s+$/, '');
        const short = /^(.+?[.!?])(\s|$)/.exec(rec)?.[1] || rec;
        opts = [{ text: 'Đồng ý: ' + short.replace(/[.]$/, ''), rec: true, why: rec.slice(short.length).trim() }, { text: 'Không, mình ghi ở ô dưới', other: true }];
      } else {
        issue('lệch', it.line, `câu hỏi ${k + 1} không có "Đề xuất: ..." hay lựa chọn thụt vào: trang chỉ có nút Ok và Khác.`);
        opts = [{ text: 'Ok', rec: true }, { text: 'Khác, mình ghi ở ô dưới', other: true }];
      }
    }
    return { id: 'q' + (k + 1), q: ln(q), qText: q.replace(/\*\*|`/g, ''), options: opts.map((o) => ({ ...o, html: ln(o.text), why: o.why ? ln(o.why) : '' })) };
  });
}

export function parsePlanFile(md, opts = {}) {
  linkBase = opts.linkBase || '';
  const doc = outline(md), issues = [];
  const issue = (level, line, msg) => issues.push({ level, line, msg });
  if (!doc.title) issue('lỗi', 1, 'thiếu tiêu đề "# <Tên kế hoạch>" ở dòng đầu.');

  const metaRow = doc.intro.find((l) => /^Trạng thái:/.test(l.text));
  const meta = metaRow ? metaLine(metaRow.text) : { fields: {}, free: [] };
  const state = (meta.fields['Trạng thái'] || '').replace(/\s*\(.*$/, '').trim();
  if (!metaRow) issue('lệch', doc.titleLine + 1, 'thiếu dòng "Trạng thái: đang chạy · Duyệt: <ngày> · Cập nhật: <ngày>" dưới tiêu đề.');
  else if (!STATES.some((s) => state.startsWith(s))) issue('lệch', metaRow.line, `trạng thái "${state}" không nằm trong: ${STATES.join(', ')}.`);

  const top = doc.sections.filter((s) => s.level === 2);
  const find = (name) => top.find((s) => s.title.startsWith(name));
  for (const name of REQUIRED) if (!find(name)) issue(name === 'Checkpoint' ? 'lỗi' : 'lệch', doc.titleLine, `thiếu mục "## ${name}".`);

  // Checkpoint: các mục ### nằm ngay sau "## Checkpoint".
  const ckIdx = doc.sections.findIndex((s) => s.level === 2 && s.title.startsWith('Checkpoint'));
  const approved = lastDate(meta.fields['Duyệt'] || '') || lastDate(meta.fields['Cập nhật'] || '');
  // Ngày trong tương lai ("xem lại 2026-12-01") không phải ngày xong: chỉ lấy ngày tới hôm nay.
  const updated = opts.today || new Date(Date.now() + 864e5).toISOString().slice(0, 10);   // +1 ngày: máy chạy giờ UTC, thien ở UTC+7
  const closed = /^(xong|bỏ)/.test(state);
  const checkpoints = [];
  for (let k = ckIdx + 1; ckIdx >= 0 && k < doc.sections.length && doc.sections[k].level === 3; k++) {
    const s = doc.sections[k];
    const m = /^(\d+)\.\s+(.*)$/.exec(s.title);
    if (!m) issue('lệch', s.line, `checkpoint "${s.title}" không bắt đầu bằng số thứ tự ("### 1. ...").`);
    const full = m ? m[2] : s.title;
    const paren = /^(.*?)\s*(\((?:[^()]|\([^()]*\))*\)|✓.*)\s*$/.exec(full);
    const name = (paren && paren[1] ? paren[1] : full).trim();
    const note = paren && paren[1] ? paren[2].replace(/^\(|\)$/g, '').replace(/^✓\s*/, 'xong ').trim() : '';
    let doneWhen = '', estimate = null;
    const notes = [];
    const tasks = [];
    let lastTask = null;
    for (const { text, line } of s.lines) {
      if (!text.trim()) { lastTask = null; continue; }
      let mm;
      if ((mm = /^Xong khi:\s*(.*)$/.exec(text))) { doneWhen = mm[1]; continue; }
      if ((mm = /^Ước:\s*(.*)$/.exec(text))) {
        if (/^mốc\b/i.test(mm[1])) { estimate = 0; continue; }
        const n = sessions(mm[1]);
        if (Number.isNaN(n)) issue('lệch', line, `dòng "Ước:" cần số phiên, ví dụ "Ước: 2 phiên" hay "Ước: 1–2 phiên": "${mm[1]}".`);
        else estimate = n;
        continue;
      }
      if ((mm = /^\s*[-*]\s+\[( |x|X)\]\s*(.*)$/.exec(text)) && !/^\s{2,}/.test(text)) { lastTask = { text: mm[2], done: mm[1] !== ' ', line }; tasks.push(lastTask); continue; }
      if (lastTask && /^\s+\S/.test(text)) { lastTask.text += ' ' + text.trim(); continue; }
      notes.push(text.trim());
    }
    const dropped = DROP.test(' ' + note) && /^bỏ/i.test(note);
    if (!doneWhen && !dropped) issue('lệch', s.line, `checkpoint "${name}" thiếu dòng "Xong khi: ...".`);
    if (!tasks.length && !dropped) issue('lệch', s.line, `checkpoint "${name}" chưa có việc nào dạng "- [ ] ...".`);
    if (notes.length) issue('ghi chú', s.line, `checkpoint "${name}" có ${notes.length} dòng chữ thường (không phải "- [ ]"), trang hiện chúng như ghi chú.`);
    const done = tasks.filter((t) => t.done).length;
    checkpoints.push({
      id: 'ck-' + (m ? m[1] : k), num: m ? m[1] : String(checkpoints.length + 1), name, nameHtml: ln(name), note: note ? ln(note) : '',
      doneWhen: doneWhen ? ln(doneWhen) : '', estimate, gate: gateDate(name + ' ' + note, approved),
      tasks: tasks.map((t) => ({ done: t.done, html: ln(t.text) })), notes: notes.map((n) => ln(n.replace(/^[-*]\s+/, ''))),
      done, total: tasks.length, dropped,
      finished: dropped || (tasks.length > 0 && done === tasks.length) || /^xong(?=[\s,.:;]|$)/i.test(note),
      doneDate: lastDate(note, updated) || lastDate(tasks.map((t) => t.text).join(' '), updated),
    });
  }
  if (ckIdx >= 0 && !checkpoints.length) issue('lỗi', doc.sections[ckIdx].line, 'mục Checkpoint chưa có checkpoint nào ("### 1. ...").');
  const current = closed ? -1 : checkpoints.findIndex((c) => !c.finished);
  checkpoints.forEach((c, k) => { c.state = c.dropped ? 'dropped' : c.finished ? 'done' : k === current ? 'now' : 'todo'; });

  // Đang ở đâu: "Đang ở: ...", "Còn thiếu: ...", "thien cần làm: ...".
  const whereSec = find('Đang ở đâu');
  const whereItems = whereSec ? items(whereSec.lines) : [];
  if (whereItems.length > 3) issue('lệch', whereSec.line, `mục "Đang ở đâu" có ${whereItems.length} dòng; luật là ba dòng (Đang ở, Còn thiếu, thien cần làm). Trang gập các dòng còn lại.`);
  const where = whereItems.map((it) => {
    const m = /^([^:]{2,24}):\s*(.*)$/.exec(it.text);
    return { key: m ? m[1] : '', html: ln(m ? m[2] : it.text), ask: !!m && /cần làm/i.test(m[1]) };
  });

  // Phương án: hàng đầu là tên các cột; hàng in đậm (hay có chữ "chọn") là phương án đã chọn.
  const optSec = find('Các phương án đã xét');
  let options = null;
  if (optSec) {
    const rows = optSec.lines.filter((l) => /^\s*\|/.test(l.text)).map((l) => l.text.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
    const head = rows[0] || [];
    const body = tableRows(optSec.lines.map((l) => l.text));
    if (!body.length) issue('lệch', optSec.line, 'mục "Các phương án đã xét" không có bảng "| Phương án | Hợp khi | Lý do không chọn |".');
    options = body.map((r) => {
      const chosen = /\*\*/.test(r[0]) || /\(chọn\)/i.test(r[0]);
      const name = r[0].replace(/\*\*/g, '').replace(/\s*\(chọn\)\s*/i, '').trim();
      const km = /^([A-Z])[.)]\s*(.*)$/.exec(name);
      return { key: km ? km[1] : '', nameHtml: ln(km ? km[2] : name), chosen,
        rows: head.slice(1).map((h, j) => {
          const label = chosen && /không chọn/i.test(h) ? 'Chỗ yếu' : h;
          return { label, html: ln((r[j + 1] || '').replace(new RegExp('^' + label + ':\\s*', 'i'), '')) };   // ô đã tự ghi "Chỗ yếu: ..." thì không lặp nhãn
        }).filter((x) => x.html) };
    });
  }

  // Câu hỏi: mục "## Câu hỏi" (chưa trả lời) có nút; "## Câu hỏi đã chốt" hay "(... đã trả lời ...)" chỉ để đọc.
  const qSec = top.find((s) => /^Câu hỏi/.test(s.title));
  const answered = !!qSec && /đã (trả lời|chốt)/i.test(qSec.title);
  const qs = qSec ? questions(qSec, issue, answered) : [];

  const list = (name) => { const s = find(name); return s ? items(s.lines).map((it) => ln(it.text)) : []; };
  const goalSec = find('Mục tiêu');
  // Mục khác (Nghiên cứu, Thời gian, Quyết định lúc duyệt...): dựng nguyên markdown, mục ### con thành tiêu đề nhỏ.
  const extras = [];
  let cur = null;
  for (const s of doc.sections) {
    if (s.level === 2) {
      cur = KNOWN.some((n) => s.title.startsWith(n)) || /^Câu hỏi/.test(s.title) ? null : { title: ln(s.title), html: [] };
      if (cur) { cur.html.push(blocks(s.lines.map((l) => l.text))); extras.push(cur); }
    } else if (cur) cur.html.push(`<h4>${ln(s.title)}</h4>`, blocks(s.lines.map((l) => l.text)));
  }

  const plan = {
    title: doc.title, titleHtml: ln(doc.title), state: state || 'đang chạy', stateFull: meta.fields['Trạng thái'] || '',
    approved: meta.fields['Duyệt'] ? ln(meta.fields['Duyệt']) : '', approvedDate: approved,
    updated: lastDate(meta.fields['Cập nhật'] || ''),
    page: (/https:\/\/\S+?(?=[\s),]|$)/.exec(meta.fields.Trang || '') || [''])[0],
    nick: (meta.free.find((f) => /^nick\s+\S+/i.test(f)) || '').replace(/^nick\s+/i, ''),
    links: [...Object.entries(meta.fields).filter(([k]) => !['Trạng thái', 'Duyệt', 'Cập nhật', 'Trang'].includes(k)).map(([k, v]) => ({ key: k, html: ln(v) })),
      ...meta.free.filter((f) => !/^nick\s/i.test(f)).map((f) => ({ key: '', html: ln(f) }))],
    goal: goalSec ? ln(goalSec.lines.map((l) => l.text.trim()).filter(Boolean).join(' ')) : '',
    where, notDo: list('Không làm'), options, checkpoints, current,
    ticks: checkpoints.reduce((a, c) => ({ done: a.done + c.done, total: a.total + c.total }), { done: 0, total: 0 }),
    questions: qs, answered, questionsTitle: qSec ? ln(qSec.title) : '',
    questionsIntro: qSec ? ln(qSec.lines.filter((l) => l.text.trim() && !/^(\s|[-*]\s|\d+\.\s)/.test(l.text)).map((l) => l.text.trim()).join(' ')) : '',
    changes: tableRows(find('Đã đổi')?.lines.map((l) => l.text) ?? []).map((r) => r.map((c) => ln(c))),
    errors: tableRows(find('Lỗi gặp')?.lines.map((l) => l.text) ?? []).map((r) => r.map((c) => ln(c))),
    extras: extras.map((e) => ({ title: e.title, html: e.html.join('\n') })),
  };
  return { plan, issues };
}
