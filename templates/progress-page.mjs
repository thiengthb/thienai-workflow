#!/usr/bin/env node
// Builds one self-contained HTML page from progress files, to publish as an artifact.
//
//   Progress of one or more repos (docs/STATUS.md + docs/plans/*.md):
//     node progress-page.mjs --title "Tiến độ" <dir>=<owner/repo> [<dir>=<owner/repo> ...] > page.html
//     A repo that cannot be read here is listed with its reason: missing=<owner/repo>:<reason>
//     --prs <file.json>: open pull requests per repo ({"owner/repo": [...] | null}, null = could not fetch),
//     shown in merge order in "Đang chờ bạn" (publish-progress.mjs fetches them).
//     --links <README.md>=<owner/repo>:README.md: its "## Mở nhanh" section becomes the "Mở nhanh" tab.
//   Learning roadmap (one markdown file, "##" = subject, "###" = stage):
//     node progress-page.mjs --title "Lộ trình học" --roadmap <file.md>=<owner/repo>:<path in repo> > page.html
//
// Plan files follow templates/PLAN.template.md; rules in profile/PLANNING.md.
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

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

/** Where a plan opens: its plan page ("Trang: <link>" on the status line, built by artifacts/plan/make-plan.mjs),
 *  else the markdown file on GitHub. { url, page } — page is true for a plan page. */
export function planLink(p) {
  const m = /https:\/\/\S+?(?=[\s),]|$)/.exec(p.meta.Trang || '');
  if (m) return { url: m[0], page: true };
  const [repo, file] = (p.linkBase || '').split(':');
  return repo && file ? { url: `https://github.com/${repo}/blob/main/${file}`, page: false } : null;
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
  ${(() => { const l = planLink(p); return l ? `<a class="plan-open" href="${esc(l.url)}">${l.page ? 'Mở trang kế hoạch' : 'Mở file kế hoạch'}</a>` : ''; })()}
  <div class="progress">${bar(p.all)}</div>
  <p class="meta">${['Duyệt', 'Cập nhật'].filter((k) => p.meta[k]).map((k) => `${k} ${esc(p.meta[k])}`).join(' · ')}${p.meta.Thread ? ` · ${inline(p.meta.Thread, p.linkBase)}` : ''}</p>
  <div class="where">${blocks(p.where, p.linkBase)}</div>
  <div class="cks">${ck}</div>
  ${sec('Đã đổi', p.changes, 'changes')}${sec('Lỗi gặp', p.errors, 'errors')}
