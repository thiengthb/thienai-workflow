// Tests for .github/scripts/reading-cost.mjs: the parser reads profile/MAP.md the way the AI is told to read.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMap, measure, BUDGET_KB } from './reading-cost.mjs';

const sample = '## Tầng 1: mọi phiên\n- `AGENTS.md`, chạy `templates/x.mjs`\n\n## Tầng 2: theo việc\n| thien nói hay việc là | Đọc | Chạy | Ghi |\n|---|---|---|---|\n| "học" | `learning/README.md`, `learning/<môn>.md` | `a/b.mjs` | |\n\n## Tầng 3\n- `x/big.md`\n';
const m = parseMap(sample.replace(/\n/g, '\r\n'));
assert.deepEqual(m.tier1, ['AGENTS.md'], 'scripts are run, not read; CRLF is fine');
assert.deepEqual(m.tasks, [{ task: '"học"', files: ['learning/README.md', 'learning/<môn>.md'], alts: [] }], 'tier 3 is not counted');

const root = fileURLToPath(new URL('../../', import.meta.url));
const real = measure(root);
assert.ok(real.tasks.length >= 10, 'every row of the MAP table is measured');
const learn = real.tasks.find((t) => t.task.includes('học') && t.task.startsWith('"'));
const subjects = readdirSync(join(root, 'learning')).filter((d) => statSync(join(root, 'learning', d)).isDirectory() && existsSync(join(root, 'learning', d + '.md')));
assert.ok(subjects.length && learn.files.some((f) => subjects.some((s) => f.path === `learning/${s}.md`) && f.bytes > 0), '<môn> becomes the largest subject file');
const ui = real.tasks.find((t) => t.task.startsWith('Duyệt giao diện'));
assert.equal(ui.files.filter((f) => /artifacts\/(compare|decide)\/README\.md$/.test(f.path)).length, 1, 'one of two alternatives is counted, the larger');
assert.ok(!real.tier1.files.some((f) => f.path.endsWith('.mjs')));
assert.ok(readFileSync(new URL('./reading-cost.mjs', import.meta.url), 'utf8').includes('BUDGET_KB') && BUDGET_KB > 0);
console.log('reading-cost: ok');
