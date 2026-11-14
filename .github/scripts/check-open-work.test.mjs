// Test for templates/check-open-work.mjs: report wording, and a real run in a temp repo with an unmerged branch.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
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
console.log('check-open-work: ok');
