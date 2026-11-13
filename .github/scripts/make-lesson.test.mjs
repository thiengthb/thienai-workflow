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
console.log('make-lesson: ok');
