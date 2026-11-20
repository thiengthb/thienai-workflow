// Tests for templates/sync-core.mjs (KH10 ga 1), run in CI by .github/workflows/test.yml.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { listFiles, scan, sync } from '../../templates/sync-core.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'sync-core-'));
process.on('exit', () => rmSync(tmp, { recursive: true, force: true }));

// 1. Danh sách thật không có đồ riêng.
const files = listFiles(readFileSync(join(root, 'templates/core-files.txt'), 'utf8'));
assert.ok(files.length > 20, 'core list has the builders and templates');
assert.deepEqual(scan(files), [], 'real core list must pass the scan');

// 2. Cố tình đưa đồ riêng vào: bị chặn, từng chỗ.
const fake = join(tmp, 'fake');
mkdirSync(join(fake, 'profile'), { recursive: true });
mkdirSync(join(fake, 'templates'), { recursive: true });
writeFileSync(join(fake, 'profile/PROFILE.md'), 'hồ sơ\n');
writeFileSync(join(fake, 'templates/a.md'), 'Ghi bởi nick tnt697\nluật: nick tntXXX\nảnh ten@2x.png\n');
writeFileSync(join(fake, 'templates/b.md'), 'https://claude.ai/code/session_01ABC\nhttps://claude.ai/artifact/Abc123\nthu@example.com\n');
const hits = scan(listFiles('profile/PROFILE.md\ntemplates/\n', fake), fake);
assert.deepEqual(hits.map((h) => `${h.file}:${h.line}:${h.why}`), [
  'profile/PROFILE.md:0:nằm dưới profile/',
  'templates/a.md:1:tên nick thật',
  'templates/b.md:1:link phiên chat',
  'templates/b.md:2:link trang artifact',
  'templates/b.md:3:địa chỉ email',
], 'private paths, real nicks, chat and artifact links, emails are blocked; tntXXX and image@2x are not');

// 2b. Dòng trỏ ra ngoài repo bị từ chối, không chép ra ngoài upstream/.
assert.throws(() => listFiles('../x\n', fake), /nằm ngoài repo/);
assert.throws(() => listFiles('templates/../../x\n', fake), /nằm ngoài repo/);

// 3. Lệnh chạy thật: có đồ riêng thì thoát 1, không ghi gì.
const dest = join(tmp, 'core');
mkdirSync(dest);
let failed = false;
try {
  execFileSync(process.execPath, ['-e', `
    const m = await import(${JSON.stringify(join(root, 'templates/sync-core.mjs'))});
    const hits = m.scan(m.listFiles('profile/PROFILE.md\\n', ${JSON.stringify(fake)}), ${JSON.stringify(fake)});
    if (hits.length) process.exit(1);`, '--input-type=module'], { stdio: 'ignore' });
} catch { failed = true; }
assert.ok(failed, 'a list with private files exits non-zero');

// 4. Chép thật vào upstream/, rồi dựng một trang kế hoạch từ bản chép (import tương đối còn chạy).
const r = sync(files, dest, root, 'test');
assert.equal(r.added.length, files.length);
assert.ok(readFileSync(join(dest, 'upstream/SOURCE.txt'), 'utf8').includes('@test'));
const plan = join(tmp, 'plan.md');
writeFileSync(plan, readFileSync(join(root, 'templates/PLAN.template.md'), 'utf8')
  .replace('KH<số>', 'KH1').replace('<Tên kế hoạch bằng tiếng Việt>', 'Thử').replaceAll('<ngày>', '2026-01-01'));
const out = execFileSync(process.execPath, [join(dest, 'upstream/artifacts/plan/make-plan.mjs'), plan, join(tmp, 'out')], { encoding: 'utf8' });
assert.match(out, /Đã dựng "KH1 · Thử"/, 'plan builder runs from the copy');
assert.ok(existsSync(join(tmp, 'out/index.html')));

// 5. File bỏ khỏi danh sách thì bị xoá khỏi upstream/, thư mục rỗng cũng bỏ.
const fewer = files.filter((f) => !f.startsWith('artifacts/flow/'));
const r2 = sync(fewer, dest, root, 'test2');
assert.equal(r2.removed.length, files.length - fewer.length);
assert.ok(!existsSync(join(dest, 'upstream/artifacts/flow')), 'empty folder removed');

console.log('ok sync-core');