</article>`;
}

/** Top-level bullet lines (with their indented continuations) of the "Đang chờ thien" section; placeholders skipped. */
export function waitingLines(lines) {
  // A bullet that is only a <placeholder> is skipped; a bullet that is only a <https://...> link is a real item.
  const out = [];
  let keep = false;
  for (const l of lines) {
    if (/^\s*([-*]|\d+\.)\s+\S/.test(l) && !/^\s/.test(l)) { keep = !/^([-*]|\d+\.)\s+<(?![a-z][a-z0-9+.-]*:)[^<>]*>\s*$/i.test(l); if (keep) out.push(l); }
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

const word = (w) => new RegExp(`(?<!\\p{L})(?:${w})(?!\\p{L})`, 'iu');
/** What a waiting item asks of thien: 'pr' (merge a pull request), 'decide' (pick an option),
 *  'page' (open or try a page), or 'other'. The overview gathers items of one kind together. */
export function waitKind(text) {
  if (word('merge').test(text) && /#\d+/.test(text)) return 'pr';
  if (word('chọn|quyết định|duyệt|trả lời').test(text)) return 'decide';
  if (/claude\.ai\/artifact\//.test(text) || (word('trang').test(text) && word('mở|thử|xem').test(text))) return 'page';
  return 'other';
}

/** Open pull requests ({number, title, url, draft, base, head, created, body}) in the order to merge them.
 *  A PR comes after #N when it is stacked on #N's branch or its text says "merge sau #N", "sau khi merge #N",
 *  "merge after #N" or "depends on #N". A PR that another one says it includes ("gộp luôn PR #N",
 *  "thay cho #N", "supersedes #N") is not merged: it gets `closeAfter` and goes after that one.
 *  Otherwise oldest first, drafts last. */
export function prOrder(prs) {
  const open = new Set(prs.map((p) => p.number));
  // A branch is its repo plus its name, so a fork's "feature" is not the base repo's "feature".
  const byHead = new Map(prs.map((p) => [`${p.headRepo || ''}:${p.head}`, p.number]));
  const baseOf = (p) => `${p.baseRepo || ''}:${p.base}`;
  const refs = (p, re) => [...`${p.title}\n${p.body || ''}`.matchAll(re)].map((m) => +m[1]).filter((n) => open.has(n) && n !== p.number);
  const after = new Map(prs.map((p) => [p.number, new Set(refs(p, /(?:merge\s+(?:sau|after)|sau\s+khi\s+merge|depends\s+on)\s+(?:PR\s+)?#(\d+)/gi))]));
  const closeAfter = new Map();
  for (const p of prs) {
    if (byHead.has(baseOf(p)) && byHead.get(baseOf(p)) !== p.number) after.get(p.number).add(byHead.get(baseOf(p)));
    for (const n of refs(p, /(?:gộp\s+(?:luôn\s+)?|thay\s+cho\s+|supersedes\s+)(?:PR\s+)?#(\d+)/giu)) if (!closeAfter.has(n)) closeAfter.set(n, p.number);
  }
  for (const [n, by] of closeAfter) { after.get(n).add(by); after.get(by).delete(n); }
  const rest = [...prs].sort((a, b) => (a.draft - b.draft) || String(a.created).localeCompare(String(b.created)) || a.number - b.number);
  const out = [], placed = new Set();
  while (rest.length) {
    const k = rest.findIndex((p) => [...after.get(p.number)].every((n) => placed.has(n)));
    const [p] = rest.splice(Math.max(k, 0), 1);   // a cycle: take the oldest and go on
    placed.add(p.number);
    out.push({ ...p, after: closeAfter.has(p.number) ? [] : [...after.get(p.number)], closeAfter: closeAfter.get(p.number) ?? 0 });
  }
  return out;
}

/** Everything waiting for thien, per repo: open PRs in merge order and STATUS items with their kind.
 *  A STATUS item that asks to merge a PR still open becomes a note on that PR (in the repo it names, else its
 *  own repo); one whose PR is no longer open stays, marked so. Sets r.wait, r.waitCount, and the status badge. */
export function gatherWaiting(repos) {
  for (const r of repos) r.wait = { prs: Array.isArray(r.prs) ? prOrder(r.prs).map((p) => ({ ...p, notes: [] })) : [], tasks: [] };
  for (const r of repos) {
    for (const t of r.tasks) {
      const kind = waitKind(t);
      let hint = '';
      if (kind === 'pr') {
        const target = repos.find((o) => o !== r && word(o.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(t)) || r;
        const nums = [...t.matchAll(/#(\d+)/g)].map((m) => +m[1]);
        if (Array.isArray(target.prs)) {
          const hit = target.wait.prs.find((p) => nums.includes(p.number));
          if (hit) { hit.notes.push({ t, base: r.base }); continue; }   // links in the note stay relative to the repo that wrote it
          hint = 'PR này không còn mở: đã merge hoặc đã đóng.';
        }
      }
      r.wait.tasks.push({ t, kind, hint });
    }
  }
  for (const r of repos) {
    r.waitCount = r.wait.tasks.length + r.wait.prs.filter((p) => !p.draft && !p.closeAfter).length;
    if (r.status === 'running' && r.waitCount) r.status = 'waiting';
    if (r.status === 'waiting' && !r.waitCount) r.status = 'running';
  }
  return repos;
}

/** Plain text of inline markdown, cut at a sentence end near `max` characters. */
export function plain(md, max = 220) {
  const t = md.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…');
}

/** Top-level list items of a section, continuation lines joined. */
export const listItems = (lines) => lines.reduce((a, l) => {
  const m = /^(?:[-*]|\d+\.)\s+(.*)$/.exec(l);
  if (m) a.push(m[1]); else if (a.length && /^\s+\S/.test(l)) a[a.length - 1] += ' ' + l.trim();
  return a;
}, []);

/** A plan as steps (its checkpoints) for the stepper; `cur` is the first unfinished step, -1 when all are done. */
export function planSteps(p) {
  const steps = p.checkpoints.map((c) => { const t = ticks(c.lines); return { label: plain(c.title.replace(/^\d+\.\s*/, ''), 40), done: t.total > 0 && t.done === t.total }; });
  const wait = plain((p.where.find((l) => /Còn thiếu:/.test(l)) ?? '').replace(/^\s*[-*]\s*Còn thiếu:\s*/, ''), 90);
  const cur = steps.findIndex((x) => !x.done);
  return { title: plain(p.title, 70), link: p.linkBase, steps, cur, note: cur < 0 && wait ? 'Xong hết bước, ' + wait.charAt(0).toLowerCase() + wait.slice(1) : wait };
}

/** A STATUS table row of an old free-form plan ("U0, U1 / U0–U8") as steps, when its ticks column names a range. */
export function statusSteps(p) {
  const t = plain(p.ticks, 80), m = /\/\s*([A-Z]+)(\d+)\s*[–-]\s*(?:\1)?(\d+)/.exec(t);
  const done = new Set(t.split('/')[0].match(/[A-Z]+\d+/g) || []);
  const steps = m && +m[3] >= +m[2] && +m[3] - +m[2] < 30
    ? Array.from({ length: +m[3] - +m[2] + 1 }, (_, k) => { const id = m[1] + (+m[2] + k); return { label: id, done: done.has(id) }; }) : [];
  return { title: plain(p.title, 70), steps, cur: steps.findIndex((x) => !x.done), note: plain(p.at, 90) };
}

/** Everything the overview needs about one repo. */
export function repoData(dir, repo) {
  const id = repoId(repo), name = repo.split('/')[1];
  const statusFile = join(dir, 'docs/STATUS.md');
  if (!existsSync(statusFile)) return { id, name, repo, noStatus: true, tasks: [], plans: [], steps: [], done: [], next: [], blocked: [], open: 0, where: '', head: '', status: 'running', upd: '' };
  const md = lf(readFileSync(statusFile, 'utf8'));
  const st = sections(md);
  const pick = (n) => st.sections.find((x) => x.title.startsWith(n));
  const base = `${repo}:docs/STATUS.md`;
  const whereLines = pick('Đang ở đâu')?.lines ?? [];
  const para = [];
  for (const l of whereLines) { if (!l.trim()) { if (para.length) break; continue; } para.push(l.trim()); }
  const plansDir = join(dir, 'docs/plans');
  const plans = (existsSync(plansDir) ? readdirSync(plansDir).filter((f) => f.endsWith('.md')).sort().reverse() : [])
    .map((f) => [f, lf(readFileSync(join(plansDir, f), 'utf8'))]).filter(([, m]) => /^## Checkpoint/m.test(m))
    .map(([f, m]) => parsePlan(m, `${repo}:docs/plans/${f}`)).filter((p) => !/^(xong|bỏ)/.test(p.meta['Trạng thái'] || ''));
  // Plans written before the template have no checkpoints: fall back to the STATUS table row.
  const statusPlans = tableRows(pick('Kế hoạch đang chạy')?.lines ?? []).map((r) => ({ title: r[0], at: r[1] || '', ticks: r[2] || '' }));
  const flat = plain(para.join(' '), 2000);
  let head = (flat.match(/^.*?[.!?](\s|$)/) || [flat])[0].trim();
  if (head.length > 110) head = plain(head.split(/[:(]/)[0].trim(), 110).replace(/[,;]$/, '') + '.';
  const list = (name, max) => listItems(pick(name)?.lines ?? []).map((t) => plain(t, max));
  const tasks = waitingItems(pick('Đang chờ thien')?.lines ?? []);
  return {
    head, status: /tạm dừng|đang dừng/i.test(flat) ? 'paused' : tasks.length ? 'waiting' : 'running',
    done: list('Vừa xong', 120), next: list('Việc tiếp theo', 140),
    blocked: list('Đang vướng', 140).filter((t) => !/^Không( có)?[.,]/.test(t)),
    steps: plans.length ? plans.map(planSteps) : statusPlans.map(statusSteps),
    id, name, repo, base,
    upd: /Cập nhật lần cuối:\s*([0-9-]+)/.exec(md)?.[1] ?? '',
    where: plain(para.join(' ')),
    tasks,
    open: tableRows(pick('Việc dở')?.lines ?? []).length,
    plans: plans.length ? plans.map((p) => ({ title: p.title, link: p.linkBase, all: p.all, at: plain((p.where.find((l) => /Đang ở:/.test(l)) ?? '').replace(/^\s*[-*]\s*Đang ở:\s*/, ''), 90) }))
      : statusPlans.map((p) => ({ title: plain(p.title, 80), at: plain(p.at, 90), all: null, note: plain(p.ticks, 40) })),
  };
}

function repoSection(dir, repo) {
  const statusFile = join(dir, 'docs/STATUS.md');
  const status = existsSync(statusFile) ? sections(lf(readFileSync(statusFile, 'utf8'))) : null;
  const base = (f) => `${repo}:${f}`;
  const pick = (name) => status?.sections.find((s) => s.title.startsWith(name));
  const plansDir = join(dir, 'docs/plans');
  const files = existsSync(plansDir) ? readdirSync(plansDir).filter((f) => f.endsWith('.md')).sort().reverse()
    .map((f) => [f, lf(readFileSync(join(plansDir, f), 'utf8'))]) : [];
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
  ${plans.length > running.length ? `<details class="done-plans"><summary>Kế hoạch đã xong hoặc đã bỏ <span class="ck-count">${plans.length - running.length}</span></summary>${plans.filter((p) => !running.includes(p)).map((p) => { const l = planLink(p); return `<p>${l ? `<a href="${esc(l.url)}">${inline(p.title, p.linkBase)}</a>` : inline(p.title, p.linkBase)} · ${esc(p.meta['Trạng thái'] || '')}</p>`; }).join('')}</details>` : ''}
</section>`;
}

