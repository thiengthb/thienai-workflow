// Tests for .github/scripts/check-links.mjs on a tiny repo made in a temp folder.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { anchors, checkRepo } from './check-links.mjs';

// Anchors: GitHub style, unique even when a suffixed name collides with a real heading.
assert.deepEqual([...anchors('# Setup\n## Setup\n## Setup-1\n## Tiến độ\n```\n# not a heading\n```\n')], ['setup', 'setup-1', 'setup-1-1', 'tiến-độ']);

const d = mkdtempSync(join(tmpdir(), 'links-'));
const w = (f, t) => { mkdirSync(join(d, f, '..'), { recursive: true }); writeFileSync(join(d, f), t); };
w('README.md', '# Tiến độ\n[ok](docs/a.md) [root](/docs/a.md#mục-một) [enc](#ti%E1%BA%BFn-%C4%91%E1%BB%99) `profile/x.md` and `[example](missing.md)`\n');
w('docs/a.md', '## Mục một\n[back](../README.md) [up](/README.md)\r\n');
w('docs/café.md', '# Café\n[home](/README.md)\n');
w('profile/x.md', 'x\n');
execFileSync('git', ['init', '-q'], { cwd: d });
execFileSync('git', ['add', '-A'], { cwd: d });
let r = checkRepo(d);
assert.deepEqual(r.broken, [], 'root links, encoded anchors, CRLF, links shown as code and non-ASCII names are fine');
assert.equal(r.checked, 4, 'docs/café.md is found (git ls-files -z)');

w('docs/b.md', '[x](nope.md) [y](a.md#không-có) `profile/gone.md`\n');
execFileSync('git', ['add', '-A'], { cwd: d });
r = checkRepo(d);
assert.equal(r.broken.length, 3, r.broken.join('\n'));
assert.ok(r.orphans.includes('docs/b.md') && !r.orphans.includes('docs/a.md'), 'files nobody links to are listed');
console.log('check-links: ok');
