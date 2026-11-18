// Run: node .github/scripts/sync-agents-md.test.mjs
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { mergeAgents, parseTrackedRepos, syncRepo } from './sync-agents-md.mjs';

const root = new URL('../../', import.meta.url);
const template = readFileSync(new URL('templates/AGENTS.template.md', root), 'utf8');

// An old copy with a filled-in project part: shared part updates, project part stays.
const oldCopy = '# AGENTS.md\n\nLuật cũ.\n\n---\n\n## Phần riêng của project\n- Chạy `npm test` trước khi push.\n';
const merged = mergeAgents(template, oldCopy);
assert.ok(merged.startsWith(template.slice(0, template.indexOf('## Phần riêng của project'))));
assert.ok(merged.endsWith('## Phần riêng của project\n- Chạy `npm test` trước khi push.\n'));
assert.ok(!merged.includes('Luật cũ.'));

// Already in sync: no change.
assert.strictEqual(mergeAgents(template, merged), merged);

// No marker: refuse instead of guessing.
assert.strictEqual(mergeAgents(template, '# AGENTS.md\nToàn luật riêng.\n'), null);

const repos = parseTrackedRepos(readFileSync(new URL('life/tracked-repos.md', root), 'utf8'));
assert.ok(repos.length > 0);

// GitHub API error paths, with fetch replaced by a fake that answers by "METHOD path".
const current = '# AGENTS.md\n\nLuật cũ.\n\n## Phần riêng của project\n- riêng\n';
const ok = {
  'GET /repos/o/r': [200, { default_branch: 'main' }],
  'GET /repos/o/r/contents/AGENTS.md?ref=main': [200, { content: Buffer.from(current).toString('base64'), sha: 'f1' }],
  'GET /repos/o/r/git/ref/heads/main': [200, { object: { sha: 'c1' } }],
  'POST /repos/o/r/git/refs': [201, {}],
  'PATCH /repos/o/r/git/refs/heads/chore/sync-agents-md': [200, {}],
  'PUT /repos/o/r/contents/AGENTS.md': [201, {}],
  'GET /repos/o/r/pulls?state=open&head=o:chore/sync-agents-md': [200, []],
  'POST /repos/o/r/pulls': [201, { html_url: 'https://pr' }],
};
let prBody = '';
const sync = async (overrides) => {
  const answers = { ...ok, ...overrides };
  globalThis.fetch = async (url, init) => {
    const key = `${init.method} ${url.replace('https://api.github.com', '')}`;
    if (key === 'POST /repos/o/r/pulls') prBody = JSON.parse(init.body).body;
    if (!answers[key]) throw new Error('unexpected call ' + key);
    const [status, body] = answers[key];
    return { status, json: async () => body };
  };
  return syncRepo('t', 'o/r', template, 'abcdef0', false);
};
assert.match(await sync({}), /^đã mở PR/);
// The sync branch is reset on every run, so the PR says nobody should push to it (Codex review 17/11).
assert.match(prBody, /Nhánh `chore\/sync-agents-md` do Action quản lý: đừng đẩy commit lên đó/);
for (const status of [403, 404, 500]) {
  const r = await sync({ 'GET /repos/o/r': [status, null] });
  assert.match(r, /^lỗi: không đọc được repo/, `HTTP ${status} on the repo must fail, not skip`);
}
assert.match(await sync({ 'GET /repos/o/r/contents/AGENTS.md?ref=main': [404, null] }), /^bỏ qua/, 'a repo without AGENTS.md is skipped');
assert.match(await sync({ 'POST /repos/o/r/git/refs': [422, null], 'PATCH /repos/o/r/git/refs/heads/chore/sync-agents-md': [403, null] }), /^lỗi: không đặt lại được nhánh/);
assert.match(await sync({ 'POST /repos/o/r/git/refs': [422, null] }), /^đã mở PR/, 'existing branch is reset, then the PR is opened');
assert.match(await sync({ 'GET /repos/o/r/pulls?state=open&head=o:chore/sync-agents-md': [200, [{ html_url: 'https://old' }]] }), /^đã cập nhật PR có sẵn/);
assert.match(await sync({ 'POST /repos/o/r/pulls': [422, null] }), /^lỗi: không mở được PR/);

console.log('ok', repos.length, 'repos');