/** Section id from the full owner/repo, one-to-one so no two repos share an anchor: letters and digits stay,
 *  "-" becomes "--", any other character becomes "-<hex code>-" ("/" is "-2f-"). */
export const repoId = (repo) => repo.toLowerCase().replace(/[^a-z0-9]/g, (c) => (c === '-' ? '--' : `-${c.charCodeAt(0).toString(16)}-`));

const ICONS = {
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>', dot: '<circle cx="12" cy="12" r="4"/>', next: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  warn: '<path d="M12 4 2.5 20h19L12 4z"/><path d="M12 10v4M12 17.5v.5"/>', chev: '<path d="m6 9 6 6 6-6"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const shortDate = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); return m ? `${+m[3]}/${+m[2]}` : d || ''; };
/** Stable key for a task, so a tick survives a republish while the task text is unchanged. */
export const taskKey = (repo, text) => { let h = 5381; for (const c of repo + '|' + text) h = ((h * 33) ^ c.codePointAt(0)) >>> 0; return 't' + h.toString(36); };

/** Overview body, sized for the claude.ai artifact panel: on a wide panel two columns (tasks waiting for thien,
 *  grouped by repo and tickable | one card per repo, detail folded); one column when narrow. Every block uses the
 *  same card, row and type sizes so the two columns line up. */
