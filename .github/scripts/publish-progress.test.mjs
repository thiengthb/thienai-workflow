// publish-progress finds the old page links in the repo files and writes publish.json as an update in place.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { linkAfter, trackedRepos, openPrs, claimOut, MARK } from '../../templates/publish-progress.mjs';
import { writePublish } from '../../artifacts/kit/publish.mjs';

const root = new URL('../../', import.meta.url);
const tracked = readFileSync(new URL('life/tracked-repos.md', root), 'utf8');
assert.ok(trackedRepos(tracked).includes('thiengthb/sakubun'), 'reads repo names from the table');
assert.match(linkAfter(tracked, 'Trang tổng quan'), /^https:\/\/claude\.ai\/artifact\/\w+$/, 'overview link must stay findable');
assert.match(linkAfter(readFileSync(new URL('learning/roadmap.md', root), 'utf8'), 'Trang để xem trên điện thoại:'), /^https:\/\/claude\.ai\/artifact\/\w+$/, 'roadmap link must stay findable');
assert.equal(linkAfter(readFileSync(new URL('docs/STATUS.md', root), 'utf8'), 'Trang tiến độ:'), linkAfter(tracked, 'Trang tổng quan'), 'this repo has no page of its own: STATUS points at the overview (merged 2026-11-17)');
assert.equal(linkAfter('a https://claude.ai/artifact/X1 · Trang tiến độ: https://claude.ai/artifact/Y2', 'Trang tiến độ:'), 'https://claude.ai/artifact/Y2', 'the link after the marker, not the first on the line');
assert.equal(linkAfter('nothing', 'Trang'), '');

const out = mkdtempSync(join(tmpdir(), 'pub-'));
writePublish(out, { file_path: join(out, 'index.html'), url: 'https://claude.ai/artifact/Z', capabilities: { db: {} }, icon: 'chart', description: 'd' });
const pub = JSON.parse(readFileSync(join(out, 'publish.json'), 'utf8'));
assert.equal(pub.url, 'https://claude.ai/artifact/Z');
assert.equal(pub.icon, undefined, 'an update keeps the old icon');
assert.equal(pub.files, undefined, 'no empty files map');
// Open PRs: gh first, then the public API; null when neither answers. Only the fields the page needs.
const api = [{ number: 3, title: 't', html_url: 'u', draft: false, base: { ref: 'main', repo: { full_name: 'o/r' } }, head: { ref: 'b', repo: { full_name: 'f/r' } }, created_at: '2026-01-01T00:00:00Z', body: 'x'.repeat(5000) + ' Merge sau #2.', user: {} }];
const gh = await openPrs('o/r', () => ({ status: 0, stdout: JSON.stringify(api) }), () => { throw new Error('no fetch'); });
assert.deepEqual(Object.keys(gh[0]).sort(), ['base', 'baseRepo', 'body', 'created', 'draft', 'head', 'headRepo', 'number', 'title', 'url']);
assert.match(gh[0].body, /Merge sau #2\.$/, 'the whole body is kept: a merge-order line can sit at the end');
assert.deepEqual([gh[0].baseRepo, gh[0].headRepo], ['o/r', 'f/r'], 'which repo each branch lives in');
const pub2 = await openPrs('o/r', () => ({ status: 1 }), async () => ({ ok: true, json: async () => api }));
assert.equal(pub2[0].url, 'u', 'falls back to the public API');
assert.equal(await openPrs('o/r', () => ({ status: null, error: new Error('no gh') }), async () => ({ ok: false })), null);

// --out never deletes or overwrites a folder the command did not make (Codex review 2026-11-17: user files were lost).
const t = mkdtempSync(join(tmpdir(), 'out-'));
const mine = join(t, 'mine');
mkdirSync(join(mine, 'repos', 'sakubun'), { recursive: true });
writeFileSync(join(mine, 'repos', 'sakubun', 'my-notes.txt'), 'việc chưa commit');
writeFileSync(join(mine, 'index.html'), '<p>trang của mình</p>');
assert.match(claimOut(mine, join(t, 'build')), /không phải do lệnh này tạo/, 'a folder with files of its own is refused');
assert.ok(!existsSync(join(mine, MARK)), 'a refused folder is not marked');
const script = fileURLToPath(new URL('templates/publish-progress.mjs', root));
const run = spawnSync(process.execPath, [script, 'overview', '--out', mine], { encoding: 'utf8', timeout: 30000 });
assert.equal(run.status, 1, 'the command stops before cloning anything');
assert.equal(readFileSync(join(mine, 'repos', 'sakubun', 'my-notes.txt'), 'utf8'), 'việc chưa commit', 'user file kept');
assert.equal(readFileSync(join(mine, 'index.html'), 'utf8'), '<p>trang của mình</p>', 'user page kept');
assert.equal(claimOut(join(t, 'new', 'dir'), join(t, 'build')), '', 'a folder that does not exist yet is fine');
assert.ok(existsSync(join(t, 'new', 'dir', MARK)), 'and gets the mark');
assert.equal(claimOut(join(t, 'new', 'dir'), join(t, 'build')), '', 'a marked folder can be reused even with files in it');
mkdirSync(join(t, 'empty'));
assert.equal(claimOut(join(t, 'empty'), join(t, 'build')), '', 'an empty folder is fine');
mkdirSync(join(t, 'build', 'progress-overview'), { recursive: true });
writeFileSync(join(t, 'build', 'progress-overview', 'index.html'), 'old build');
assert.equal(claimOut(join(t, 'build', 'progress-overview'), join(t, 'build')), '', 'the default place under build/ is always the command\'s own, marked or not');
mkdirSync(join(t, 'buildx'));
writeFileSync(join(t, 'buildx', 'f'), '');
assert.match(claimOut(join(t, 'buildx'), join(t, 'build')), /không phải/, 'a sibling whose name starts with build is not under build/');
console.log('publish-progress: ok');
