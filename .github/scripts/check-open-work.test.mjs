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
assert.equal(off.stale, true); assert.match(report(off, ['learning/ba/']), /chưa biết chắc/);
// Clone nông: main đã đi tiếp sau chỗ nhánh "other" tách ra, nên không có merge base. Phải báo chưa chắc, không ném lỗi.
g(work, 'checkout', '-q', 'main'); writeFileSync(join(work, 'b.md'), 'b'); g(work, 'add', '.'); g(work, 'commit', '-qm', 'more'); g(work, 'push', '-q', 'origin', 'HEAD:main');
const shallow = join(d, 'shallow');
execFileSync('git', ['clone', '-q', '--depth=1', '--branch', 'main', 'file://' + origin, shallow], { stdio: 'ignore' });
const sh = openWork({ paths: ['learning/war/'], cwd: shallow });
assert.equal(sh.stale, true, 'shallow clone without merge base is reported as unsure');
// Repo có nhánh chính tên master: tự nhận ra, không ném lỗi; nhánh chính sai tên thì báo chưa chắc.
const om = join(d, 'origin-master.git'), wm = join(d, 'work-master');
execFileSync('git', ['init', '-q', '--bare', '-b', 'master', om]);
execFileSync('git', ['clone', '-q', om, wm], { stdio: 'ignore' });
for (const [k, v] of [['user.email', 't@t'], ['user.name', 't']]) g(wm, 'config', k, v);
writeFileSync(join(wm, 'a.md'), 'a'); g(wm, 'add', '.'); g(wm, 'commit', '-qm', 'init'); g(wm, 'push', '-q', 'origin', 'HEAD:master');
g(wm, 'checkout', '-qb', 'feat'); writeFileSync(join(wm, 'f.md'), 'f'); g(wm, 'add', '.'); g(wm, 'commit', '-qm', 'feat'); g(wm, 'push', '-q', 'origin', 'feat');
g(wm, 'checkout', '-q', '--orphan', 'handoff'); writeFileSync(join(wm, 'h.md'), 'h'); g(wm, 'add', 'h.md'); g(wm, 'commit', '-qm', 'note'); g(wm, 'push', '-q', 'origin', 'handoff');
g(wm, 'checkout', '-qf', 'master');
const ms = openWork({ cwd: wm });
assert.equal(ms.base, 'master'); assert.deepEqual(ms.map((w) => w.branch), ['feat'], 'master repo: finds the unmerged branch, skips the handoff branch');
const wrong = openWork({ cwd: wm, base: 'develop', fetch: false });
assert.equal(wrong.stale, true); assert.match(report(wrong), /--base/, 'missing base is reported, not thrown');
// make-lesson: trang mới trong thư mục chưa có (learning/war/pages/) vẫn bị chặn khi nhánh khác đã sửa môn đó.
const fresh = join(d, 'fresh'); execFileSync('git', ['clone', '-q', origin, fresh], { stdio: 'ignore' }); mkdirSync(join(fresh, 'learning'));
const page = join(fresh, 'learning/war/pages/new.html'), mk = fileURLToPath(new URL('../../artifacts/lesson/make-lesson.mjs', import.meta.url));
let code = 0, err = '';
try { execFileSync('node', [mk, page], { cwd: fresh, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { code = e.status; err = e.stderr; }
assert.equal(code, 1, 'make-lesson stops'); assert.match(err, /other/); assert.equal(existsSync(page), false, 'no page copied');
console.log('check-open-work: ok');
