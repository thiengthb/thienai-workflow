#!/usr/bin/env node
// Builds one self-contained HTML page from progress files, to publish as an artifact.
//
//   Progress of one or more repos (docs/STATUS.md + docs/plans/*.md):
//     node progress-page.mjs --title "Tiến độ" <dir>=<owner/repo> [<dir>=<owner/repo> ...] > page.html
//     A repo that cannot be read here is listed with its reason: missing=<owner/repo>:<reason>
//   Learning roadmap (one markdown file, "##" = subject, "###" = stage):
//     node progress-page.mjs --title "Lộ trình học" --roadmap <file.md>=<owner/repo>:<path in repo> > page.html
//
// Plan files follow templates/PLAN.template.md; rules in profile/PLANNING.md.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inline markdown: code, bold, links. Relative links point to GitHub. */
export function inline(text, linkBase) {
  const parts = text.split(/(`[^`]+`)/);
  return parts.map((p) => {
    if (/^`[^`]+`$/.test(p)) return `<code>${esc(p.slice(1, -1))}</code>`;
    let s = esc(p);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => {
      const url = resolveLink(href.replace(/&amp;/g, '&'), linkBase);
      return `<a href="${esc(url)}">${t}</a>`;
    });
    return s;
  }).join('');
}

function resolveLink(href, linkBase) {
  if (/^(https?:|#|mailto:)/.test(href) || !linkBase) return href;
  const [repo, file] = linkBase.split(':');
  const path = posix.normalize(posix.join(posix.dirname(file), href));
  return `https://github.com/${repo}/blob/main/${path}`;
}

/** Splits markdown into { title, intro, sections: [{ title, level, lines }] } by "##" and "###". */
export function sections(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  const out = { title: '', intro: [], sections: [] };
  let cur = null;
  for (const l of lines) {
    const h = /^(#{1,3})\s+(.*)$/.exec(l);
    if (h && h[1].length === 1 && !out.title) { out.title = h[2].trim(); continue; }
    if (h && h[1].length >= 2) { cur = { title: h[2].trim(), level: h[1].length, lines: [] }; out.sections.push(cur); continue; }
    (cur ? cur.lines : out.intro).push(l);
  }
  return out;
}

export const ticks = (lines) => {
  let done = 0, total = 0;
  for (const l of lines) {
    const m = /^\s*[-*]\s+\[( |x|X)\]/.exec(l);
    if (m) { total++; if (m[1] !== ' ') done++; }
  }
  return { done, total };
};

/** Data rows of the first markdown table in the lines (header and separator skipped, placeholder rows too). */
export function tableRows(lines) {
  const rows = lines.filter((l) => /^\s*\|/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
  return rows.slice(2).filter((r) => r.some((c) => c && !/^<.*>$/.test(c)));
}

/** Markdown block renderer for the subset used in STATUS, plans and the roadmap. */
export function blocks(lines, linkBase) {
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (/^\s*\|/.test(l)) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = rows.map((r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      const body = cells.slice(2).filter((r) => r.some((c) => c && !/^<.*>$/.test(c)));
      if (!body.length) { html.push('<p class="muted">Chưa có.</p>'); continue; }
      html.push('<div class="table"><table><thead><tr>' + cells[0].map((c) => `<th>${inline(c, linkBase)}</th>`).join('') + '</tr></thead><tbody>' +
        body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c, linkBase)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
      const ordered = /^\s*\d+\./.test(l);
      const items = [];
      while (i < lines.length && (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        const cur = lines[i++];
        if (/^\s*([-*]|\d+\.)\s+/.test(cur)) items.push(cur.replace(/^\s*([-*]|\d+\.)\s+/, ''));
        else items[items.length - 1] += ' ' + cur.trim();
      }
      const lis = items.map((it) => {
        const c = /^\[( |x|X)\]\s*(.*)$/.exec(it);
        if (c) {
          const done = c[1] !== ' ';
          return `<li class="check ${done ? 'done' : 'todo'}"><span class="box" aria-label="${done ? 'đã xong' : 'chưa xong'}">${done ? '✓' : ''}</span><span>${inline(c[2], linkBase)}</span></li>`;
        }
        return `<li>${inline(it, linkBase)}</li>`;
      });
      const checklist = items.some((it) => /^\[( |x|X)\]/.test(it));
      html.push(`<${ordered ? 'ol' : 'ul'}${checklist ? ' class="checks"' : ''}>${lis.join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^\s*(\||[-*]\s|\d+\.\s)/.test(lines[i])) para.push(lines[i++].trim());
    html.push(`<p>${inline(para.join(' '), linkBase)}</p>`);
  }
  return html.join('\n');
}

const bar = ({ done, total }) => total
  ? `<div class="bar" role="img" aria-label="${done} trên ${total} việc đã xong"><span style="width:${Math.round((done / total) * 100)}%"></span></div><span class="count">${done}/${total}</span>`
  : '';

/** Reads a plan file into a summary plus rendered detail. */
export function parsePlan(md, linkBase) {
  const doc = sections(md);
  const meta = Object.fromEntries((doc.intro.find((l) => /^Trạng thái:/.test(l)) ?? '').split('·').map((p) => p.split(':').map((s) => s.trim())).filter((p) => p.length >= 2).map(([k, ...v]) => [k, v.join(':')]));
  const find = (name) => doc.sections.find((s) => s.level === 2 && s.title.startsWith(name));
  const ckStart = doc.sections.findIndex((s) => s.level === 2 && s.title.startsWith('Checkpoint'));
  const checkpoints = [];
  for (let k = ckStart + 1; ckStart >= 0 && k < doc.sections.length && doc.sections[k].level === 3; k++) checkpoints.push(doc.sections[k]);
  const all = checkpoints.reduce((a, c) => { const t = ticks(c.lines); return { done: a.done + t.done, total: a.total + t.total }; }, { done: 0, total: 0 });
  const current = checkpoints.findIndex((c) => { const t = ticks(c.lines); return t.total === 0 || t.done < t.total; });
  return {
    title: doc.title, meta, all, checkpoints, current,
    where: find('Đang ở đâu')?.lines ?? [],
    changes: tableRows(find('Đã đổi')?.lines ?? []),
    errors: tableRows(find('Lỗi gặp')?.lines ?? []),
    doc, linkBase,
  };
}

function planCard(p) {
  const state = p.meta['Trạng thái'] || 'đang chạy';
  const ck = p.checkpoints.map((c, idx) => {
    const t = ticks(c.lines);
    const label = idx === p.current ? '<span class="pill now">đang ở đây</span>' : t.total && t.done === t.total ? '<span class="pill ok">xong</span>' : '';
    return `<details${idx === p.current ? ' open' : ''}><summary><span class="ck-title">${inline(c.title, p.linkBase)}</span>${label}<span class="ck-count">${t.done}/${t.total}</span></summary>${blocks(c.lines, p.linkBase)}</details>`;
  }).join('');
  const sec = (name, rows, cls) => rows.length ? `<details class="log ${cls}"><summary>${name} <span class="ck-count">${rows.length}</span></summary>${blocks(p.doc.sections.find((s) => s.title.startsWith(name)).lines, p.linkBase)}</details>` : '';
  return `<article class="plan">
  <header><h4 class="plan-title">${inline(p.title, p.linkBase)}</h4><span class="pill state">${esc(state)}</span></header>
  <div class="progress">${bar(p.all)}</div>
  <p class="meta">${['Duyệt', 'Cập nhật'].filter((k) => p.meta[k]).map((k) => `${k} ${esc(p.meta[k])}`).join(' · ')}${p.meta.Thread ? ` · ${inline(p.meta.Thread, p.linkBase)}` : ''}</p>
  <div class="where">${blocks(p.where, p.linkBase)}</div>
  <div class="cks">${ck}</div>
  ${sec('Đã đổi', p.changes, 'changes')}${sec('Lỗi gặp', p.errors, 'errors')}
</article>`;
}

function repoSection(dir, repo) {
  const statusFile = join(dir, 'docs/STATUS.md');
  const status = existsSync(statusFile) ? sections(readFileSync(statusFile, 'utf8')) : null;
  const base = (f) => `${repo}:${f}`;
  const pick = (name) => status?.sections.find((s) => s.title.startsWith(name));
  const plansDir = join(dir, 'docs/plans');
  const files = existsSync(plansDir) ? readdirSync(plansDir).filter((f) => f.endsWith('.md')).sort().reverse()
    .map((f) => [f, readFileSync(join(plansDir, f), 'utf8')]) : [];
  // Only plans written from PLAN.template.md have checkpoints; older free-form plans are counted, not parsed.
  const plans = files.filter(([, md]) => /^## Checkpoint/m.test(md)).map(([f, md]) => parsePlan(md, base(`docs/plans/${f}`)));
  const legacy = files.length - plans.length;
  const updated = status ? (status.intro.find((l) => /^Cập nhật/.test(l)) ?? '').split('·').slice(0, 2).join('·').trim() : '';
  const running = plans.filter((p) => !/^(xong|bỏ)/.test(p.meta['Trạng thái'] || ''));
  const waiting = pick('Đang chờ thien');
  const waitingItems = [];
  let keep = false;
  for (const l of waiting?.lines ?? []) {
    if (/^\s*([-*]|\d+\.)\s+\S/.test(l) && !/^\s/.test(l)) { keep = !/<.*>/.test(l); if (keep) waitingItems.push(l); }
    else if (keep && /^\s+\S/.test(l)) waitingItems.push(l);
    else if (!l.trim()) keep = false;
  }
  const unfinished = pick('Việc dở');
  const id = repoId(repo);
  return `<section class="repo" id="${esc(id)}">
  <h2><a href="https://github.com/${esc(repo)}">${esc(repo.split('/')[1])}</a></h2>
  ${updated ? `<p class="meta">${inline(updated, base('docs/STATUS.md'))}</p>` : ''}
  ${status ? `<div class="now-box"><h3 class="label">Đang ở đâu</h3>${blocks(pick('Đang ở đâu')?.lines ?? [], base('docs/STATUS.md'))}</div>` : '<p class="muted">Repo này chưa có <code>docs/STATUS.md</code>.</p>'}
  ${waitingItems.length ? `<div class="ask"><h3 class="label">Cần thien làm</h3>${blocks(waitingItems, base('docs/STATUS.md'))}</div>` : ''}
  ${unfinished && tableRows(unfinished.lines).length ? `<div><h3 class="label">Việc dở</h3>${blocks(unfinished.lines.filter((l) => /^\s*\|/.test(l)), base('docs/STATUS.md'))}</div>` : ''}
  <h3 class="label">Kế hoạch đang chạy</h3>
  ${running.length ? running.map(planCard).join('\n') : '<p class="muted">Không có kế hoạch nào đang chạy.</p>'}
  ${legacy ? `<p class="muted">${legacy} kế hoạch viết trước khi có mẫu, chưa có checkpoint để đếm: xem trong <a href="https://github.com/${esc(repo)}/tree/main/docs/plans">docs/plans</a>.</p>` : ''}
  ${plans.length > running.length ? `<details class="done-plans"><summary>Kế hoạch đã xong hoặc đã bỏ <span class="ck-count">${plans.length - running.length}</span></summary>${plans.filter((p) => !running.includes(p)).map((p) => `<p>${inline(p.title, p.linkBase)} · ${esc(p.meta['Trạng thái'] || '')}</p>`).join('')}</details>` : ''}
</section>`;
}

/** Section id from the full owner/repo, one-to-one so no two repos share an anchor: letters and digits stay,
 *  "-" becomes "--", any other character becomes "-<hex code>-" ("/" is "-2f-"). */
export const repoId = (repo) => repo.toLowerCase().replace(/[^a-z0-9]/g, (c) => (c === '-' ? '--' : `-${c.charCodeAt(0).toString(16)}-`));

function overview(repos) {
  if (repos.length < 2) return '';
  return `<nav class="overview" aria-label="Các repo">${repos.map((r) => `<a href="#${esc(r.id)}" class="tile${r.missing ? ' missing' : ''}"><strong>${esc(r.name)}</strong>${r.upd ? `<span>Cập nhật ${esc(r.upd)}</span>` : ''}<span>${esc(r.line)}</span></a>`).join('')}</nav>`;
}

function roadmap(file, linkBase) {
  const doc = sections(readFileSync(file, 'utf8'));
  const out = [`<div class="intro">${blocks(doc.intro, linkBase)}</div>`];
  let subject = null;
  const flush = () => { if (subject) out.push(subject.html + '</section>'); };
  for (const s of doc.sections) {
    if (s.level === 2) {
      flush();
      const stages = doc.sections.slice(doc.sections.indexOf(s) + 1);
      const own = [];
      for (const st of stages) { if (st.level === 2) break; own.push(st); }
      const all = own.reduce((a, c) => { const t = ticks(c.lines); return { done: a.done + t.done, total: a.total + t.total }; }, { done: 0, total: 0 });
      const current = own.findIndex((c) => { const t = ticks(c.lines); return t.total > 0 && t.done < t.total; });
      subject = { html: `<section class="subject"><h2>${inline(s.title, linkBase)}</h2><div class="progress">${bar(all)}</div>${blocks(s.lines, linkBase)}`, own, current };
    } else if (subject) {
      const idx = subject.own.indexOf(s);
      const t = ticks(s.lines);
      const label = idx === subject.current ? '<span class="pill now">đang ở đây</span>' : t.total && t.done === t.total ? '<span class="pill ok">xong</span>' : '';
      subject.html += `<details${idx === subject.current || (!t.total && /Bài đã học|Nguồn|đổi/i.test(s.title)) ? ' open' : ''}><summary><span class="ck-title">${inline(s.title, linkBase)}</span>${label}${t.total ? `<span class="ck-count">${t.done}/${t.total}</span>` : ''}</summary>${blocks(s.lines, linkBase)}</details>`;
    }
  }
  flush();
  return { title: doc.title, html: out.join('\n') };
}

export function page(title, body, stamp) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  /* One column on phones, wider column on laptops; state shown by pills and bars, not decoration. */
  --bg: #f7f7f5; --card: #ffffff; --ink: #18181b; --muted: #6b6b70; --line: #e4e4e0;
  --ok: #15803d; --ok-soft: #e7f5ec; --wait: #b45309; --wait-soft: #fdf3e2; --err: #b91c1c;
  --font: "Onest", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #121214; --card: #1b1b1e; --ink: #ededee; --muted: #a0a0a6; --line: #2c2c31;
  --ok: #4ade80; --ok-soft: #173322; --wait: #fbbf24; --wait-soft: #33280f; --err: #f87171; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #121214; --card: #1b1b1e; --ink: #ededee; --muted: #a0a0a6; --line: #2c2c31;
  --ok: #4ade80; --ok-soft: #173322; --wait: #fbbf24; --wait-soft: #33280f; --err: #f87171; color-scheme: dark; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { background: var(--bg); color: var(--ink); font: 16px/1.55 var(--font); }
main { max-width: 760px; margin: 0 auto; padding: 24px 16px 64px; display: grid; gap: 20px; }
h1 { font-size: 26px; line-height: 1.25; margin: 0; text-wrap: balance; }
h2 { font-size: 20px; margin: 0; } h2 a { color: inherit; text-decoration: none; }
h3, h4 { font-size: 17px; margin: 0; text-wrap: balance; }
.label { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin: 0 0 6px; }
p { margin: 0 0 8px; } a { color: inherit; text-underline-offset: 3px; }
a:focus-visible, summary:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; border-radius: 6px; }
code { font-size: .9em; background: var(--line); padding: 1px 5px; border-radius: 5px; overflow-wrap: anywhere; }
.stamp, .muted, .meta { color: var(--muted); font-size: 14px; }
.repo, .subject { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 18px; display: grid; gap: 14px; }
.now-box p, .now-box li { font-size: 16px; }
.ask { background: var(--wait-soft); border-radius: 12px; padding: 12px 14px; }
.ask .label { color: var(--wait); }
.plan { border-top: 1px solid var(--line); padding-top: 14px; display: grid; gap: 8px; }
.plan header { display: flex; gap: 10px; align-items: baseline; justify-content: space-between; flex-wrap: wrap; }
.progress { display: flex; align-items: center; gap: 10px; }
.bar { flex: 1; height: 8px; background: var(--line); border-radius: 99px; overflow: hidden; }
.bar span { display: block; height: 100%; background: var(--ok); border-radius: 99px; }
.count, .ck-count { font-variant-numeric: tabular-nums; color: var(--muted); font-size: 14px; }
.pill { font-size: 12px; font-weight: 600; padding: 2px 9px; border-radius: 99px; white-space: nowrap; }
.pill.state { background: var(--line); }
.pill.now { background: var(--ink); color: var(--card); }
.pill.ok { background: var(--ok-soft); color: var(--ok); }
details { border: 1px solid var(--line); border-radius: 12px; padding: 0 12px; }
details + details { margin-top: 8px; }
summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; gap: 8px; font-weight: 600; list-style: none; }
summary::-webkit-details-marker { display: none; }
summary::before { content: "›"; color: var(--muted); transition: transform .15s; }
details[open] > summary::before { transform: rotate(90deg); }
@media (prefers-reduced-motion: reduce) { summary::before { transition: none; } }
.ck-title { flex: 1; }
details > :last-child { margin-bottom: 12px; }
ul, ol { margin: 0 0 8px; padding-left: 20px; }
ul.checks { list-style: none; padding: 0; display: grid; gap: 6px; }
li.check { display: flex; gap: 10px; align-items: flex-start; }
.box { flex: none; width: 20px; height: 20px; margin-top: 2px; border: 1.5px solid var(--muted); border-radius: 6px; display: grid; place-items: center; font-size: 13px; font-weight: 700; }
li.done .box { background: var(--ok); border-color: var(--ok); color: var(--card); }
li.done > span:last-child { color: var(--muted); }
.log.errors summary { color: var(--err); }
.table { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 14px; }
th, td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid var(--line); }
th { color: var(--muted); font-weight: 600; }
.overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.tile { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; display: grid; gap: 4px; text-decoration: none; }
.tile span { color: var(--muted); font-size: 14px; }
.tile.missing { border-style: dashed; }
</style>
</head>
<body>
<main>
<header><h1>${esc(title)}</h1><p class="stamp">Dữ liệu lấy từ repo lúc ${esc(stamp)}. Trang không tự cập nhật: AI đăng lại sau mỗi phiên có sửa tiến độ.</p></header>
${body}
</main>
</body>
</html>
`;
}

function stampNow() {
  return new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let title = 'Tiến độ';
  let roadmapArg = null;
  const repos = [];
  for (let k = 0; k < args.length; k++) {
    if (args[k] === '--title') title = args[++k];
    else if (args[k] === '--roadmap') roadmapArg = args[++k];
    else repos.push(args[k]);
  }
  if (roadmapArg) {
    const [file, linkBase] = roadmapArg.split('=');
    const r = roadmap(file, linkBase);
    process.stdout.write(page(title, r.html, stampNow()));
  } else {
    const parsed = repos.map((a) => {
      if (a.startsWith('missing=')) {
        const [repo, ...why] = a.slice(8).split(':');
        const id = repoId(repo), name = repo.split('/')[1];
        return { id, name, missing: true, line: 'Chưa đọc được', html: `<section class="repo" id="${esc(id)}"><h2>${esc(name)}</h2><p class="muted">${esc(why.join(':'))}</p></section>` };
      }
      const [dir, repo] = a.split('=');
      const id = repoId(repo), name = repo.split('/')[1];
      const st = join(dir, 'docs/STATUS.md');
      const where = existsSync(st) ? (sections(readFileSync(st, 'utf8')).sections.find((s) => s.title.startsWith('Đang ở đâu'))?.lines.find((l) => l.trim()) ?? '') : 'Chưa có STATUS';
      const upd = existsSync(st) ? (/Cập nhật lần cuối:\s*([0-9-]+)/.exec(readFileSync(st, 'utf8'))?.[1] ?? '') : '';
      return { id, name, upd, line: where.replace(/[*`[\]]/g, '').replace(/\(([^)]*)\)/g, '').slice(0, 90), html: repoSection(dir, repo) };
    });
    process.stdout.write(page(title, overview(parsed) + parsed.map((r) => r.html).join('\n'), stampNow()));
  }
}
