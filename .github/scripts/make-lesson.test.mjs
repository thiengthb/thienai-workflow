// Kiểm make-lesson.mjs: gắn đủ lõi chung và khung, chạy lại không nhân đôi, báo lỗi khi thiếu chỗ gắn hoặc thiếu id.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fill as fill0, guessId, strip, filledIn, SAMPLE_CARDS } from '../../artifacts/lesson/make-lesson.mjs';
// Mẫu có bước ôn tự sinh: mọi lần dựng trong file này đưa thẻ mẫu (phần riêng về bước ôn ở cuối file).
const fill = (h, id, file, o = {}) => fill0(h, id, file, { cards: SAMPLE_CARDS, ...o });
import { fileURLToPath } from 'node:url';

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
// Nguồn và bản dựng: strip bỏ đúng những gì fill thêm, chạy lại không đổi, dựng lại ra đúng bản cũ.
{
  const built = fill(page, 'frontend-06', '', { stuck: ['một chỗ vướng'] });
  const src = strip(built);
  assert.deepEqual(filledIn(built).sort(), ['cards', 'kit-css', 'kit-js', 'lesson-css', 'lesson-js', 'lesson-kit'], 'bản dựng mang kit và thẻ ôn');
  assert.deepEqual(filledIn(src), [], 'nguồn không mang kit');
  assert.ok(!src.includes('window.Kit') && !src.includes('lesson-id" content') && !src.includes('một chỗ vướng'), 'kit, meta và chỗ vướng là thứ sinh ra');
  assert.equal(strip(src), src, 'strip chạy lại không đổi');
  assert.equal(fill(src, 'frontend-06', '', { stuck: ['một chỗ vướng'] }), built, 'dựng lại từ nguồn ra đúng bản cũ');
  assert.equal(JSON.parse(src.match(/id="lesson">([\s\S]*?)<\/script>/)[1]).id, 'frontend-06', 'id bài ở lại trong nguồn');
  const old = '<style id="lesson-kit-css">a{}</style><script id="lesson-kit">var x=1</script>';
  assert.equal(strip(old), old, 'trang khung cũ giữ nguyên'); assert.deepEqual(filledIn(old), []);
}
// Repo nhỏ cho CLI: bảng môn, một thẻ đến hạn ngày 2026-11-17 kèm câu trắc nghiệm (bước ôn tự sinh cần cả hai).
const seed = async (d, subj = 'demo', quiz = true) => {
  const { mkdirSync, writeFileSync: wr } = await import('node:fs');
  const { join } = await import('node:path');
  mkdirSync(join(d, 'learning'), { recursive: true });
  wr(join(d, 'learning/README.md'), `| Môn | Vai | File môn | Trạng thái |\n|---|---|---|---|\n| Demo | Môn chính | [${subj}.md](${subj}.md) | 1 buổi |\n`);
  wr(join(d, 'learning/cards.md'), '| Thẻ | Môn | Câu hỏi | Đáp án ở | Hộp | Hỏi lại |\n|---|---|---|---|---|---|\n| D1 | Demo | Câu <ôn> một? | [bài 1](x.md) | 1 | 2026-11-16 |\n| D2 | Demo | Câu chưa tới hạn? | [bài 1](x.md) | 2 | 2026-12-01 |\n');
  wr(join(d, 'learning/cards-quiz.json'), JSON.stringify(quiz ? { D1: { opts: ['Đúng', 'Sai'], a: 0, why: 'Vì <vậy>.' }, D2: { opts: ['A', 'B'], a: 1, why: 'B.' } } : {}));
};
const TODAY = ['--today', '2026-11-17'];
// CLI: a missing page is copied from the template; a filled page gets publish.json (check skipped here: no browser in CI).
{
  const { mkdtempSync, existsSync, readFileSync: rd, writeFileSync: wr } = await import('node:fs');
  const { spawnSync } = await import('node:child_process');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  const d = mkdtempSync(join(tmpdir(), 'lesson-cli-'));
  await seed(d);
  const cli = fileURLToPath(new URL('../../artifacts/lesson/make-lesson.mjs', import.meta.url));
  const pagePath = join(d, 'learning/demo/pages/lesson-02.html');
  let r = spawnSync(process.execPath, [cli, pagePath], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /chép mẫu/);
  assert.ok(existsSync(pagePath));
  wr(pagePath, rd(pagePath, 'utf8').replace(/"title": *"__[A-Z]+__"/, '"title": "Buổi thử"'));
  r = spawnSync(process.execPath, [cli, pagePath, '--no-check', '--out', join(d, 'out'), ...TODAY], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const pub = JSON.parse(rd(join(d, 'out/publish.json'), 'utf8'));
  assert.equal(pub.file_path, join(d, 'out/lesson-02.html'), 'đăng bản dựng, không đăng nguồn');
  assert.deepEqual(filledIn(rd(pagePath, 'utf8')), [], 'nguồn trong repo vẫn gọn');
  assert.match(rd(pub.file_path, 'utf8'), /window\.Kit = /, 'bản dựng có kit');
  assert.deepEqual(pub.capabilities, { db: {}, comments: {}, sample: {}, dictation: {}, tts: {} });
  assert.equal(pub.description, 'Buổi thử');
  assert.match(rd(pub.file_path, 'utf8'), /<meta name="lesson-id" content="demo-02">/, 'id guessed from the path');
  // Nguồn cũ còn kit đã điền (bài trước 2026-11-15): chạy lại thì nguồn tự gọn.
  wr(pagePath, fill(rd(pagePath, 'utf8'), 'demo-02', pagePath));
  r = spawnSync(process.execPath, [cli, pagePath, '--no-check', '--out', join(d, 'out'), ...TODAY], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /làm gọn nguồn/);
  assert.deepEqual(filledIn(rd(pagePath, 'utf8')), []);
}
// War pages: copied from the war template, with the sandtable parts and the battle data filled in.
{
  const { mkdtempSync, mkdirSync, copyFileSync, readFileSync: rd } = await import('node:fs');
  const { spawnSync } = await import('node:child_process');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  const d = mkdtempSync(join(tmpdir(), 'war-cli-'));
  await seed(d, 'war');
  const cli = fileURLToPath(new URL('../../artifacts/lesson/make-lesson.mjs', import.meta.url));
  mkdirSync(join(d, 'learning/war/battles'), { recursive: true });
  copyFileSync(fileURLToPath(new URL('../../learning/war/battles/dien-bien-phu-1954.json', import.meta.url)), join(d, 'learning/war/battles/dien-bien-phu-1954.json'));
  const pagePath = join(d, 'learning/war/pages/lesson-09.html');
  let r = spawnSync(process.execPath, [cli, pagePath], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(rd(pagePath, 'utf8'), /<div id="board">/, 'war template copied');
  r = spawnSync(process.execPath, [cli, pagePath, '--no-check', '--out', join(d, 'out'), ...TODAY], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const html = rd(join(d, 'out/lesson-09.html'), 'utf8');
  assert.ok(!rd(pagePath, 'utf8').includes('"terrain"'), 'dữ liệu trận không chép vào nguồn lần hai');
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
  await seed(d);
  const cli = fileURLToPath(new URL('../../artifacts/lesson/make-lesson.mjs', import.meta.url));
  for (const [subj, mark] of [['frontend', 'class="pane bench"'], ['ba', 'class="pane board"']]) {
    const pagePath = join(d, `learning/${subj}/pages/lesson-07.html`);
    let r = spawnSync(process.execPath, [cli, pagePath], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(rd(pagePath, 'utf8').includes(mark), `${subj} template copied`);
    r = spawnSync(process.execPath, [cli, pagePath, '--no-check', '--out', join(d, 'out-' + subj), ...TODAY], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const html = rd(join(d, 'out-' + subj, 'lesson-07.html'), 'utf8');
    assert.match(html, /window\.Stage = /, `it-stage.js filled in (${subj})`);
    assert.match(html, /\.bench \{/, `it.css filled in (${subj})`);
    assert.ok(html.includes(`<meta name="lesson-id" content="${subj}-07">`), `lesson id guessed from path (${subj})`);
  }
}
// Bước ôn tự sinh (kế hoạch lean-learning, checkpoint 3): câu trắc nghiệm hợp lệ, ghép thẻ, dựng và gỡ ra đúng.
{
  const { validQuiz, quizCards, reviewStep, missingQuizText, hasAutoReview } = await import('../../artifacts/lesson/make-lesson.mjs');
  assert.ok(validQuiz({ opts: ['a', 'b'], a: 1, why: 'w' }));
  for (const bad of [null, { opts: ['a'], a: 0, why: 'w' }, { opts: ['a', 'b'], a: 2, why: 'w' }, { opts: ['a', ' '], a: 0, why: 'w' }, { opts: ['a', 'b'], a: 0, why: '' }, { opts: ['a', 'b'], a: '0', why: 'w' }])
    assert.equal(validQuiz(bad), false, JSON.stringify(bad));
  const q = quizCards([{ id: 'X1', question: 'q1' }, { id: 'X2', question: 'q2' }], { X1: { opts: ['a', 'b'], a: 0, why: 'w' }, X2: { opts: ['a'], a: 0, why: 'w' } });
  assert.deepEqual(q.cards.map((c) => c.id), ['X1']);
  assert.deepEqual(q.missing.map((c) => c.id), ['X2'], 'câu hỏng tính như chưa có');
  assert.match(missingQuizText(q.missing), /X2[\s\S]*"X2": \{"opts"[\s\S]*q2/);
  const step = reviewStep([{ id: 'X1', question: 'Câu <b>?', opts: ['a & b', 'c'], a: 1, why: 'Vì "x"' }], 2);
  assert.match(step, /data-q="X1" data-a="1" data-kind="review"/);
  assert.match(step, /Câu &lt;b&gt;\?/, 'chữ trong thẻ được thoát');
  assert.match(step, /a &amp; b/);
  assert.match(step, /data-go="2" data-need="X1" data-review-gate disabled/);
  const none = reviewStep([], 2);
  assert.match(none, /không có thẻ nào/);
  assert.match(none, /data-go="2">Tiếp/, 'không có thẻ thì nút Tiếp mở sẵn');
  assert.ok(hasAutoReview(tpl), 'mẫu có bước ôn tự sinh');
  assert.throws(() => fill0(page, 'frontend-06'), /bước ôn tự sinh/, 'dựng mà không có thẻ thì báo lỗi');
  const built = fill(page, 'frontend-06');
  assert.match(built, /data-q="F8"[\s\S]*data-q="B2"[\s\S]*data-q="W8"/);
  assert.match(strip(built), /data-auto="cards">\n {4}<!-- Ôn 3 thẻ[^\n]*-->\n {2}<\/section>/, 'nguồn chỉ giữ lời dặn');
  assert.equal(strip(strip(built)), strip(built));
  // CLI: thẻ đến hạn chưa có câu thì dừng và in dòng cần thêm; có câu thì bản dựng có đúng thẻ đó, không có thẻ chưa tới hạn.
  const { mkdtempSync, readFileSync: rd, writeFileSync: wr } = await import('node:fs');
  const { spawnSync } = await import('node:child_process');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  const d = mkdtempSync(join(tmpdir(), 'quiz-cli-'));
  await seed(d, 'demo', false);
  const cli = fileURLToPath(new URL('../../artifacts/lesson/make-lesson.mjs', import.meta.url));
  const pagePath = join(d, 'learning/demo/pages/lesson-03.html');
  spawnSync(process.execPath, [cli, pagePath], { encoding: 'utf8' });
  let r = spawnSync(process.execPath, [cli, pagePath, '--no-check', '--out', join(d, 'out'), ...TODAY], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /chưa có câu trắc nghiệm[^\n]*D1/);
  wr(join(d, 'learning/cards-quiz.json'), '{ broken');
  r = spawnSync(process.execPath, [cli, pagePath, '--no-check', '--out', join(d, 'out'), ...TODAY], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /không phải JSON hợp lệ/);
  await seed(d);
  r = spawnSync(process.execPath, [cli, pagePath, '--no-check', '--out', join(d, 'out'), ...TODAY], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Bước ôn: D1 /);
  const html = rd(join(d, 'out/lesson-03.html'), 'utf8');
  assert.match(html, /Câu &lt;ôn&gt; một\?/);
  assert.ok(!html.includes('data-q="D2"'), 'thẻ chưa tới hạn không vào bước ôn (cùng môn, không làm thẻ bù)');
  assert.deepEqual(filledIn(rd(pagePath, 'utf8')), [], 'nguồn không mang thẻ');
}
console.log('make-lesson: ok');
