// Tests for templates/handoff.mjs, run in CI by .github/workflows/test.yml.
// Uses a local bare repo as the remote, so nothing touches GitHub.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { skeleton, checkTask, summarize, section } from '../../templates/handoff.mjs';

const fresh = skeleton('thiengthb/sakubun', 'review-page', 'Trang ôn thẻ', new Date('2026-11-14T10:00:00Z'));
assert.ok(checkTask(fresh).some(p => p.includes('Bước tiếp theo')), 'an unfilled skeleton must fail on the next step');
const filled = fresh.replace('1. <cụ thể tới mức nick khác làm được ngay: lệnh nào, file nào>', '1. Chạy `node x.mjs` rồi đăng lại trang');
assert.deepEqual(checkTask(filled, 'sakubun--review-page.md'), [], 'a filled skeleton passes');
assert.equal(checkTask(filled, 'Sakubun Review.md').length, 1, 'bad file name fails');
assert.ok(checkTask(filled.replace('## Đang chờ thien\n', '')).length >= 1, 'missing section fails');
assert.equal(section(filled, '## Đang chờ thien').startsWith('Không.'), true);

const s = summarize('sakubun--review-page.md', filled);
assert.equal(s.title, 'Trang ôn thẻ');
assert.equal(s.repo, 'thiengthb/sakubun');
assert.equal(s.updated, '2026-11-14T10:00Z');
assert.equal(s.next, 'Chạy `node x.mjs` rồi đăng lại trang');
assert.equal(s.waiting, '', '"Không." means nothing waiting');
const waiting = filled.replace('## Đang chờ thien\nKhông.', '## Đang chờ thien\n- Trang: https://claude.ai/artifact/x · Hỏi gì: chọn A hay B');
assert.match(summarize('a--b.md', waiting).waiting, /chọn A hay B/);

// End to end against a bare repo: first save creates the branch, a second account saves too, list, done.
const root = mkdtempSync(join(tmpdir(), 'handoff-test-'));
const bare = join(root, 'remote.git');
spawnSync('git', ['init', '-q', '--bare', bare]);
const cli = fileURLToPath(new URL('../../templates/handoff.mjs', import.meta.url));
const run = (...a) => spawnSync('node', [cli, ...a, '--remote', bare], { encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } });
const f1 = join(root, 'sakubun--review-page.md'); writeFileSync(f1, waiting);
const f2 = join(root, 'thienai-workflow--handoff.md'); writeFileSync(f2, filled.replace('Trang ôn thẻ', 'Sổ bàn giao').replace('10:00Z', '11:00Z').replace('2026-11-14T10:00', '2026-11-14T11:00'));
let r = run('save', f1); assert.equal(r.status, 0, r.stderr);
r = run('save', f2); assert.equal(r.status, 0, r.stderr);
r = run('list'); assert.equal(r.status, 0, r.stderr);
assert.ok(r.stdout.indexOf('Sổ bàn giao') < r.stdout.indexOf('Trang ôn thẻ'), 'newest first');
assert.match(r.stdout, /Đang chờ thien: - Trang: https:\/\/claude.ai\/artifact\/x/);
r = run('show', 'sakubun--review-page'); assert.equal(r.stdout, waiting);
r = run('done', 'sakubun--review-page'); assert.equal(r.status, 0, r.stderr);
r = run('list'); assert.ok(!r.stdout.includes('Trang ôn thẻ') && r.stdout.includes('Sổ bàn giao'));
r = run('save', join(root, 'nope.md')); assert.notEqual(r.status, 0, 'missing file fails');
const bad = join(root, 'x--y.md'); writeFileSync(bad, fresh); r = run('save', bad);
assert.notEqual(r.status, 0, 'unfilled file is not pushed'); assert.match(r.stderr, /Bước tiếp theo/);
console.log('handoff ok');
