#!/usr/bin/env node
// Checks the size limits of docs/STATUS.md, so the file stays readable in two minutes.
// Copy to scripts/check-status.mjs in a project and run it in CI: node scripts/check-status.mjs
// Limits: whole file at most 40 lines, at most 3 items under "## Đang chờ thien".
import { readFileSync } from 'node:fs';

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

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2] ?? 'docs/STATUS.md';
  const problems = checkStatus(readFileSync(file, 'utf8'));
  for (const p of problems) console.error(`${file}: ${p}`);
  if (problems.length) process.exit(1);
  console.log(`${file}: ổn`);
}
