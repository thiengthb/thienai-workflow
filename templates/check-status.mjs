#!/usr/bin/env node
// Checks the size limits of docs/STATUS.md, so the file stays readable in two minutes.
// Copy to scripts/check-status.mjs in a project and run it in CI: node scripts/check-status.mjs
// Limits: whole file at most 40 lines, at most 3 items under "## Đang chờ thien".
// Also checks every docs/plans/*.md written from PLAN.template.md (has "## Checkpoint") has the sections
// the progress page reads (rules in profile/PLANNING.md of thienai-workflow).
// Optional flags (off by default, so copies in other projects keep working without git or gh):
//   --git          fail when "Cập nhật lần cuối: YYYY-MM-DD" is more than 3 days older than the newest commit.
//   --prs          remind (no failure) about open PRs the file never mentions as #N; needs gh, skipped without it.
//   --cards <file> remind (no failure) about review cards whose "Hỏi lại" date is more than 3 days past.
// Reminders print as "nhắc: ..." and, inside GitHub Actions, as ::warning:: so they show on the PR's checks.
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

export const MAX_LINES = 40;
export const MAX_WAITING = 3;

/** Returns a list of problems in Vietnamese; empty when the file is within limits. */
export function checkStatus(text) {
  const problems = [];
  const lines = text.replace(/\n$/, '').split('\n');
  if (lines.length > MAX_LINES) {
    problems.push(`STATUS dài ${lines.length} dòng, tối đa ${MAX_LINES}. Rút gọn: lịch sử để trong git và PR.`);
  }
  const start = lines.findIndex((l) => /^##\s+Đang chờ thien\s*$/.test(l));
  if (start >= 0) {
    let waiting = 0;
    for (const l of lines.slice(start + 1)) {
      if (/^##\s/.test(l)) break;
      if (/^\s*(?:[-*]|\d+\.)\s+\S/.test(l) && !/^\s/.test(l)) waiting++;
    }
    if (waiting > MAX_WAITING) {
      problems.push(`Mục "Đang chờ thien" có ${waiting} việc, tối đa ${MAX_WAITING}. Hỏi thien bỏ hoặc dời việc nào.`);
    }
  }
  return problems;
}

export const STALE_DAYS = 3;
const day = (d) => Math.floor(Date.parse(d + 'T00:00:00Z') / 864e5);

/** Fails when the file's "Cập nhật lần cuối" date is more than STALE_DAYS before the newest commit (YYYY-MM-DD). */
export function checkFresh(text, lastCommit) {
  const m = /Cập nhật lần cuối:\s*(\d{4}-\d{2}-\d{2})/.exec(text);
  if (!m) return ['thiếu dòng "Cập nhật lần cuối: YYYY-MM-DD".'];
  const gap = day(lastCommit) - day(m[1]);
  return gap > STALE_DAYS ? [`STATUS cập nhật ngày ${m[1]}, cũ hơn commit mới nhất (${lastCommit}) ${gap} ngày. Sửa lại các mục cho đúng hiện tại.`] : [];
}

/** Open PRs ([{number, title}]) that the file never mentions as #N; `self` is the PR being checked, left out. */
export function missingPrs(text, prs, self) {
  return prs.filter((p) => p.number !== self && !new RegExp(`#${p.number}(?!\\d)`).test(text))
    .map((p) => `PR #${p.number} (${p.title}) đang mở mà STATUS không nhắc.`);
}

/** Review cards (markdown table with a "Hỏi lại" date column) overdue by more than STALE_DAYS on `today`. */
export function overdueCards(text, today) {
  const rows = text.split('\n').filter((l) => /^\|/.test(l));
  const head = (rows[0] || '').split('|').map((c) => c.trim());
  const col = head.indexOf('Hỏi lại');
  if (col < 0) return [];
  const late = rows.slice(2).map((l) => l.split('|').map((c) => c.trim()))
    .filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c[col] || '') && day(today) - day(c[col]) > STALE_DAYS);
  return late.length ? [`${late.length} thẻ ôn quá hạn hơn ${STALE_DAYS} ngày (${late.slice(0, 5).map((c) => c[1]).join(', ')}${late.length > 5 ? '…' : ''}). Mở buổi ôn.`] : [];
}

export const PLAN_SECTIONS = ['Đang ở đâu', 'Mục tiêu', 'Không làm', 'Checkpoint', 'Đã đổi', 'Lỗi gặp'];

