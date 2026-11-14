// Tests for templates/handoff.mjs, run in CI by .github/workflows/test.yml.
// Uses a local bare repo as the remote, so nothing touches GitHub.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { skeleton, checkTask, summarize, section } from '../../templates/handoff.mjs';

const fresh = skeleton('thiengthb/sakubun', 'review-page', 'Trang ôn thẻ', new Date('2026-11-14T10:00:00Z'));
assert.ok(checkTask(fresh).some(p => p.includes('Bước tiếp theo')), 'an unfilled skeleton must fail on the next step');
const filled = fresh.replace('1. <cụ thể tới mức nick khác làm được ngay: lệnh nào, file nào>', '1. Chạy `node x.mjs` rồi đăng lại trang');
assert.deepEqual(checkTask(filled, 'review-page.md'), [], 'a filled skeleton passes');
assert.equal(checkTask(filled, 'Review Page.md').length, 1, 'bad file name fails');
assert.ok(checkTask(filled.replace('## Đang chờ thien\n', '')).length >= 1, 'missing section fails');
assert.equal(section(filled, '## Đang chờ thien').startsWith('Không.'), true);

const s = summarize('review-page.md', filled);
assert.equal(s.title, 'Trang ôn thẻ');
assert.equal(s.repo, 'thiengthb/sakubun');
assert.equal(s.updated, '2026-11-14T10:00Z');
assert.equal(s.next, 'Chạy `node x.mjs` rồi đăng lại trang');
assert.equal(s.waiting, '', '"Không." means nothing waiting');
const waiting = filled.replace('## Đang chờ thien\nKhông.', '## Đang chờ thien\n- Trang: https://claude.ai/artifact/x · Hỏi gì: chọn A hay B');
assert.match(summarize('a--b.md', waiting).waiting, /chọn A hay B/);

assert.ok(checkTask(filled.replace('Repo: thiengthb/sakubun', 'Repo: sakubun')).length >= 1, 'Repo line needs owner/repo');

// End to end with two local bare repos standing in for sakubun and thienai-workflow: each repo keeps its own book.
const root = mkdtempSync(join(tmpdir(), 'handoff-test-'));
const saku = join(root, 'sakubun.git'), flow = join(root, 'flow.git');
for (const b of [saku, flow]) spawnSync('git', ['init', '-q', '--bare', b]);
const cli = fileURLToPath(new URL('../../templates/handoff.mjs', import.meta.url));
const env = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const run = (...a) => spawnSync('node', [cli, ...a], { encoding: 'utf8', env });
const f1 = join(root, 'review-page.md'); writeFileSync(f1, waiting);
const f2 = join(root, 'account-handoff.md');
writeFileSync(f2, filled.replace('Trang ôn thẻ', 'Sổ bàn giao').replace('thiengthb/sakubun', 'thiengthb/thienai-workflow').replace('2026-11-14T10:00', '2026-11-14T11:00'));
let r = run('save', f1, '--remote', saku); assert.equal(r.status, 0, r.stderr);
r = run('save', f2, '--remote', flow); assert.equal(r.status, 0, r.stderr);
r = run('list', '--remotes', `${saku},${flow},${join(root, 'missing.git')}`); assert.equal(r.status, 0, r.stderr);
assert.ok(r.stdout.indexOf('Sổ bàn giao') >= 0 && r.stdout.indexOf('Sổ bàn giao') < r.stdout.indexOf('Trang ôn thẻ'), 'both repos, newest first');
assert.match(r.stdout, /Đang chờ thien: - Trang: https:\/\/claude.ai\/artifact\/x/);
assert.match(r.stdout, /Không đọc được: .*missing\.git/, 'unreadable repo is reported, not silently skipped');
r = run('list', '--remotes', flow); assert.ok(!r.stdout.includes('Trang ôn thẻ'), 'sakubun task is not in the thienai-workflow book');
r = run('show', 'thiengthb/sakubun', 'review-page', '--remote', saku); assert.equal(r.stdout, waiting);
r = run('done', 'thiengthb/sakubun', 'review-page', '--remote', saku); assert.equal(r.status, 0, r.stderr);
r = run('list', '--remotes', `${saku},${flow}`); assert.ok(!r.stdout.includes('Trang ôn thẻ') && r.stdout.includes('Sổ bàn giao'));
assert.ok(!r.stdout.includes('Không đọc được'), 'a book emptied by done is empty, not unreadable');
const nobook = join(root, 'nobook.git'); spawnSync('git', ['init', '-q', '--bare', nobook]);
r = run('list', '--remotes', nobook); assert.match(r.stdout, /Không có việc dở/); assert.ok(!r.stdout.includes('Không đọc được'), 'a repo without a book is not unreadable');

// Two accounts edit the same task at once: the second save must stop with an error, not claim it pushed.
const { checkout, commitPush } = await import('../../templates/handoff.mjs');
Object.assign(process.env, { GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' });
const dA = checkout(flow), dB = checkout(flow);
writeFileSync(join(dA, 'tasks', 'account-handoff.md'), 'A\n'); assert.equal(commitPush(dA, 'a'), 'đã đẩy');
writeFileSync(join(dB, 'tasks', 'account-handoff.md'), 'B\n');
assert.throws(() => commitPush(dB, 'b'), /nick khác vừa sửa cùng việc/);
const dC = checkout(flow); assert.equal(readFileSync(join(dC, 'tasks', 'account-handoff.md'), 'utf8'), 'A\n', 'remote keeps the first edit');
// Two accounts edit different tasks at once: the second save rebases and pushes.
writeFileSync(join(dC, 'tasks', 'other.md'), 'C\n'); const dD = checkout(flow);
writeFileSync(join(dD, 'tasks', 'third.md'), 'D\n');
assert.equal(commitPush(dC, 'c'), 'đã đẩy'); assert.equal(commitPush(dD, 'd'), 'đã đẩy');
const dE = checkout(flow); assert.ok(existsSync(join(dE, 'tasks', 'other.md')) && existsSync(join(dE, 'tasks', 'third.md')));
r = run('save', join(root, 'nope.md')); assert.notEqual(r.status, 0, 'missing file fails');
const bad = join(root, 'x.md'); writeFileSync(bad, fresh); r = run('save', bad, '--remote', saku);
assert.notEqual(r.status, 0, 'unfilled file is not pushed'); assert.match(r.stderr, /Bước tiếp theo/);
for (const d of [root, dA, dB, dC, dD, dE]) rmSync(d, { recursive: true, force: true });
console.log('handoff ok');
