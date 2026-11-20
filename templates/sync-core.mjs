// Chép phần lõi sang repo private thiengthb/thienai-core (KH10 ga 1, docs/plans/2026-11-20-team-mcp.md).
// Một chiều: repo này là nguồn, upstream/ bên thienai-core chỉ là bản chép, không sửa tay bên đó.
//   node templates/sync-core.mjs <thư mục clone thienai-core> [--check]
// Đọc danh sách ở templates/core-files.txt, chép từng file vào <đích>/upstream/ giữ nguyên đường dẫn, xoá file trong
// upstream/ không còn trong danh sách, ghi upstream/SOURCE.txt (commit nguồn). Trước khi ghi gì, quét mọi file sẽ chép;
// gặp đồ riêng thì dừng, in từng chỗ, thoát 1 và không ghi file nào. --check: chỉ quét, không ghi.
//
// Đồ riêng bị chặn:
//   - đường dẫn dưới profile/, learning/, life/, docs/ (hồ sơ, tiến độ học, đời sống, kế hoạch thật của thien);
//   - tên nick thật (tnt + ba chữ số; "tntXXX" trong luật thì được), link phiên chat và link trang artifact thật,
//     địa chỉ email.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync, copyFileSync } from 'node:fs';
import { dirname, join, relative, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const BLOCKED_DIRS = ['profile/', 'learning/', 'life/', 'docs/'];
export const BLOCKED_TEXT = [
  [/\btnt\d{3}\b/, 'tên nick thật'],
  [/claude\.ai\/(?:code\/)?(?:session_|chat\/)[A-Za-z0-9]/, 'link phiên chat'],
  [/claude\.ai\/(?:code\/)?artifact\/[A-Za-z0-9]/, 'link trang artifact'],
  // Email; tên ảnh kiểu ten@2x.png không tính.
  [/[A-Za-z0-9._%+-]+@(?!anthropic\.com)[A-Za-z0-9.-]+\.(?!(?:png|jpe?g|webp|svg|gif)\b)[A-Za-z]{2,}\b/, 'địa chỉ email'],
];

/** Dòng trong core-files.txt → danh sách file (thư mục kết thúc bằng / thì lấy mọi file bên trong). */
export function listFiles(manifestText, base = root) {
  const out = [];
  for (const raw of manifestText.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const abs = join(base, line);
    const rel = relative(base, abs);
    if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error(`core-files.txt: ${line} nằm ngoài repo`);
    if (!existsSync(abs)) throw new Error(`core-files.txt: không có ${line}`);
    if (statSync(abs).isDirectory()) {
      const walk = (d) => readdirSync(d).sort().forEach((n) => {
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p); else out.push(relative(base, p).split(sep).join('/'));
      });
      walk(abs);
    } else out.push(rel.split(sep).join('/'));
  }
  return [...new Set(out)];
}

/** Chỗ lộ đồ riêng trong danh sách file: [{ file, line, why }]. */
export function scan(files, base = root) {
  const hits = [];
  for (const f of files) {
    const dir = BLOCKED_DIRS.find((d) => f.startsWith(d));
    if (dir) { hits.push({ file: f, line: 0, why: `nằm dưới ${dir}` }); continue; }
    const buf = readFileSync(join(base, f));
    if (buf.includes(0)) continue;   // file nhị phân
    buf.toString('utf8').split('\n').forEach((text, i) => {
      for (const [re, why] of BLOCKED_TEXT) if (re.test(text)) hits.push({ file: f, line: i + 1, why });
    });
  }
  return hits;
}

/** Chép files vào <dest>/upstream/, xoá file thừa, ghi SOURCE.txt. Trả về { added, removed }. */
export function sync(files, dest, base = root, source = '') {
  const up = join(dest, 'upstream');
  const before = new Set();
  if (existsSync(up)) {
    const walk = (d) => readdirSync(d).forEach((n) => {
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p); else before.add(relative(up, p).split(sep).join('/'));
    });
    walk(up);
  }
  before.delete('SOURCE.txt');
  const removed = [...before].filter((f) => !files.includes(f));
  for (const f of removed) rmSync(join(up, f));
  for (const f of files) { mkdirSync(dirname(join(up, f)), { recursive: true }); copyFileSync(join(base, f), join(up, f)); }
  // Thư mục rỗng sau khi xoá thì bỏ luôn.
  const prune = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) { prune(p); if (!readdirSync(p).length) rmSync(p, { recursive: true }); } } };
  prune(up);
  writeFileSync(join(up, 'SOURCE.txt'), `Chép từ thiengthb/thienai-workflow${source ? '@' + source : ''} bằng templates/sync-core.mjs. Không sửa tay: sửa ở nguồn.\n`);
  return { added: files.filter((f) => !before.has(f)), removed };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2), check = args.includes('--check');
  const dest = args.find((a) => !a.startsWith('--'));
  if (!dest && !check) { console.error('Dùng: node templates/sync-core.mjs <thư mục clone thienai-core> [--check]'); process.exit(2); }
  const files = listFiles(readFileSync(join(root, 'templates/core-files.txt'), 'utf8'));
  const hits = scan(files);
  if (hits.length) {
    console.error(`Dừng: ${hits.length} chỗ lộ đồ riêng, không chép gì.`);
    for (const h of hits) console.error(`- ${h.file}${h.line ? ':' + h.line : ''}: ${h.why}`);
    process.exit(1);
  }
  if (check) { console.log(`sync-core: ổn (${files.length} file, không có đồ riêng)`); process.exit(0); }
  let source = '';
  try { source = execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* không phải clone git */ }
  const r = sync(files, dest, root, source);
  console.log(`Đã chép ${files.length} file vào ${join(dest, 'upstream')} (mới ${r.added.length}, xoá ${r.removed.length}).`);
}
