// Reads plan files into page data, reports where a file strays from templates/PLAN.template.md, and builds a page.
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { parsePlanFile, sessions, metaLine, lastDate, linkify } from '../../artifacts/plan/parse-plan.mjs';
import { build } from '../../artifacts/plan/make-plan.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = join(root, 'artifacts/plan/fixture.md');

assert.equal(sessions('2 phiên'), 2);
assert.equal(sessions('1–2 phiên'), 1.5);
assert.equal(sessions('1,5 phiên'), 1.5);
assert.ok(Number.isNaN(sessions('vài phiên')));
assert.deepEqual(metaLine('Trạng thái: đang chạy · Duyệt: 2026-11-18 · nick tnt697').fields, { 'Trạng thái': 'đang chạy', 'Duyệt': '2026-11-18' });
assert.deepEqual(metaLine('Trạng thái: xong · nick tnt697').free, ['nick tnt697']);
assert.equal(lastDate('xong 2026-11-19, xem lại 2026-12-01', '2026-11-20'), '2026-11-19', 'future dates are not done dates');
assert.equal(linkify('trang https://claude.ai/artifact/Uecy4Cdp3CsVFrY8omJGst (nick x).'), 'trang [claude.ai/artifact/Uecy4…](https://claude.ai/artifact/Uecy4Cdp3CsVFrY8omJGst) (nick x).');
assert.equal(linkify('[a](https://x.y/z)'), '[a](https://x.y/z)', 'markdown links stay');

// The fixture: every part the page draws.
{
  const { plan, issues } = parsePlanFile(readFileSync(fixture, 'utf8'), { today: '2026-11-21' });
  assert.deepEqual(issues, []);
  assert.equal(plan.state, 'chờ duyệt');
  assert.equal(plan.nick, 'tnt697');
  assert.deepEqual(plan.checkpoints.map((c) => [c.num, c.state, c.estimate, c.gate]), [['1', 'now', 1, ''], ['2', 'todo', 1.5, ''], ['3', 'todo', null, '2026-12-01']]);
  assert.deepEqual(plan.ticks, { done: 1, total: 5 });
  assert.equal(plan.checkpoints[0].doneDate, '2026-11-20');
  assert.deepEqual(plan.where.map((w) => [w.key, w.ask]), [['Đang ở', false], ['Còn thiếu', false], ['thien cần làm', true]]);
  assert.deepEqual(plan.options.map((o) => [o.key, o.chosen]), [['A', false], ['B', true]]);
  assert.equal(plan.options[1].rows[0].label, 'Chỗ yếu', 'the chosen option shows its weak point, not "why not chosen"');
  assert.equal(plan.answered, false);
  const [q1, q2] = plan.questions;
  assert.deepEqual(q1.options.map((o) => [o.text, !!o.rec]), [['Đồng ý: có', true], ['Không, mình ghi ở ô dưới', false]]);
  assert.match(q1.options[0].why, /nhỏ, xong trong một phiên/);
  assert.deepEqual(q2.options.map((o) => !!o.rec), [true, false]);
}

