// Tests for templates/check-review.mjs, run in CI by .github/workflows/test.yml.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkReview } from '../../templates/check-review.mjs';

const ok = '## Vì sao\nabc\n\n## Review\n- Ai: agent mới\n- Đã sửa: không có\n\n## Rủi ro\nthấp';
assert.equal(checkReview(ok), '');
assert.equal(checkReview('## Review\n- Bỏ qua: chỉ sửa STATUS'), '', 'skipping with a reason is allowed');
assert.equal(checkReview('## Review\r\n- Ai: agent mới\r\n'), '', 'Windows line endings');
assert.equal(checkReview('', { draft: true }), '', 'drafts pass');
assert.equal(checkReview(null, { draft: true }), '');
assert.match(checkReview(null), /chưa có mục/);
assert.match(checkReview('## Vì sao\nabc'), /chưa có mục/);
assert.match(checkReview('### Review\nabc'), /chưa có mục/, 'only a level-2 heading counts');
assert.match(checkReview('## Reviewer notes\nabc'), /chưa có mục/, 'heading must be exactly Review');
assert.match(checkReview('## Review\n\n## Rủi ro\nthấp'), /đang trống/);
assert.match(checkReview('## Review\n<!-- điền sau -->\n\n# Khác'), /đang trống/, 'a comment alone is empty');
assert.equal(checkReview('## Review\n### Lượt 1\n- sửa A'), '', 'sub-headings stay inside the section');

// CLI: reads the pull_request event from GITHUB_EVENT_PATH.
const dir = mkdtempSync(join(tmpdir(), 'check-review-'));
const cli = fileURLToPath(new URL('../../templates/check-review.mjs', import.meta.url));
const run = (event) => {
  const p = join(dir, 'event.json'); writeFileSync(p, JSON.stringify(event));
  try { execFileSync('node', [cli], { env: { ...process.env, GITHUB_EVENT_PATH: p }, stdio: 'pipe' }); return 0; }
  catch (e) { return e.status; }
};
assert.equal(run({ pull_request: { number: 1, draft: false, body: ok } }), 0);
assert.equal(run({ pull_request: { number: 1, draft: false, body: 'không có gì' } }), 1);
assert.equal(run({ pull_request: { number: 1, draft: true, body: '' } }), 0);
assert.equal(run({ comment: {} }), 0, 'non-PR events are skipped');
console.log('check-review: ổn');
