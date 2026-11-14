#!/usr/bin/env node
// Ghi tính năng nào của trang học và trang ôn thật sự được dùng, vào learning/usage.md (đề xuất P3).
// Mốc 2026-12-13 đọc bảng này để quyết giữ hay bỏ: tính năng gần như không ai bấm thì bỏ cho trang gọn.
//
//   node artifacts/kit/usage.mjs learning/usage.md      in tóm tắt: mỗi tính năng dùng ở bao nhiêu buổi, bao nhiêu lần
//
// Dòng mới do after-lesson.mjs (buổi học) và apply-review.mjs (trang ôn) thêm, không ai gõ tay.
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const COLUMNS = ['Ngày', 'Trang', 'Phút', 'Hỏi Claude', 'Claude giải thích câu sai', 'Claude nhận xét, chấm', 'Nói thay gõ', 'Ghi chú'];
const FEATURES = COLUMNS.slice(3, 7);
const cell = (v) => String(v ?? '-').replace(/\|/g, '/').replace(/\s+/g, ' ').trim() || '-';

/** Thêm (hoặc thay, nếu đã có cùng ngày và cùng trang) một dòng vào bảng của learning/usage.md. */
export function addUsage(text, row) {
  const line = '| ' + COLUMNS.map((c) => cell(row[c])).join(' | ') + ' |';
  const lines = text.replace(/\n+$/, '').split('\n');
  const head = lines.findIndex((l) => l.startsWith('| ' + COLUMNS[0] + ' |'));
  if (head < 0) throw new Error('usage.md: không thấy bảng có cột "' + COLUMNS.join(' | ') + '"');
  let end = head + 2;
  while (end < lines.length && lines[end].startsWith('|')) end++;
  const key = (l) => l.split('|').slice(1, 3).map((s) => s.trim()).join('|');
  const same = lines.slice(head + 2, end).findIndex((l) => key(l) === key(line));
  if (same >= 0) lines[head + 2 + same] = line; else lines.splice(end, 0, line);
  return lines.join('\n') + '\n';
}

/** Các dòng của bảng, mỗi dòng là { cột: giá trị }. */
export function usageRows(text) {
  const lines = text.split('\n'), head = lines.findIndex((l) => l.startsWith('| ' + COLUMNS[0] + ' |'));
  if (head < 0) return [];
  const out = [];
  for (let i = head + 2; i < lines.length && lines[i].startsWith('|'); i++) {
    const v = lines[i].split('|').slice(1, -1).map((s) => s.trim());
    out.push(Object.fromEntries(COLUMNS.map((c, j) => [c, v[j] ?? ''])));
  }
  return out;
}

/** Mỗi tính năng: dùng ở bao nhiêu buổi trên tổng số buổi có tính năng đó ("-" là trang không có), tổng số lần. */
export function usageSummary(text) {
  const rows = usageRows(text);
  return FEATURES.map((f) => {
    const had = rows.filter((r) => r[f] !== '-' && r[f] !== '');
    const used = had.filter((r) => Number(r[f]) > 0);
    return { feature: f, sessions: had.length, used: used.length, times: used.reduce((s, r) => s + Number(r[f]), 0) };
  });
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const file = process.argv[2] || 'learning/usage.md';
  const text = readFileSync(file, 'utf8');
  console.log(`${usageRows(text).length} buổi đã ghi trong ${file}`);
  for (const s of usageSummary(text)) console.log(`- ${s.feature}: dùng ở ${s.used}/${s.sessions} buổi có tính năng này, tổng ${s.times} lần`);
}