// Deviations are reported with line numbers; only a missing title or checkpoint blocks the build.
{
  const md = ['# T', '', 'Trạng thái: gần xong', '', '## Mục tiêu', 'x', '', '## Checkpoint', '', '### Một', '- [ ] a', '', '### 2. Hai', 'Xong khi: y', 'Ước: vài phiên', 'chữ thường', '- [ ] b', '', '## Câu hỏi', '1. Có làm không?'].join('\n');
  const { issues } = parsePlanFile(md);
  const has = (level, re) => assert.ok(issues.some((i) => i.level === level && re.test(i.msg)), `${level}: ${re}`);
  has('lệch', /trạng thái "gần xong"/);
  has('lệch', /thiếu mục "## Đang ở đâu"/);
  has('lệch', /không bắt đầu bằng số thứ tự/);
  has('lệch', /"Một" thiếu dòng "Xong khi/);
  has('lệch', /dòng "Ước:" cần số phiên/);
  has('ghi chú', /1 dòng chữ thường/);
  has('lệch', /câu hỏi 1 không có "Đề xuất/);
  assert.equal(issues.find((i) => /Ước/.test(i.msg)).line, 15);
  assert.ok(!issues.some((i) => i.level === 'lỗi'));
  assert.ok(parsePlanFile('# T\n\n## Mục tiêu\nx\n').issues.some((i) => i.level === 'lỗi' && /Checkpoint/.test(i.msg)));
  assert.ok(parsePlanFile('chữ\n## Checkpoint\n### 1. A\n- [ ] a\n').issues.some((i) => i.level === 'lỗi' && /tiêu đề/.test(i.msg)));
}

// A dropped checkpoint ("(bỏ ...)") and a finished plan: no "now" station.
{
  const md = ['# T', 'Trạng thái: xong', '## Checkpoint', '### 1. A', 'Xong khi: x', '- [ ] a', '### 2. B (bỏ 2026-11-17, lý do ở "Đã đổi")', 'Mô tả.'].join('\n');
  const { plan, issues } = parsePlanFile(md);
  assert.deepEqual(plan.checkpoints.map((c) => c.state), ['todo', 'dropped']);
  assert.ok(!issues.some((i) => /"B"/.test(i.msg) && i.level === 'lệch'), 'a dropped checkpoint needs no "Xong khi" or tasks');
}

// Answered questions are read-only and need no recommendation.
{
  const md = ['# T', 'Trạng thái: đang chạy', '## Checkpoint', '### 1. A', 'Xong khi: x', '- [ ] a', '## Câu hỏi đã chốt (thien, 2026-11-15)', '1. Bài cũ đóng băng.'].join('\n');
  const { plan, issues } = parsePlanFile(md);
  assert.equal(plan.answered, true);
  assert.ok(!issues.some((i) => /câu hỏi/.test(i.msg)));
}

// Every plan in the repo builds (no blocking error).
for (const f of readdirSync(join(root, 'docs/plans')).filter((f) => f.endsWith('.md'))) {
  const md = readFileSync(join(root, 'docs/plans', f), 'utf8');
  if (!/^## Checkpoint/m.test(md)) continue;
  assert.deepEqual(parsePlanFile(md).issues.filter((i) => i.level === 'lỗi'), [], f);
}

// The built page: kit filled in, data escaped, publish.json written.
{
  const dir = mkdtempSync(join(tmpdir(), 'plan-'));
  const md = join(dir, 'p.md');
  writeFileSync(md, readFileSync(fixture, 'utf8').replace('# Kế hoạch mẫu để kiểm trang', '# Kế hoạch </script> mẫu'));
  const out = join(dir, 'out');
  const { id } = build(md, out, { today: '2026-11-21' });
  assert.equal(id, 'p');
  const html = readFileSync(join(out, 'index.html'), 'utf8');
  for (const mark of ['/*KIT_CSS*/', '/*KIT_JS*/', '/*PLAN_JS*/', '__PLAN__', '__TITLE__', '<!--BODY-->']) assert.ok(!html.includes(mark), `${mark} replaced`);
  assert.ok(html.includes('window.Kit') && html.includes("'plans/' + P.id"));
  assert.ok(!html.includes('</script> mẫu'), 'title is escaped');
  assert.match(html, /id="ck-3"[^>]*>/);
  assert.match(html, /<a class="jump" href="#ck-1">/, 'the jump card is a real link');
  assert.match(html, /id="readout" role="status"/);
  assert.ok(existsSync(join(out, 'preview.html')));
  const pub = JSON.parse(readFileSync(join(out, 'publish.json'), 'utf8'));
  assert.deepEqual(pub.capabilities, { comments: {}, db: {} });
}

// CLI: --check prints deviations and exits 1 only on a blocking error.
{
  const cli = join(root, 'artifacts/plan/make-plan.mjs');
  const ok = spawnSync(process.execPath, [cli, '--check', fixture], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /fixture\.md: đúng mẫu/);
  const dir = mkdtempSync(join(tmpdir(), 'plan-bad-'));
  writeFileSync(join(dir, 'bad.md'), '# T\n\n## Checkpoint\n\nchưa có\n');
  const bad = spawnSync(process.execPath, [cli, '--check', dir], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /bad\.md:3: lỗi: mục Checkpoint chưa có checkpoint nào/);
}

// Blocks (KH9 ga 2): by default every block with content; a "Khối:" line picks blocks and order, and a dropped block
// takes its CSS and JS with it, so the page gets lighter.
{
  const dir = mkdtempSync(join(tmpdir(), 'plan-blocks-'));
  const full = build(fixture, join(dir, 'full'), { today: '2026-11-21' });
  assert.deepEqual(full.blocks, ['dang-o', 'tuyen', 'ban-do', 'phuong-an', 'cau-hoi', 'them', 'nhat-ky']);
  const md = readFileSync(fixture, 'utf8').replace('\nLuật ghi file', '\nKhối: cau-hoi, tuyen · Vì: chờ duyệt, câu hỏi lên trước\n\nLuật ghi file');
  writeFileSync(join(dir, 'some.md'), md);
  const some = build(join(dir, 'some.md'), join(dir, 'some'), { today: '2026-11-21' });
  assert.deepEqual(some.blocks, ['cau-hoi', 'tuyen']);
  assert.ok(some.plan.blocks.why.startsWith('chờ duyệt'));
  for (const b of ['dang-o', 'ban-do', 'phuong-an', 'them-nhat-ky']) assert.ok(some.dropped.includes(b), `${b} dropped`);
  const a = readFileSync(join(dir, 'full/index.html'), 'utf8'), b = readFileSync(join(dir, 'some/index.html'), 'utf8');
  assert.ok(b.length < a.length - 8000, `lighter without the blocks (${a.length} -> ${b.length})`);
  assert.doesNotMatch(b, /id="daymap"|\.daymap|\.opts\{|id="phuong-an"|href="#dang-o"/, 'no markup, CSS or menu entry of dropped blocks');
  assert.ok(b.indexOf('id="cau-hoi"') < b.indexOf('id="tuyen"'), 'order follows the line');
  assert.ok(/drawInto/.test(a) && !/drawInto/.test(b), 'day-map code dropped with its block');
  // Wrong names and a missing reason are reported; no valid name falls back to the default.
  const bad = parsePlanFile(md.replace('Khối: cau-hoi, tuyen · Vì: chờ duyệt, câu hỏi lên trước', 'Khối: cau-hoi, bang-x'));
  assert.ok(bad.issues.some((i) => /khối "bang-x" không có/.test(i.msg)));
  assert.ok(bad.issues.some((i) => /thiếu " · Vì:/.test(i.msg)));
  assert.equal(parsePlanFile(md.replace('Khối: cau-hoi, tuyen', 'Khối: bang-x')).plan.blocks, null);
  // A dropped block stays dropped when the page text names it; no link to a stop when the line is gone (PR #158 review).
  writeFileSync(join(dir, 'named.md'), md.replace('# Kế hoạch mẫu để kiểm trang', '# Kế hoạch về cau-hoi và tuyen').replace('Khối: cau-hoi, tuyen', 'Khối: dang-o, nhat-ky'));
  const named = build(join(dir, 'named.md'), join(dir, 'named'), { today: '2026-11-21' });
  const nh = readFileSync(join(dir, 'named/index.html'), 'utf8');
  assert.ok(named.dropped.includes('cau-hoi') && named.dropped.includes('tuyen'));
  assert.doesNotMatch(nh, /addEventListener\('input'|class="jump"/, 'no question code, no jump link to a missing stop');
  // A listed block with no content is skipped with a note.
  const noOpts = md.replace(/## Các phương án đã xét[\s\S]*?(?=## Checkpoint)/, '').replace('Khối: cau-hoi, tuyen', 'Khối: phuong-an, tuyen');
  writeFileSync(join(dir, 'no-opts.md'), noOpts);
  const n = build(join(dir, 'no-opts.md'), join(dir, 'no-opts'), { today: '2026-11-21' });
  assert.deepEqual(n.blocks, ['tuyen']);
  assert.ok(n.issues.some((i) => i.level === 'ghi chú' && /phuong-an/.test(i.msg)));
}

console.log('ok make-plan');
