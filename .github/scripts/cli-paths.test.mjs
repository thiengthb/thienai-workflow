// Run each template script from a folder whose path has spaces and Vietnamese letters.
// Before the fix, both scripts exited 0 there without checking or printing anything.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('../../', import.meta.url);
const dir = join(mkdtempSync(join(tmpdir(), 'cli-')), 'thư mục có dấu');
mkdirSync(join(dir, 'docs'), { recursive: true });
for (const f of ['check-status.mjs', 'progress-page.mjs']) copyFileSync(new URL('templates/' + f, root), join(dir, f));
const run = (...args) => spawnSync(process.execPath, args, { cwd: dir, encoding: 'utf8' });

writeFileSync(join(dir, 'docs/STATUS.md'), '# Tiến độ\n\n## Đang ở đâu\n- ổn\n');
let r = run('check-status.mjs', 'docs/STATUS.md');
assert.equal(r.status, 0, r.stderr);
assert.match(r.stdout, /ổn/, 'a passing check must say so, not stay silent');

writeFileSync(join(dir, 'docs/STATUS.md'), Array.from({ length: 41 }, (_, i) => `dòng ${i}`).join('\n'));
r = run('check-status.mjs', 'docs/STATUS.md');
assert.equal(r.status, 1, 'a too-long STATUS must fail');
assert.match(r.stderr, /docs\/STATUS\.md/);

r = run('progress-page.mjs', '--title', 'T', '.=o/r');
assert.equal(r.status, 0, r.stderr);
assert.match(r.stdout, /^<!DOCTYPE html>/, 'progress page must print HTML');

rmSync(join(dir, '..'), { recursive: true, force: true });
console.log('ok cli paths');
