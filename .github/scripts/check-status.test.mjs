// Tests for templates/check-status.mjs, run in CI by .github/workflows/test.yml.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkStatus } from '../../templates/check-status.mjs';

const template = readFileSync(new URL('../../templates/STATUS.template.md', import.meta.url), 'utf8');
assert.deepEqual(checkStatus(template), [], 'template itself must pass');

const tooLong = Array.from({ length: 41 }, (_, i) => `line ${i}`).join('\n');
assert.equal(checkStatus(tooLong).length, 1, '41 lines must fail');

const waiting = (n) => `# Tiến độ\n\n## Đang chờ thien\n${Array.from({ length: n }, (_, i) => `- việc ${i}\n  chi tiết`).join('\n')}\n\n## Đang vướng\n- a\n- b\n`;
assert.deepEqual(checkStatus(waiting(3)), [], '3 waiting items pass; sub-lines and other sections not counted');
assert.equal(checkStatus(waiting(4)).length, 1, '4 waiting items must fail');

console.log('ok check-status');
