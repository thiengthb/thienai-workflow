#!/usr/bin/env node
// Checks internal links in the repo's Markdown files, so moving or renaming a file cannot silently break the way
// an AI finds its rules. Two kinds of reference are checked:
//   1. Markdown links [text](path) and [text](path#anchor) to files in this repo (anchors are checked too).
//   2. Repo paths written in backticks, e.g. `profile/TUTOR.md` or `artifacts/lesson/`, when they start with a
//      top-level folder of this repo. Paths with placeholders (<môn>, NN, *, …) are skipped.
// Also lists Markdown files that no other file mentions ("orphans"), so a person can decide whether they are
// still needed. Orphans are a note, not a failure: a file nobody links to is not automatically unused.
//
//   node .github/scripts/check-links.mjs [--root <dir>] [--orphans]
// Exit code 1 when a link is broken.
import { readFileSync, existsSync, statSync, realpathSync } from 'node:fs';
import { join, dirname, normalize, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const lf = (s) => s.replace(/^﻿/, '').replace(/\r\n?/g, '\n');

/** GitHub-style anchor for a heading. */
export function slug(heading) {
  return heading.trim().toLowerCase().replace(/[`*_~[\]()]/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');
}

export function anchors(md) {
  const out = new Set();
  const seen = {};
  for (const m of lf(md).replace(/```[\s\S]*?```/g, '').matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const s = slug(m[1]);
    const n = seen[s] = (seen[s] ?? -1) + 1;
    out.add(n ? `${s}-${n}` : s);
  }
  return out;
}

const PLACEHOLDER = /[<>*{}…]|\bNN\b|\bN\b|YYYY|<|\.\.\.|\bxx\b/;

/** All internal references in one Markdown file: [{ target, anchor, line, kind }]. */
export function references(md, topDirs) {
  const refs = [];
  const lines = lf(md).split('\n');
  let fence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) { fence = !fence; return; }
    if (fence) return;
    for (const m of line.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const url = m[1];
      if (/^[a-z][a-z0-9+.-]+:/i.test(url) || url.startsWith('//')) continue; // http:, mailto:, …
      const [target, anchor] = url.split('#');
      refs.push({ target: decodeURIComponent(target), anchor: anchor || '', line: i + 1, kind: 'link' });
    }
    // Backtick paths: only ones that start with a real top-level folder or file of the repo.
    for (const m of line.replace(/\[[^\]]*\]\([^)]*\)/g, '').matchAll(/`([^`\s]+)`/g)) {
      const p = m[1].replace(/[),.:;]+$/, '');
      if (PLACEHOLDER.test(p) || /^[a-z][a-z0-9+.-]+:/i.test(p) || p.includes('=')) continue;
      const head = p.split('/')[0];
      if (!topDirs.has(head) || (!p.includes('/') && !/\.\w+$/.test(p))) continue;
      refs.push({ target: p, anchor: '', line: i + 1, kind: 'path', rootRelative: true });
    }
  });
  return refs;
}

/** Paths in .github/links-ignore.txt: files of other repos or projects that this repo only names. */
export function ignoreList(root) {
  const f = join(root, '.github/links-ignore.txt');
  if (!existsSync(f)) return new Set();
  return new Set(lf(readFileSync(f, 'utf8')).split('\n').map((l) => l.replace(/#.*/, '').trim().replace(/\/$/, '')).filter(Boolean));
}

export function checkRepo(root) {
  const ignore = ignoreList(root);
  const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  const tracked = new Set(files);
  const dirs = new Set(files.flatMap((f) => f.split('/').slice(0, -1).map((_, i, a) => a.slice(0, i + 1).join('/'))));
  const topDirs = new Set(files.map((f) => f.split('/')[0]));
  const md = files.filter((f) => f.endsWith('.md'));
  const broken = [];
  const mentioned = new Set();
  const anchorCache = {};
  const exists = (p) => tracked.has(p) || dirs.has(p.replace(/\/$/, ''));
  for (const f of md) {
    const text = readFileSync(join(root, f), 'utf8');
    for (const r of references(text, topDirs)) {
      let p = r.target;
      if (r.kind === 'link') {
        if (!p) p = f; // [x](#anchor) is the same file
        else p = normalize(join(dirname(f), p)).replace(/\\/g, '/');
      }
      p = p.replace(/^\.\//, '').replace(/\/$/, '');
      if (p.startsWith('..')) continue; // outside the repo
      if (ignore.has(p) || ignore.has(r.target.replace(/\/$/, ''))) continue;
      if (r.kind === 'link' && f.endsWith('.template.md') && !exists(p)) continue; // templates link to placeholders
      // A backtick path may be written relative to the file's folder (e.g. `lessons/01.md` inside learning/war/).
      const local = normalize(join(dirname(f), r.target)).replace(/\\/g, '/').replace(/\/$/, '');
      const hit = exists(p) ? p : r.kind === 'path' && exists(local) ? local : null;
      if (!hit) {
        // A backtick path that names a file another project is meant to have (docs/STATUS.md in sakubun) is fine
        // only if it is clearly about another repo; we cannot know that, so only links and paths to this repo's own
        // top folders are checked, and those must exist.
        broken.push(`${f}:${r.line}: ${r.kind === 'link' ? 'link' : 'đường dẫn'} tới ${r.target}${r.anchor ? '#' + r.anchor : ''} không có trong repo`);
        continue;
      }
      if (hit !== f) mentioned.add(hit);
      if (r.anchor && hit.endsWith('.md')) {
        anchorCache[hit] ??= anchors(readFileSync(join(root, hit), 'utf8'));
        if (!anchorCache[hit].has(r.anchor.toLowerCase())) broken.push(`${f}:${r.line}: không có mục #${r.anchor} trong ${hit}`);
      }
    }
  }
  // Files read by tools rather than by people (AGENTS.md, CLAUDE.md, SKILL.md, templates) are entry points.
  const entry = (f) => /(^|\/)(AGENTS|CLAUDE|SKILL|README)\.md$/.test(f) || f.startsWith('.github/') || /\.template\.md$/.test(f);
  // Folders are mentioned as `learning/war/`: a file inside a mentioned folder counts as reachable.
  // Only folders below the top level count: "learning/" alone would make every file look reachable.
  const reachable = (f) => mentioned.has(f) || [...mentioned].some((m) => dirs.has(m) && m.includes('/') && f.startsWith(m + '/'));
  const orphans = md.filter((f) => !entry(f) && !reachable(f));
  return { broken, orphans, checked: md.length };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const ri = args.indexOf('--root');
  const root = ri >= 0 ? args[ri + 1] : join(dirname(fileURLToPath(import.meta.url)), '../..');
  const { broken, orphans, checked } = checkRepo(root);
  if (args.includes('--orphans') && orphans.length) {
    console.log(`File .md không file nào nhắc tới (${orphans.length}), xem có còn cần không:`);
    for (const o of orphans) console.log('- ' + o);
  }
  if (broken.length) {
    console.log(`Link nội bộ hỏng (${broken.length}):`);
    for (const b of broken) console.log('- ' + b);
    process.exitCode = 1;
  } else console.log(`check-links: ổn (${checked} file .md)`);
}
