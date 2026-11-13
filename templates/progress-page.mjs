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
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
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

/** Top-level bullet lines (with their indented continuations) of the "Đang chờ thien" section; placeholders skipped. */
export function waitingLines(lines) {
  const out = [];
  let keep = false;
  for (const l of lines) {
    if (/^\s*([-*]|\d+\.)\s+\S/.test(l) && !/^\s/.test(l)) { keep = !/^([-*]|\d+\.)\s+<[^<>]*>\s*$/.test(l); if (keep) out.push(l); }
    else if (keep && /^\s+\S/.test(l)) out.push(l);
    else if (!l.trim()) keep = false;
  }
  return out;
}

/** The same items, one string each. */
export const waitingItems = (lines) => waitingLines(lines).reduce((a, l) => {
  if (/^\s/.test(l)) a[a.length - 1] += ' ' + l.trim(); else a.push(l.replace(/^\s*([-*]|\d+\.)\s+/, ''));
  return a;
}, []);

/** Plain text of inline markdown, cut at a sentence end near `max` characters. */
export function plain(md, max = 220) {
  const t = md.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…');
}

/** Everything the overview needs about one repo. */
export function repoData(dir, repo) {
  const id = repoId(repo), name = repo.split('/')[1];
  const statusFile = join(dir, 'docs/STATUS.md');
  if (!existsSync(statusFile)) return { id, name, repo, noStatus: true, tasks: [], plans: [], open: 0, where: '', upd: '' };
  const md = readFileSync(statusFile, 'utf8');
  const st = sections(md);
  const pick = (n) => st.sections.find((x) => x.title.startsWith(n));
  const base = `${repo}:docs/STATUS.md`;
  const whereLines = pick('Đang ở đâu')?.lines ?? [];
  const para = [];
  for (const l of whereLines) { if (!l.trim()) { if (para.length) break; continue; } para.push(l.trim()); }
  const plansDir = join(dir, 'docs/plans');
  const plans = (existsSync(plansDir) ? readdirSync(plansDir).filter((f) => f.endsWith('.md')).sort().reverse() : [])
    .map((f) => [f, readFileSync(join(plansDir, f), 'utf8')]).filter(([, m]) => /^## Checkpoint/m.test(m))
    .map(([f, m]) => parsePlan(m, `${repo}:docs/plans/${f}`)).filter((p) => !/^(xong|bỏ)/.test(p.meta['Trạng thái'] || ''));
  // Plans written before the template have no checkpoints: fall back to the STATUS table row.
  const statusPlans = tableRows(pick('Kế hoạch đang chạy')?.lines ?? []).map((r) => ({ title: r[0], at: r[1] || '', ticks: r[2] || '' }));
  return {
    id, name, repo, base,
    upd: /Cập nhật lần cuối:\s*([0-9-]+)/.exec(md)?.[1] ?? '',
    where: plain(para.join(' ')),
    tasks: waitingItems(pick('Đang chờ thien')?.lines ?? []),
    open: tableRows(pick('Việc dở')?.lines ?? []).length,
    plans: plans.length ? plans.map((p) => ({ title: p.title, link: p.linkBase, all: p.all, at: plain((p.where.find((l) => /Đang ở:/.test(l)) ?? '').replace(/^\s*[-*]\s*Đang ở:\s*/, ''), 90) }))
      : statusPlans.map((p) => ({ title: plain(p.title, 80), at: plain(p.at, 90), all: null, note: plain(p.ticks, 40) })),
  };
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
  const unfinished = pick('Việc dở');
  return `<section class="repo">
  <p class="meta"><a href="https://github.com/${esc(repo)}">${esc(repo)}</a>${updated ? ` · ${inline(updated, base('docs/STATUS.md'))}` : ''}</p>
  ${status ? `<div class="now-box"><h3 class="label">Đang ở đâu</h3>${blocks(pick('Đang ở đâu')?.lines ?? [], base('docs/STATUS.md'))}</div>` : '<p class="muted">Repo này chưa có <code>docs/STATUS.md</code>.</p>'}
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

const shortDate = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); return m ? `${+m[3]}/${+m[2]}` : d || ''; };
/** Stable key for a task, so a tick survives a republish while the task text is unchanged. */
export const taskKey = (repo, text) => { let h = 5381; for (const c of repo + '|' + text) h = ((h * 33) ^ c.codePointAt(0)) >>> 0; return 't' + h.toString(36); };

/** Overview body: tasks waiting for thien first (one card each, tickable), then one row per repo with its detail folded. */
export function overviewBody(repos, details) {
  const tasks = repos.flatMap((r) => r.tasks.map((t) => ({ r, t })));
  const n = repos.filter((r) => r.tasks.length).length;
  const lead = tasks.length ? `${tasks.length} việc đang chờ bạn ở ${n} repo.` : 'Không có việc nào đang chờ bạn.';
  const card = ({ r, t }) => {
    const key = taskKey(r.repo, t);
    return `<li class="task" data-key="${key}"><label class="tick"><input type="checkbox" id="${key}" disabled aria-label="Đánh dấu đã làm"><span class="box" aria-hidden="true"></span></label>
<div class="task-body"><div class="task-meta"><span class="chip">${esc(r.name)}</span>${r.upd ? `<span>từ ${esc(shortDate(r.upd))}</span>` : ''}</div><p>${inline(t, r.base)}</p></div></li>`;
  };
  const planCell = (r) => r.noStatus ? '<span class="muted">Chưa có STATUS</span>' : r.plans.length ? r.plans.map((p) => `<div class="pl"><div class="pl-top"><span>${p.link ? `<a href="${esc(resolveLink(posix.basename(p.link.split(':')[1]), p.link))}">${inline(p.title, '')}</a>` : esc(p.title)}</span>${p.all ? `<span class="num">${p.all.done}/${p.all.total}</span>` : ''}</div>${p.all ? `<div class="bar" role="img" aria-label="${p.all.done} trên ${p.all.total} việc đã xong"><span style="width:${p.all.total ? Math.round((p.all.done / p.all.total) * 100) : 0}%"></span></div>` : ''}${p.at ? `<span class="muted small">${esc(p.at)}</span>` : ''}</div>`).join('') : '<span class="muted">Không có kế hoạch đang chạy</span>';
  const row = (r) => `<details class="rw" id="${esc(r.id)}"><summary>
<div class="rw-name"><b>${esc(r.name)}</b>${r.missing ? '<span class="muted small">chưa đọc được</span>' : r.upd ? `<span class="muted small">cập nhật ${esc(shortDate(r.upd))}</span>` : ''}</div>
<p class="rw-where">${esc(r.missing ? r.why : r.noStatus ? 'Repo này chưa có docs/STATUS.md.' : r.where)}</p>
<div class="rw-plans">${r.missing ? '' : planCell(r)}</div>
<div class="rw-chips">${r.open ? `<span class="chip">${r.open} việc dở</span>` : ''}${r.tasks.length ? `<span class="chip accent">${r.tasks.length} chờ bạn</span>` : ''}<span class="more">Chi tiết</span></div>
</summary><div class="rw-detail">${details[r.id] || ''}</div></details>`;
  return `<p class="lead">${lead}</p>
${tasks.length ? `<section class="sec" aria-labelledby="h-wait"><h2 class="label" id="h-wait">Đang chờ bạn</h2><ul class="tasks">${tasks.map(card).join('')}</ul>
<p class="muted small" id="tick-note">Tick là bạn báo đã làm; Claude kiểm lại và bỏ việc khỏi STATUS ở lần cập nhật sau.</p></section>` : ''}
<section class="sec" aria-labelledby="h-repos"><h2 class="label" id="h-repos">Các repo</h2>
<div class="tbl"><div class="rw-head" aria-hidden="true"><span>Repo</span><span>Đang ở đâu</span><span>Kế hoạch</span><span></span></div>${repos.map(row).join('')}</div></section>`;
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

// The shared kit lives in artifacts/kit/. When this script runs on its own (copied elsewhere), fall back to the bare tokens.
const KIT_FALLBACK_CSS = `:root{--bg:#faf8f3;--card:#fff;--soft:#f3f1ec;--line:#e7e3da;--ink:#1b1b1a;--muted:#6b6862;--accent:#308e84;--accent-soft:#e3f1ef;--accent-ink:#1f6b63;--good:#2f8a57;--good-soft:#e6f3eb;--bad:#c2410c;--bad-soft:#fdeee6;--font:"Onest",system-ui,sans-serif;--mono:ui-monospace,Menlo,Consolas,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#161615;--card:#1f1f1d;--soft:#262523;--line:#34322e;--ink:#ecebe7;--muted:#a19e97;--accent:#4fb3a6;--accent-soft:#1c3330;--accent-ink:#8fd9c9;--good:#4fb07a;--good-soft:#1c3125;--bad:#f0763f;--bad-soft:#3b2219;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#161615;--card:#1f1f1d;--soft:#262523;--line:#34322e;--ink:#ecebe7;--muted:#a19e97;--accent:#4fb3a6;--accent-soft:#1c3330;--accent-ink:#8fd9c9;--good:#4fb07a;--good-soft:#1c3125;--bad:#f0763f;--bad-soft:#3b2219;color-scheme:dark}
.chip{font:600 12px/1 var(--font);padding:4px 8px;border-radius:99px;background:var(--soft);color:var(--muted)}.chip.accent{background:var(--accent-soft);color:var(--accent-ink)}.label{font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}`;
const kitFile = (f) => {
  const p = join(dirname(fileURLToPath(import.meta.url)), '../artifacts/kit', f);
  return existsSync(p) ? readFileSync(p, 'utf8') : f.endsWith('.css') ? KIT_FALLBACK_CSS : '';
};

export function page(title, body, stamp, opts = {}) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>${kitFile('kit.css')}</style>
<style>
/* Overview: what waits for thien first (cards), then one row per repo with detail folded; one column on phones.
   Colours come from the shared kit (artifacts/kit/kit.css). */
:root { --ok: var(--good); --ok-soft: var(--good-soft); --err: var(--bad); }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { background: var(--bg); color: var(--ink); font: 16px/1.55 var(--font); }
.lead { color: var(--muted); margin-top: -16px; }
.small { font-size: 13px; }
.sec { display: grid; gap: 10px; }
.tasks { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
.task { background: var(--card); border: 2px solid var(--line); border-bottom-width: 4px; border-radius: 14px; padding: 14px; display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 10px; align-content: start; }
.task p { font-weight: 500; line-height: 1.45; margin: 0; overflow-wrap: anywhere; }
.task-body { display: grid; gap: 8px; min-width: 0; }
.task-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; font-size: 12.5px; color: var(--muted); }
.tick { position: relative; width: 24px; height: 24px; cursor: pointer; }
.tick input { position: absolute; inset: -10px; opacity: 0; cursor: pointer; margin: 0; }
.tick input:disabled { cursor: progress; }
.tick .box { pointer-events: none; position: absolute; inset: 2px; border: 2px solid var(--line); border-radius: 6px; background: var(--card); }
.tick input:focus-visible + .box { outline: 2px solid var(--accent); outline-offset: 2px; }
.tick input:checked + .box { background: var(--accent); border-color: var(--accent); }
.tick input:checked + .box::after { content: ""; position: absolute; left: 5px; top: 1px; width: 6px; height: 11px; border: solid #fff; border-width: 0 2.5px 2.5px 0; transform: rotate(45deg); }
.task.done { background: transparent; border-bottom-width: 2px; }
.task.done p { color: var(--muted); text-decoration: line-through; }
.tbl { background: var(--card); border: 2px solid var(--line); border-radius: 14px; overflow: hidden; }
.rw-head, .rw > summary { display: grid; grid-template-columns: 170px minmax(0, 1fr) 230px 130px; gap: 16px; padding: 14px 16px; align-items: start; }
.rw-head { background: var(--soft); font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; padding-block: 9px; }
details.rw { border: 0; border-top: 1px solid var(--line); border-radius: 0; padding: 0; }
details.rw + details.rw { margin-top: 0; }
details.rw > summary { min-height: 0; font-weight: 400; cursor: pointer; }
details.rw > summary::before { content: none; }
details.rw > summary:hover { background: var(--soft); }
.rw-name { display: grid; gap: 2px; } .rw-name b { font-weight: 600; }
.rw-where { margin: 0; font-size: 15px; }
.rw-plans { display: grid; gap: 10px; }
.pl { display: grid; gap: 5px; font-size: 13.5px; }
.pl-top { display: flex; justify-content: space-between; gap: 8px; }
.num { font-family: var(--mono); font-size: 12px; color: var(--muted); }
.rw-chips { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; justify-content: flex-end; }
.more { font-size: 13px; color: var(--muted); text-decoration: underline; text-underline-offset: 3px; }
details.rw[open] .more { color: var(--ink); }
.rw-detail { padding: 4px 16px 18px; border-top: 1px dashed var(--line); }
.rw-detail .repo { border: 0; padding: 12px 0 0; background: transparent; }
@media (max-width: 760px) { .rw-head { display: none; } .rw > summary { grid-template-columns: minmax(0, 1fr); gap: 8px; } .rw-chips { justify-content: flex-start; } }
main { max-width: 1120px; margin: 0 auto; padding: 28px max(16px, env(safe-area-inset-right, 0px)) 64px max(16px, env(safe-area-inset-left, 0px)); display: grid; gap: 24px; }
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
.bar span { display: block; height: 100%; background: var(--accent); border-radius: 99px; }
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
<header><h1>${esc(title)}</h1><p class="stamp">Lấy từ repo lúc ${esc(stamp)}. Trang không tự cập nhật: Claude đăng lại sau mỗi phiên có sửa tiến độ.</p></header>
${body}
</main>
${opts.ticks ? `<script>${kitFile('kit.js')}</script>
<script>
/* Ticks: thien marks a task done; saved on this device and in the page's db (ticks/overview) for Claude to read. */
(async () => {
  if (!window.Kit) { document.querySelectorAll('.task input').forEach((b) => { b.disabled = false; }); return; }
  const st = Kit.store('overview-ticks', 'ticks/overview');
  const cards = [...document.querySelectorAll('.task')];
  const S = (await st.load()) || { done: {} };
  S.done = S.done || {};
  const paint = (c) => c.classList.toggle('done', !!S.done[c.dataset.key]);
  for (const c of cards) {
    const box = c.querySelector('input');
    box.checked = !!S.done[c.dataset.key]; paint(c);
    box.disabled = false;   // enabled only after the saved ticks are in, so a click can't be lost or overwritten
    box.addEventListener('change', () => {
      if (box.checked) S.done[c.dataset.key] = { at: new Date().toISOString(), text: c.querySelector('p').textContent.slice(0, 300) };
      else delete S.done[c.dataset.key];
      paint(c); st.save(S);
      Kit.toast(box.checked ? 'Đã đánh dấu. Claude kiểm lại ở lần cập nhật sau.' : 'Đã bỏ đánh dấu.');
    });
  }
})();
</script>` : ''}
</body>
</html>
`;
}

function stampNow() {
  return new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Compare real paths, not URL strings: on Windows, or with spaces or Vietnamese letters in the
// path, `file://${argv[1]}` never equals import.meta.url and the script silently did nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
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
    const details = {};
    const parsed = repos.map((a) => {
      if (a.startsWith('missing=')) {
        const [repo, ...why] = a.slice(8).split(':');
        return { id: repoId(repo), name: repo.split('/')[1], repo, missing: true, why: why.join(':'), tasks: [], plans: [], open: 0 };
      }
      const [dir, repo] = a.split('=');
      const d = repoData(dir, repo);
      details[d.id] = repoSection(dir, repo);
      return d;
    });
    process.stdout.write(page(title, overviewBody(parsed, details), stampNow(), { ticks: true }));
  }
}