export function overviewBody(repos, details, quick = '') {
  gatherWaiting(repos);
  const waiting = repos.filter((r) => r.waitCount);
  const total = waiting.reduce((a, r) => a + r.waitCount, 0);
  const running = repos.reduce((a, r) => a + (r.plans ? r.plans.length : 0), 0);
  // "Đang chờ bạn" is gathered by kind (PRs to merge in order, pages to try, decisions, the rest), across repos.
  const KINDS = [['pr', 'PR cần merge', 'PR'], ['page', 'Trang cần thử', 'trang'], ['decide', 'Quyết định cần chọn', 'quyết định'], ['other', 'Việc khác', 'việc khác']];
  const counts = (rs) => {
    const c = { pr: 0, page: 0, decide: 0, other: 0 };
    for (const r of rs) { c.pr += r.wait.prs.filter((p) => !p.draft && !p.closeAfter).length; for (const x of r.wait.tasks) c[x.kind]++; }
    return c;
  };
  const c = counts(repos);
  const parts = KINDS.filter(([k]) => c[k]).map(([k, , n]) => `${c[k]} ${n}`).join(', ');
  const lead = `<p class="lead">${total ? `<b>${total} việc</b> đang chờ bạn: ${parts}` : 'Không có việc nào đang chờ bạn'} · ${running} kế hoạch đang chạy.</p>`;
  // A task shows in the overview tab and in its repo's tab: same data-key (one tick), different element ids.
  const task = (r, x, sfx, many) => {
    const key = taskKey(r.repo, x.t), id = key + sfx;
    const from = [many ? esc(r.name) : '', esc(x.hint)].filter(Boolean).join(' · ');
    return `<li class="task" data-key="${key}"><label class="tick"><input type="checkbox" id="${id}" disabled aria-labelledby="${id}-t"><span class="box" aria-hidden="true"></span></label><div><p id="${id}-t">${inline(x.t, r.base)}</p>${from ? `<span class="from">${from}</span>` : ''}</div></li>`;
  };
  const prRow = (r, p, k, many) => {
    const why = p.closeAfter ? `<b>không merge</b>: đóng sau khi merge #${p.closeAfter}` : p.draft ? 'nháp, chưa cần merge' : p.after.length ? `<b>sau ${p.after.map((n) => '#' + n).join(', ')}</b>` : '';
    const meta = [many ? esc(r.name) : '', p.created ? `mở ${esc(shortDate(String(p.created).slice(0, 10)))}` : '', why].filter(Boolean).join(' · ');
    return `<li class="pr${p.draft || p.closeAfter ? ' later' : ''}"><span class="ord" aria-hidden="true">${k}</span><div><p><a href="${esc(p.url)}">#${p.number}</a> ${esc(p.title)}</p>${meta ? `<span class="from">${meta}</span>` : ''}${p.notes.map((n) => `<span class="from">${inline(n.t, n.base)}</span>`).join('')}</div></li>`;
  };
  const kindCard = (rs, kind, label, sfx) => {
    const many = rs.length > 1;
    const prs = kind === 'pr' ? rs.flatMap((r) => r.wait.prs.map((p, k) => prRow(r, p, k + 1, many))) : [];
    const lost = kind === 'pr' ? rs.filter((r) => r.prs === null).map((r) => esc(r.name)) : [];
    const miss = lost.length ? [`<li class="miss">Không lấy được danh sách PR của ${lost.join(', ')} lúc dựng trang.</li>`] : [];
    const tasks = rs.flatMap((r) => r.wait.tasks.filter((x) => x.kind === kind).map((x) => task(r, x, sfx, many)));
    if (!prs.length && !tasks.length && !miss.length) return '';
    const n = counts(rs)[kind];
    const note = kind === 'pr' && prs.length ? '<span>theo thứ tự merge</span>' : `<span>${n}</span>`;
    return `<div class="grp k-${kind}"><div class="grp-head"><b>${label}</b>${note}</div>${prs.length ? `<ol class="prs" aria-label="${esc(label)}, theo thứ tự merge">${prs.join('')}</ol>` : ''}${tasks.length || miss.length ? `<ul class="tasks">${tasks.join('')}${miss.join('')}</ul>` : ''}</div>`;
  };
  const waitCards = (rs, sfx) => KINDS.map(([k, label]) => kindCard(rs, k, label, sfx)).join('');
  const hasTicks = (rs) => rs.some((r) => r.wait.tasks.length);
  // Repo card: a short timeline (Vừa xong · Bây giờ · Vướng · Tiếp theo); "Bây giờ" carries each running plan as a
  // row of checkpoint steps, the current one ringed. The full STATUS stays folded under "Xem chi tiết".
  const ST = { running: ['Đang chạy', 'run'], waiting: ['Chờ bạn', 'wait'], paused: ['Tạm dừng', 'pause'] };
  const badge = (r) => `<span class="st ${ST[r.status][1]}"><i aria-hidden="true"></i>${ST[r.status][0]}${r.status === 'waiting' ? ` ${r.waitCount} việc` : ''}</span>`;
  const head = (r, sub) => `<div class="rc-head"><b>${esc(r.name)}</b>${sub}<span class="upd">${esc(r.missing ? 'chưa đọc được' : shortDate(r.upd))}</span></div>`;
  const stepper = (p) => {
    const d = p.steps.filter((x) => x.done).length, n = p.steps.length, short = p.steps.every((x) => x.label.length <= 4);
    const count = d === n ? `${icon('check', 'ok')}xong` : `${d}/${n}`;
    const dots = p.steps.map((x, k) => `<li class="${x.done ? 'd' : k === p.cur ? 'c' : ''}" title="${esc(x.label)}"><span></span>${short ? `<em>${esc(x.label)}</em>` : ''}</li>`).join('');
    const at = p.cur >= 0 && !short ? `<b>Bước ${p.cur + 1}:</b> ${esc(p.steps[p.cur].label)}${p.note ? ' · ' : ''}` : '';
    return `<div class="pst"><div class="pst-top"><span>${esc(p.title)}</span><span class="pn">${count}</span></div>${n ? `<ol class="steps" aria-label="${d} trên ${n} bước đã xong">${dots}</ol>` : ''}${at || p.note ? `<p class="note">${at}${esc(p.note || '')}</p>` : ''}</div>`;
  };
  const node = (cls, ic, label, body) => `<li class="${cls}"><span class="node" aria-hidden="true">${icon(ic)}</span><div><span class="k">${label}</span>${body}</div></li>`;
  const timeline = (r) => {
    const rows = [];
    if (r.done[0]) rows.push(node('done', 'check', 'Vừa xong', `<p>${esc(r.done[0])}</p>`));
    rows.push(node('now', 'dot', 'Bây giờ', `<p class="hl">${esc(r.head || r.where)}</p>${r.steps.map(stepper).join('')}`));
    if (r.blocked[0]) rows.push(node('warn', 'warn', 'Vướng', `<p>${esc(r.blocked[0])}</p>`));
    if (r.next[0]) rows.push(node('next', 'next', 'Tiếp theo', `<p>${esc(r.next[0])}</p>`));
    return `<ol class="tl">${rows.join('')}</ol>`;
  };
  const tickNote = '<p class="muted small tick-note">Tick là bạn báo đã làm. Claude kiểm lại và bỏ việc khỏi STATUS ở lần cập nhật sau.</p>';
  const plain1 = (r) => r.missing || r.noStatus;
  const reason = (r) => `<p class="rc-where">${esc(r.missing ? r.why : 'Repo này chưa có docs/STATUS.md.')}</p>`;
  // Overview tab: one compact row per repo (name, status, "Bây giờ", plan steps); the row opens that repo's tab.
  const miniSteps = (p) => {
    const d = p.steps.filter((x) => x.done).length, n = p.steps.length;
    return `<div class="mini"><span class="mini-t">${esc(p.title)}</span>${n ? `<ol class="steps sm" aria-label="${d} trên ${n} bước đã xong">${p.steps.map((x, k) => `<li class="${x.done ? 'd' : k === p.cur ? 'c' : ''}"><span></span></li>`).join('')}</ol>` : '<span></span>'}<span class="pn">${n && d === n ? `${icon('check', 'ok')}xong` : n ? `${d}/${n}` : ''}</span></div>`;
  };
  const row = (r) => `<a class="rc rrow" href="#${esc(r.id)}" data-tab="${esc(r.id)}">${head(r, plain1(r) ? '' : badge(r))}${plain1(r) ? reason(r) : `<p class="hl">${esc(r.head || r.where)}</p>${r.steps.length ? `<div class="minis">${r.steps.map(miniSteps).join('')}</div>` : ''}`}<span class="open">Mở tab ${esc(r.name)}${icon('next')}</span></a>`;
  const allPanel = `${lead}<div class="cols"><section class="col" aria-labelledby="h-wait"><h2 class="label" id="h-wait">Đang chờ bạn</h2>
${total || repos.some((r) => r.wait.prs.length || r.prs === null) ? `${waitCards(repos, '')}${hasTicks(repos) ? tickNote : ''}` : '<p class="card empty muted">Không có việc nào đang chờ bạn.</p>'}</section>
<section class="col" aria-labelledby="h-repos"><h2 class="label" id="h-repos">Các repo</h2>${repos.map(row).join('')}</section></div>`;
  // Repo tab: the full timeline and this repo's waiting tasks | the whole STATUS, already open.
  const repoPanel = (r) => plain1(r) ? `<div class="rc rc-static">${head(r, '')}${reason(r)}</div>`
    : `<div class="cols"><div class="col"><h2 class="label">Tiến độ</h2><div class="rc rc-static">${head(r, badge(r))}${timeline(r)}</div>
${r.wait.tasks.length || r.wait.prs.length || r.prs === null ? `<h2 class="label gap">Đang chờ bạn</h2>${waitCards([r], '-r')}${hasTicks([r]) ? tickNote : ''}` : ''}</div>
<div class="col"><h2 class="label">Chi tiết</h2><div class="rc rc-full">${details[r.id] || ''}</div></div></div>`;
  const tab = (id, label, n, on) => `<button type="button" role="tab" id="tab-${esc(id)}" aria-controls="p-${esc(id)}" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-tab="${esc(id)}">${esc(label)}${n ? `<span class="cnt" aria-label="${n} việc chờ bạn">${n}</span>` : ''}</button>`;
  const panel = (id, html, on) => `<section class="panel" role="tabpanel" id="p-${esc(id)}" aria-labelledby="tab-${esc(id)}"${on ? '' : ' hidden'}>${html}</section>`;
  // "Mở nhanh": the README section of the same name (links to pages, plans, guides), as the second tab.
  const quickPanel = `<div class="rc rc-full quick">${quick}</div>`;
  return `<nav class="tabs" role="tablist" aria-label="Xem theo repo">${tab('all', 'Tổng quan', 0, true)}${quick ? tab('mo-nhanh', 'Mở nhanh', 0, false) : ''}${repos.map((r) => tab(r.id, r.name, r.waitCount, false)).join('')}</nav>
${panel('all', allPanel, true)}${quick ? panel('mo-nhanh', quickPanel, false) : ''}${repos.map((r) => panel(r.id, repoPanel(r), false)).join('')}
<script>
/* Tabs: the hash names the open repo (#<repo id>), so a link or a reload lands on the same tab. */
(() => {
  const tabs = [...document.querySelectorAll('[role=tab]')], ids = tabs.map((t) => t.dataset.tab);
  const show = (id, focus) => {
    if (!ids.includes(id)) id = 'all';
    for (const t of tabs) { const on = t.dataset.tab === id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; document.getElementById('p-' + t.dataset.tab).hidden = !on; if (on && focus) t.focus(); }
    try { history.replaceState(null, '', id === 'all' ? location.pathname + location.search : '#' + id); } catch (e) { /* sandboxed frame: the tab still switches */ }
    window.scrollTo(0, 0);
  };
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => show(t.dataset.tab));
    t.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); show(ids[(k + d + ids.length) % ids.length], true); } });
  });
  document.querySelectorAll('a.rrow').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); show(a.dataset.tab); }));
  show(location.hash.slice(1));
})();
</script>`;
}