/** Returns problems for one plan file; plans written before the template (no "## Checkpoint") are skipped. */
export function checkPlan(text) {
  if (!/^## Checkpoint/m.test(text)) return [];
  const problems = [];
  if (!/^Trạng thái:\s*(đang chạy|chờ duyệt|tạm dừng|xong|bỏ)(?=[\s.,;·]|$)/m.test(text)) {
    problems.push('thiếu dòng "Trạng thái: đang chạy | chờ duyệt | tạm dừng | xong | bỏ" ở đầu file.');
  }
  for (const name of PLAN_SECTIONS) {
    if (!new RegExp(`^## ${name}`, 'm').test(text)) problems.push(`thiếu mục "## ${name}".`);
  }
  if (!/^### /m.test(text)) problems.push('mục Checkpoint chưa có checkpoint nào ("### 1. ...").');
  if (!/^Trạng thái:\s*(xong|bỏ)(?=[\s.,;·]|$)/m.test(text) && planCode(text) == null) {
    problems.push('tiêu đề chưa có mã kế hoạch: "# KH<số> · <tên>", số kế tiếp sau mã lớn nhất trong docs/plans/ (luật ở profile/PLANNING.md).');
  }
  return problems;
}

/** Plan code from the title line "# KH6 · ...": the number, or null. thien calls plans by this code (profile/PLANNING.md). */
export function planCode(text) {
  const m = /^# KH(\d+) · /m.exec(text);
  return m ? Number(m[1]) : null;
}

/** Problems for codes shared by two plan files ([[name, text]]). Codes are never reused, even after a plan is done. */
export function duplicateCodes(files) {
  const seen = new Map(), problems = [];
  for (const [name, text] of files) {
    const c = planCode(text);
    if (c == null) continue;
    if (seen.has(c)) problems.push(`mã KH${c} trùng ở ${seen.get(c)} và ${name}: mỗi kế hoạch một mã riêng, không dùng lại.`);
    else seen.set(c, name);
  }
  return problems;
}

// Compare real paths, not URL strings: on Windows, or with spaces or Vietnamese letters in the
// path, `file://${argv[1]}` never equals import.meta.url and the script silently did nothing.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf('--' + n); return i < 0 ? false : (args.splice(i, 1), true); };
  const opt = (n) => {
    const i = args.indexOf('--' + n);
    if (i < 0) return null;
    const v = args[i + 1];
    if (!v || v.startsWith('--')) { console.error(`--${n} cần một đường dẫn file, ví dụ --${n} learning/cards.md`); process.exit(2); }
    return args.splice(i, 2)[1];
  };
  const useGit = flag('git'), usePrs = flag('prs'), cards = opt('cards');
  const file = args[0] ?? 'docs/STATUS.md';
  const text = lf(readFileSync(file, 'utf8'));
  const problems = checkStatus(text).map((p) => `${file}: ${p}`);
  const notes = [];
  if (useGit) {
    const r = spawnSync('git', ['log', '-1', '--format=%cs'], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) problems.push(...checkFresh(text, r.stdout.trim()).map((p) => `${file}: ${p}`));
    else problems.push(`--git: không đọc được ngày commit mới nhất (${(r.stderr || r.error?.message || 'git không trả gì').trim()})`);
  }
  if (usePrs) {
    const repo = process.env.GITHUB_REPOSITORY;
    const r = spawnSync('gh', ['api', repo ? `repos/${repo}/pulls?state=open&per_page=100` : 'repos/{owner}/{repo}/pulls?state=open&per_page=100'], { encoding: 'utf8' });
    if (r.status === 0) {
      const self = Number((process.env.GITHUB_REF || '').match(/refs\/pull\/(\d+)\//)?.[1]) || null;
      notes.push(...missingPrs(text, JSON.parse(r.stdout), self));
    } else notes.push('chưa đọc được danh sách PR (cần gh đã đăng nhập), bỏ qua phần này.');
  }
  if (cards) notes.push(...overdueCards(lf(readFileSync(cards, 'utf8')), new Date().toISOString().slice(0, 10)));
  for (const n of notes) console.log(process.env.GITHUB_ACTIONS ? `::warning::${n}` : `nhắc: ${n}`);
  const plansDir = join(dirname(file), 'plans');
  if (existsSync(plansDir)) {
    const planFiles = readdirSync(plansDir).filter((n) => n.endsWith('.md')).map((f) => [join(plansDir, f), lf(readFileSync(join(plansDir, f), 'utf8'))]);
    for (const [f, t] of planFiles) for (const p of checkPlan(t)) problems.push(`${f}: ${p}`);
    problems.push(...duplicateCodes(planFiles));
  }
  for (const p of problems) console.error(p);
  if (problems.length) process.exit(1);
  console.log(`${file}: ổn`);
}
