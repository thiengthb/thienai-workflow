// Test for templates/check-open-work.mjs: report wording, and a real run in a temp repo with an unmerged branch.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { openWork, report } from '../../templates/check-open-work.mjs';

assert.match(report([], ['learning/war/']), /Không có nhánh chưa merge/);
const d = mkdtempSync(join(tmpdir(), 'cow-')), origin = join(d, 'origin.git'), work = join(d, 'work');
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
execFileSync('git', ['init', '-q', '--bare', '-b', 'main', origin]);
execFileSync('git', ['clone', '-q', origin, work], { stdio: 'ignore' });
for (const [k, v] of [['user.email', 't@t'], ['user.name', 't']]) g(work, 'config', k, v);
writeFileSync(join(work, 'a.md'), 'a'); g(work, 'add', '.'); g(work, 'commit', '-qm', 'init'); g(work, 'push', '-q', 'origin', 'HEAD:main');
g(work, 'checkout', '-qb', 'other'); mkdirSync(join(work, 'learning/war'), { recursive: true });
writeFileSync(join(work, 'learning/war/x.md'), 'x'); g(work, 'add', '.'); g(work, 'commit', '-qm', 'war lesson'); g(work, 'push', '-q', 'origin', 'other');
g(work, 'checkout', '-q', 'main');
let list = openWork({ paths: ['learning/war/'], cwd: work });
assert.equal(list.length, 1); assert.equal(list[0].branch, 'other'); assert.deepEqual(list[0].files, ['learning/war/x.md']);
assert.equal(openWork({ paths: ['learning/ba/'], cwd: work }).length, 0);
g(work, 'checkout', '-qb', 'mine'); g(work, 'merge', '-q', 'other');
assert.equal(openWork({ paths: ['learning/war/'], cwd: work, fetch: false }).length, 0, 'branch already merged into current one is not reported');
// Clone một nhánh: fetch thường chỉ tải main, check vẫn phải thấy nhánh "other".
const single = join(d, 'single');
execFileSync('git', ['clone', '-q', '--single-branch', '--branch', 'main', origin, single], { stdio: 'ignore' });
assert.deepEqual(openWork({ paths: ['learning/war/'], cwd: single }).map((w) => w.branch), ['other'], 'single-branch clone still sees other branches');
// Không tải được từ origin: báo là chưa chắc, không im lặng nói "không có gì".
g(single, 'remote', 'set-url', 'origin', join(d, 'missing.git'));
const off = openWork({ paths: ['learning/ba/'], cwd: single });
assert.equal(off.stale, true); assert.match(report(off, ['learning/ba/']), /Không tải được/);
// make-lesson: trang mới trong thư mục chưa có (learning/war/pages/) vẫn bị chặn khi nhánh khác đã sửa môn đó.
const fresh = join(d, 'fresh'); execFileSync('git', ['clone', '-q', origin, fresh], { stdio: 'ignore' }); mkdirSync(join(fresh, 'learning'));
const page = join(fresh, 'learning/war/pages/new.html'), mk = fileURLToPath(new URL('../../artifacts/lesson/make-lesson.mjs', import.meta.url));
let code = 0, err = '';
try { execFileSync('node', [mk, page], { cwd: fresh, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { code = e.status; err = e.stderr; }
assert.equal(code, 1, 'make-lesson stops'); assert.match(err, /other/); assert.equal(existsSync(page), false, 'no page copied');
console.log('check-open-work: ok');
