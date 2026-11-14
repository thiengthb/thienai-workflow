// Tests for templates/setup-check.mjs, run in CI by .github/workflows/test.yml.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseSetup, checkStandard, checkSetup, instructionsFor, missingLines, checkSync } from '../../templates/setup-check.mjs';

const md = readFileSync(new URL('../../profile/SETUP.md', import.meta.url), 'utf8');
assert.deepEqual(checkStandard(md), [], 'profile/SETUP.md itself must pass (version numbers in step)');
const std = parseSetup(md);
assert.ok(std.version >= 1);
assert.deepEqual(std.projects.sakubun, ['thiengthb/sakubun', 'thiengthb/thienai-workflow']);
assert.deepEqual(std.projects.claude, ['thiengthb/thienai-workflow']);
assert.equal(checkStandard(md.replace(/^Phiên bản chuẩn: \*\*\d+\*\*/m, 'Phiên bản chuẩn: **99**')).length, 1, 'bumping one number only fails');

const good = instructionsFor(std, 'sakubun');
assert.match(good, new RegExp(`^chuẩn setup v${std.version} · project: sakubun`));
const all = { repos: ['thiengthb/sakubun', 'thiengthb/thienai-workflow'], skills: ['anthropic-skills:start-project', 'anthropic-skills:make-slides'] };

let r = checkSetup(std, { project: 'sakubun', instructions: good, ...all }, () => true);
assert.deepEqual(r.fixes, [], 'fully set up project passes');

r = checkSetup(std, { project: 'sakubun', instructions: '', ...all });
assert.equal(r.fixes.length, 1); assert.match(r.fixes[0], /chưa có project instructions/); assert.match(r.fixes[0], /project: sakubun/, 'fix carries the text to paste');

const old = good.replace(`chuẩn setup v${std.version}`, 'chuẩn setup v0');
r = checkSetup(std, { project: 'sakubun', instructions: old, ...all });
assert.match(r.fixes[0], /chuẩn mới là v/, 'older version asks thien to paste the new one');

r = checkSetup(std, { project: 'sakubun', instructions: 'Mình là thien.', ...all });
assert.match(r.fixes[0], /chưa theo chuẩn chung/);

r = checkSetup(std, { project: 'sakubun', instructions: instructionsFor(std, 'Claude'), ...all });
assert.ok(r.fixes.some(f => /project: claude/.test(f)), 'instructions pasted for the wrong project are caught');

r = checkSetup(std, { project: 'sakubun', instructions: good, repos: ['thiengthb/sakubun'], skills: all.skills });
assert.ok(r.fixes.some(f => /chưa gắn repo thiengthb\/thienai-workflow/.test(f)), 'missing repo');

r = checkSetup(std, { project: 'sakubun', instructions: good, ...all }, (repo) => repo !== 'thiengthb/sakubun');
assert.ok(r.fixes.some(f => /chưa cho Claude đọc thiengthb\/sakubun/.test(f)), 'unreadable repo');

r = checkSetup(std, { project: 'sakubun', instructions: good, repos: all.repos, skills: ['anthropic-skills:start-project'] });
assert.ok(r.fixes.some(f => /make-slides/.test(f)), 'missing skill');

r = checkSetup(std, { project: 'tiktok', instructions: instructionsFor(std, 'tiktok'), repos: [], skills: all.skills });
assert.deepEqual(r.fixes, []); assert.ok(r.notes.some(n => /chưa có trong chuẩn/.test(n)), 'unknown project is a question, not a failure');

// Same version number but a line cut off or edited: the version alone must not pass it.
const cut = good.split('\n').filter((l, i) => i !== 2).join('\n');
r = checkSetup(std, { project: 'sakubun', instructions: cut, ...all });
assert.ok(r.fixes.some(f => /thiếu 1 dòng/.test(f)), 'a missing line is caught even when vN matches');
assert.deepEqual(missingLines(std, 'sakubun', good.replace(/\n/g, '\r\n') + '\nDòng riêng của thien.'), [], 'CRLF and extra lines are fine');

// Knowledge sync filters: whole repo synced means heavy folders too; a needed folder left out is noted.
assert.ok(std.sync.includes('profile/') && std.syncOut.length, 'SETUP.md lists what to sync and what to leave out');
assert.ok(checkSync(std, [{ path: '/', mode: 'include' }]).some(n => /phần nặng/.test(n)));
const good2 = [...std.sync.map(p => ({ path: p, mode: 'include' })), ...std.syncOut.map(p => ({ path: p, mode: 'exclude' }))];
assert.deepEqual(checkSync(std, good2), []);
assert.ok(checkSync(std, good2.filter(f => f.path !== 'profile/')).some(n => /chưa đồng bộ: profile\//.test(n)));
assert.deepEqual(checkSync(std, undefined), [], 'no filters given: nothing to say here (main prints "chưa kiểm")');

// CLI: --instructions unseen is "not checked", not "missing".
{
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const cli = fileURLToPath(new URL('../../templates/setup-check.mjs', import.meta.url));
  const out = spawnSync(process.execPath, [cli, '--project', 'sakubun', '--instructions', 'unseen', '--repos', all.repos.join(','), '--skills', all.skills.join(','), '--no-git'], { encoding: 'utf8' });
  assert.equal(out.status, 0, out.stdout + out.stderr);
  assert.match(out.stdout, /chưa kiểm instructions/);
}

console.log('setup-check ok');
