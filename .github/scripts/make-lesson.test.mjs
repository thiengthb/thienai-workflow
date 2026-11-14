// Kiểm make-lesson.mjs: gắn đủ lõi chung và khung, chạy lại không nhân đôi, báo lỗi khi thiếu chỗ gắn hoặc thiếu id.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fill, guessId } from '../../artifacts/lesson/make-lesson.mjs';

const tpl = readFileSync(new URL('../../artifacts/lesson/template.html', import.meta.url), 'utf8');
const page = tpl.replace('"__ID__"', '"frontend-06"');
const once = fill(page);
for (const mark of ['window.Kit', 'window.Lesson', 'lesson-kit:', '.step.on', '--r: 8px']) assert.ok(once.includes(mark), `${mark} gắn vào trang`);
assert.ok(once.includes('<meta name="lesson-id" content="frontend-06">'));
const twice = fill(once);
assert.equal(twice, once, 'chạy lại cho cùng một trang');
assert.equal((twice.match(/window\.Kit = /g) || []).length, 1);
const war = fill(page, 'war-04');
assert.equal(war.match(/lesson-id" content="([^"]+)"/)[1], 'war-04');
assert.equal(JSON.parse(war.match(/id="lesson">([\s\S]*?)<\/script>/)[1]).id, 'war-04', 'id trong cấu hình bài khớp với meta');
assert.throws(() => fill(tpl), /lesson-id/);
assert.throws(() => fill(page.replace('<script id="lesson-js"></script>', '')), /lesson-js/);
assert.equal(guessId('learning/frontend/pages/lesson-6.html'), 'frontend-06');
assert.ok(!/__[A-Z]+__/.test(once.replace(/__TITLE__|__SUBJECT__|__HEADLINE__/g, '')), 'không còn chỗ giữ chỗ nào khác');
// CLI: a missing page is copied from the template; a filled page gets publish.json (check skipped here: no browser in CI).
{
  const { mkdtempSync, existsSync, readFileSync: rd, writeFileSync: wr } = await import('node:fs');
  const { spawnSync } = await import('node:child_process');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  const d = mkdtempSync(join(tmpdir(), 'lesson-cli-'));
  const cli = new URL('../../artifacts/lesson/make-lesson.mjs', import.meta.url).pathname;
  const pagePath = join(d, 'learning/demo/pages/lesson-02.html');
  let r = spawnSync(process.execPath, [cli, pagePath], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /chép mẫu/);
  assert.ok(existsSync(pagePath));
  wr(pagePath, rd(pagePath, 'utf8').replace(/"title": *"__[A-Z]+__"/, '"title": "Buổi thử"'));
  r = spawnSync(process.execPath, [cli, pagePath, '--no-check', '--out', join(d, 'out')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const pub = JSON.parse(rd(join(d, 'out/publish.json'), 'utf8'));
  assert.equal(pub.file_path, pagePath);
  assert.deepEqual(pub.capabilities, { db: {}, comments: {}, sample: {} });
  assert.equal(pub.description, 'Buổi thử');
  assert.match(rd(pagePath, 'utf8'), /<meta name="lesson-id" content="demo-02">/, 'id guessed from the path');
}
// War pages: copied from the war template, with the sandtable parts and the battle data filled in.
{
  const { mkdtempSync, mkdirSync, copyFileSync, readFileSync: rd } = await import('node:fs');
  const { spawnSync } = await import('node:child_process');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  const d = mkdtempSync(join(tmpdir(), 'war-cli-'));
  const cli = new URL('../../artifacts/lesson/make-lesson.mjs', import.meta.url).pathname;
  mkdirSync(join(d, 'learning/war/battles'), { recursive: true });
  copyFileSync(new URL('../../learning/war/battles/dien-bien-phu-1954.json', import.meta.url).pathname, join(d, 'learning/war/battles/dien-bien-phu-1954.json'));
  const pagePath = join(d, 'learning/war/pages/lesson-09.html');
  let r = spawnSync(process.execPath, [cli, pagePath], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(rd(pagePath, 'utf8'), /<div id="board">/, 'war template copied');
  r = spawnSync(process.execPath, [cli, pagePath, '--no-check', '--out', join(d, 'out')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const html = rd(pagePath, 'utf8');
  assert.match(html, /window\.Sandtable = /, 'sandtable.js filled in');
  assert.match(html, /Lesson\.extras\.push/, 'war-lesson.js filled in');
  const battle = JSON.parse(html.match(/<script type="application\/json" id="battle"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.ok(battle.terrain && battle.terrain.h, 'battle data with terrain filled in');
  assert.ok(!battle.units.some((u) => u.raw), 'raw snap points dropped');
}
// Frontend and BA pages: copied from the IT templates (bench, board), with the stage parts filled in.
{
  const { mkdtempSync, readFileSync: rd } = await import('node:fs');
  const { spawnSync } = await import('node:child_process');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  const d = mkdtempSync(join(tmpdir(), 'it-cli-'));
  const cli = new URL('../../artifacts/lesson/make-lesson.mjs', import.meta.url).pathname;
  for (const [subj, mark] of [['frontend', 'class="pane bench"'], ['ba', 'class="pane board"']]) {
    const pagePath = join(d, `learning/${subj}/pages/lesson-07.html`);
    let r = spawnSync(process.execPath, [cli, pagePath], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(rd(pagePath, 'utf8').includes(mark), `${subj} template copied`);
    r = spawnSync(process.execPath, [cli, pagePath, '--no-check', '--out', join(d, 'out-' + subj)], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const html = rd(pagePath, 'utf8');
    assert.match(html, /window\.Stage = /, `it-stage.js filled in (${subj})`);
    assert.match(html, /\.bench \{/, `it.css filled in (${subj})`);
    assert.ok(html.includes(`<meta name="lesson-id" content="${subj}-07">`), `lesson id guessed from path (${subj})`);
  }
}
console.log('make-lesson: ok');