function roadmap(file, linkBase) {
  const doc = sections(lf(readFileSync(file, 'utf8')));
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
.chip{font:600 12px/1 var(--font);padding:4px 8px;border-radius:8px;background:var(--soft);color:var(--muted)}.chip.accent{background:var(--accent-soft);color:var(--accent-ink)}.label{font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}`;
const kitFile = (f) => {
  const p = join(dirname(fileURLToPath(import.meta.url)), '../artifacts/kit', f);
  return existsSync(p) ? lf(readFileSync(p, 'utf8')) : f.endsWith('.css') ? KIT_FALLBACK_CSS : '';
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
:root { --r: 8px; --ok: var(--good); --ok-soft: var(--good-soft); --err: var(--bad); }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { background: var(--bg); color: var(--ink); font: 16px/1.55 var(--font); }
.lead { margin: 0; color: var(--muted); font-size: 14.5px; } .lead b { color: var(--ink); font-weight: 600; }
.small, .muted.small { font-size: 12.5px; }
main > header { display: grid; gap: 2px; }
main > header .stamp { font-size: 13px; margin: 0; }
.cols { display: grid; gap: 20px; align-items: start; }
@media (min-width: 880px) { .cols { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); } }
.col { display: grid; gap: 10px; align-content: start; min-width: 0; }
.col > .label { margin: 0; }
.grp, .rc { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); }
.grp-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--line); font-size: 14px; }
.grp-head span { color: var(--muted); font-size: 12.5px; }
.tasks { list-style: none; margin: 0; padding: 0; }
.task { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 10px; align-items: start; padding: 10px 14px; }
.task + .task { border-top: 1px solid var(--line); }
.task p { margin: 0; font-size: 14.5px; line-height: 1.5; overflow-wrap: break-word; }
.task code { font-size: .86em; white-space: normal; overflow-wrap: anywhere; }
.tick { position: relative; width: 22px; height: 22px; margin-top: 0; cursor: pointer; }
.tick input { position: absolute; inset: -10px; opacity: 0; cursor: pointer; margin: 0; }
.tick input:disabled { cursor: progress; }
.tick .box { pointer-events: none; position: absolute; inset: 1px; border: 2px solid var(--muted); border-radius: 5px; background: var(--card); }
.tick input:focus-visible + .box { outline: 2px solid var(--accent); outline-offset: 2px; }
.tick input:checked + .box { background: var(--accent); border-color: var(--accent); }
.tick input:checked + .box::after { content: ""; position: absolute; left: 5px; top: 1px; width: 6px; height: 11px; border: solid #fff; border-width: 0 2.5px 2.5px 0; transform: rotate(45deg); }
.task.done p { color: var(--muted); text-decoration: line-through; }
.task > div, .pr > div { display: grid; gap: 2px; min-width: 0; }
.from { font-size: 12.5px; color: var(--muted); overflow-wrap: anywhere; } .from b { color: var(--ink); font-weight: 600; }
.prs { list-style: none; margin: 0; padding: 0; }
.pr { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 10px; align-items: start; padding: 10px 14px; }
.pr + .pr, .prs + .tasks .task:first-child, .prs + .tasks .miss:first-child { border-top: 1px solid var(--line); }
.pr p { margin: 0; font-size: 14.5px; line-height: 1.5; overflow-wrap: break-word; }
.pr .ord { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-ink); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.pr.later .ord { background: var(--soft); color: var(--muted); }
.miss { padding: 10px 14px; font-size: 13px; color: var(--muted); }
.task + .miss { border-top: 1px solid var(--line); }
details.rc { padding: 0; }
details.rc + details.rc { margin-top: 0; }
.rc-static { display: grid; gap: 8px; padding: 12px 14px; }
details.rc > summary { display: grid; gap: 10px; padding: 12px 14px 0; min-height: 0; font-weight: 400; align-items: start; }
details.rc > summary::before { content: none; }
.rc-head { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font-size: 15px; }
.rc-head b { font-weight: 600; }
.rc-head .upd { margin-left: auto; font-size: 12.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
.rc-where { margin: 0; font-size: 14px; color: var(--muted); }
.st { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 500; padding: 2px 8px; border-radius: var(--r); background: var(--soft); color: var(--muted); }
.st i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.st.run { color: var(--good); background: var(--good-soft); }
.st.wait { color: var(--accent-ink); background: var(--accent-soft); }
.ic { width: 16px; height: 16px; flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
/* Timeline */
.tl { list-style: none; margin: 0; padding: 0; display: grid; }
.tl > li { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 10px; position: relative; padding-bottom: 12px; }
.tl > li:last-child { padding-bottom: 2px; }
.tl > li::before { content: ""; position: absolute; left: 10px; top: 24px; bottom: 2px; width: 2px; background: var(--line); }
.tl > li:last-child::before { content: none; }
.tl .node { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: var(--soft); color: var(--muted); }
.tl .node .ic { width: 13px; height: 13px; stroke-width: 2.5; }
.tl li.now .node { background: var(--accent); color: #fff; } .tl li.now .node .ic { fill: currentColor; }
.tl li.warn .node { background: var(--bad-soft); color: var(--bad); }
.tl li.next .node { background: var(--accent-soft); color: var(--accent-ink); }
.tl .k { display: block; font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: .02em; line-height: 22px; }
.tl li.warn .k { color: var(--bad); }
.tl li > div { min-width: 0; display: grid; gap: 8px; align-content: start; }
.tl li > div > .k { margin-bottom: -6px; }
.tl p { margin: 0; font-size: 13.5px; line-height: 1.5; }
.tl li.done p { color: var(--muted); }
.tl .hl { font-size: 14.5px; font-weight: 600; }
/* Plan steps inside "Bây giờ" */
.pst { display: grid; gap: 6px; padding: 10px 12px; border: 1px solid var(--line); border-radius: var(--r); }
.pst-top { display: flex; justify-content: space-between; gap: 8px; font-size: 13.5px; }
.pn { display: inline-flex; align-items: center; gap: 3px; flex: none; font-size: 12.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
.pn .ok { width: 14px; height: 14px; color: var(--good); }
.steps { list-style: none; margin: 0; padding: 0; display: flex; }
.steps li { flex: 1; position: relative; display: grid; justify-items: center; gap: 4px; min-width: 0; }
.steps li::before { content: ""; position: absolute; top: 6px; left: -50%; width: 100%; height: 2px; background: var(--line); }
.steps li:first-child::before { content: none; }
.steps li.d::before, .steps li.c::before { background: var(--accent); }
.steps li span { position: relative; width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--line); background: var(--card); }
.steps li.d span { background: var(--accent); border-color: var(--accent); }
.steps li.c span { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.steps em { font-style: normal; font-size: 11.5px; color: var(--muted); line-height: 1.3; }
.steps li.c em { color: var(--ink); font-weight: 600; }
.pst .note { font-size: 12.5px; color: var(--muted); } .pst .note b { color: var(--ink); font-weight: 600; }
/* Footer button */
.more { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0 -14px; padding: 9px 14px; border-top: 1px solid var(--line); font-size: 13px; font-weight: 500; color: var(--muted); }
details.rc > summary:hover .more { color: var(--ink); background: var(--soft); border-radius: 0 0 var(--r) var(--r); }
details.rc[open] > summary:hover .more { border-radius: 0; }
.more .chev { width: 15px; height: 15px; transition: transform .15s; }
details.rc[open] .more .chev { transform: rotate(180deg); }
@media (prefers-reduced-motion: reduce) { .more .chev { transition: none; } }
/* Tabs */
.tabs { display: flex; gap: 4px; overflow-x: auto; border-bottom: 1px solid var(--line); margin: 0 -2px; padding: 0 2px; scrollbar-width: none; }
.tabs button { flex: none; display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 12px; border: 0; border-bottom: 2px solid transparent; margin-bottom: -1px; background: none; color: var(--muted); font: 500 14px/1 var(--font); cursor: pointer; border-radius: var(--r) var(--r) 0 0; }
.tabs button:hover { color: var(--ink); background: var(--soft); }
.tabs button[aria-selected="true"] { color: var(--ink); border-bottom-color: var(--accent); font-weight: 600; }
.tabs button:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.tabs .cnt { min-width: 20px; padding: 1px 6px; border-radius: var(--r); background: var(--accent-soft); color: var(--accent-ink); font-size: 12px; font-weight: 600; text-align: center; }
.panel { display: grid; gap: 16px; }
.panel[hidden] { display: none; }
/* Overview rows */
a.rrow { display: grid; gap: 8px; padding: 12px 14px 0; color: inherit; text-decoration: none; overflow: hidden; }
a.rrow .hl { margin: 0; font-size: 14.5px; font-weight: 600; line-height: 1.5; }
a.rrow:hover .open { color: var(--ink); background: var(--soft); }
a.rrow:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.minis { display: grid; gap: 6px; }
.mini { display: grid; grid-template-columns: minmax(0, 1fr) minmax(90px, 160px) 44px; gap: 10px; align-items: center; font-size: 13px; }
.mini-t { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--muted); }
.mini .pn { justify-content: flex-end; }
.steps.sm li::before { top: 4px; } .steps.sm li span { width: 10px; height: 10px; border-width: 2px; }
.steps.sm li.c span { box-shadow: 0 0 0 2px var(--accent-soft); }
.open { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0 -14px; padding: 9px 14px; border-top: 1px solid var(--line); font-size: 13px; font-weight: 500; color: var(--muted); }
.open .ic { width: 15px; height: 15px; }
.rc-full { padding: 0 14px 14px; }
.quick { padding-top: 12px; }
.rc-full.quick p, .rc-full.quick li { font-size: 15px; line-height: 1.55; }
.quick ul { margin: 4px 0 14px; padding-left: 20px; }
.quick li { margin: 6px 0; }
.rc-full .repo { border: 0; padding: 10px 0 0; background: transparent; gap: 12px; }
.rc-full p, .rc-full li, .rc-full td, .rc-full th { font-size: 13.5px; }
.rc-full .now-box p, .rc-full .now-box li { font-size: 14px; }
.rc-full .plan > .progress { display: none; }
.rc-full details summary { min-height: 36px; font-size: 13.5px; }
.col > .label.gap { margin-top: 8px; }
.rc-detail { padding: 4px 14px 14px; border-top: 1px solid var(--line); font-size: 14px; }
details.rc[open] .more { border-bottom: 0; }
.rc-detail .repo { border: 0; padding: 10px 0 0; background: transparent; gap: 12px; }
.empty { padding: 14px; margin: 0; }
main { max-width: 1180px; margin: 0 auto; padding: 20px max(16px, env(safe-area-inset-right, 0px)) 40px max(16px, env(safe-area-inset-left, 0px)); display: grid; gap: 16px; }
h1 { font-size: 24px; line-height: 1.25; margin: 0; text-wrap: balance; }
h2 { font-size: 20px; margin: 0; } h2 a { color: inherit; text-decoration: none; }
h3, h4 { font-size: 17px; margin: 0; text-wrap: balance; }
.label { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin: 0 0 6px; }
p { margin: 0 0 8px; } a { color: inherit; text-underline-offset: 3px; }
a:focus-visible, summary:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; border-radius: 6px; }
code { font-size: .9em; background: var(--line); padding: 1px 5px; border-radius: 4px; overflow-wrap: anywhere; }
.stamp, .muted, .meta { color: var(--muted); font-size: 14px; }
.repo, .subject { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 18px; display: grid; gap: 14px; }
.now-box p, .now-box li { font-size: 16px; }
.ask { background: var(--wait-soft); border-radius: var(--r); padding: 12px 14px; }
.ask .label { color: var(--wait); }
.plan { border-top: 1px solid var(--line); padding-top: 14px; display: grid; gap: 8px; }
.plan header { display: flex; gap: 10px; align-items: baseline; justify-content: space-between; flex-wrap: wrap; }
.plan-open { justify-self: start; font-size: 14px; font-weight: 600; min-height: 32px; display: inline-flex; align-items: center; }
.progress { display: flex; align-items: center; gap: 10px; }
.bar { flex: 1; height: 8px; background: var(--line); border-radius: 99px; overflow: hidden; }
.bar span { display: block; height: 100%; background: var(--accent); border-radius: 99px; }
.count, .ck-count { font-variant-numeric: tabular-nums; color: var(--muted); font-size: 14px; }
.pill { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: var(--r); white-space: nowrap; }
.pill.state { background: var(--line); }
.pill.now { background: var(--ink); color: var(--card); }
.pill.ok { background: var(--ok-soft); color: var(--ok); }
details { border: 1px solid var(--line); border-radius: var(--r); padding: 0 12px; }
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
.box { flex: none; width: 20px; height: 20px; margin-top: 2px; border: 1.5px solid var(--muted); border-radius: 5px; display: grid; place-items: center; font-size: 13px; font-weight: 700; }
li.done .box { background: var(--ok); border-color: var(--ok); color: var(--card); }
li.done > span:last-child { color: var(--muted); }
.log.errors summary { color: var(--err); }
.table { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 14px; }
th, td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid var(--line); }
th { color: var(--muted); font-weight: 600; }
.overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.tile { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 12px 14px; display: grid; gap: 4px; text-decoration: none; }
.tile span { color: var(--muted); font-size: 14px; }
.tile.missing { border-style: dashed; }
.small, .muted.small { font-size: 12.5px; }
/* Folded repo detail: same sizes as the cards; the card already shows the plan bars. */
.rc-detail .plan > .progress { display: none; }
.rc-detail p, .rc-detail li, .rc-detail td, .rc-detail th { font-size: 13.5px; }
.rc-detail .meta { font-size: 12.5px; }
.rc-detail h4 { font-size: 14.5px; }
.rc-detail .plan { padding-top: 10px; gap: 6px; }
.rc-detail details summary { min-height: 36px; font-size: 13.5px; }
.rc-detail .label { margin: 4px 0 2px; }
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
      for (const o of cards) if (o.dataset.key === c.dataset.key) { o.querySelector('input').checked = box.checked; paint(o); }
      st.save(S);
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

/** The whole page for CLI-style args (--title, --roadmap, <dir>=<repo>, missing=<repo>:<why>). */
/** The "## Mở nhanh" section of a markdown file (README.md), rendered; '' when the file has none. */
export function quickLinks(md, linkBase) {
  const lines = lf(md).split('\n');
  const start = lines.findIndex((l) => /^##\s+Mở nhanh\s*$/.test(l));
  if (start < 0) return '';
  let end = lines.findIndex((l, k) => k > start && /^#{1,2}\s/.test(l));
  if (end < 0) end = lines.length;
  return blocks(lines.slice(start + 1, end), linkBase);
}

export function buildPage(args) {
  let title = 'Tiến độ';
  let roadmapArg = null, prs, quick = '';
  const repos = [];
  for (let k = 0; k < args.length; k++) {
    if (args[k] === '--title') title = args[++k];
    else if (args[k] === '--roadmap') roadmapArg = args[++k];
    else if (args[k] === '--prs') prs = JSON.parse(lf(readFileSync(args[++k], 'utf8')));
    else if (args[k] === '--links') { const [file, linkBase] = args[++k].split('='); quick = quickLinks(readFileSync(file, 'utf8'), linkBase); }
    else repos.push(args[k]);
  }
  if (roadmapArg) {
    const [file, linkBase] = roadmapArg.split('=');
    return page(title, roadmap(file, linkBase).html, stampNow());
  }
  const details = {};
  const parsed = repos.map((a) => {
    if (a.startsWith('missing=')) {
      const [repo, ...why] = a.slice(8).split(':');
      return { id: repoId(repo), name: repo.split('/')[1], repo, missing: true, why: why.join(':'), tasks: [], plans: [], open: 0, prs: prs ? prs[repo] : undefined };
    }
    const [dir, repo] = a.split('=');
    const d = repoData(dir, repo);
    details[d.id] = repoSection(dir, repo);
    if (prs) d.prs = repo in prs ? prs[repo] : null;
    return d;
  });
  return page(title, overviewBody(parsed, details, quick), stampNow(), { ticks: true });
}

// Compare real paths, not URL strings: on Windows, or with spaces or Vietnamese letters in the
// path, `file://${argv[1]}` never equals import.meta.url and the script silently did nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  process.stdout.write(buildPage(process.argv.slice(2)));
}
