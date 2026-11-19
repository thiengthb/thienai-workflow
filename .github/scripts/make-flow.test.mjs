// Reads flow files (a Diagram.mount spec plus page fields), reports what is wrong, and builds a page.
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFlow, inline, build } from '../../artifacts/flow/make-flow.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = join(root, 'artifacts/flow/fixture.json');
const cli = join(root, 'artifacts/flow/make-flow.mjs');

// Inline text: escaped, with only code, bold and https links.
assert.equal(inline('a <b> `x<y>` **đậm**'), 'a &lt;b&gt; <code>x&lt;y&gt;</code> <b>đậm</b>');
assert.equal(inline('[t](https://a.b/c) [u](javascript:x)'), '<a href="https://a.b/c">t</a> [u](javascript:x)');
assert.equal(inline('`**not bold**`'), '<code>**not bold**</code>');

// The fixture: branch, loop, an aside node.
{
  const { flow, issues } = readFlow(readFileSync(fixture, 'utf8'));
  assert.deepEqual(issues, []);
  assert.deepEqual(flow.steps.map((s) => s.id), ['branch', 'pr', 'review', 'merge']);
  assert.deepEqual(flow.edges[2], { from: 'review', to: 'pr', label: 'có ý cần sửa' });
}

// Mistakes: fatal ones block the build, the rest are reported.
{
  const { issues } = readFlow({ nodes: [{ id: 'a' }, { id: 'a' }, { id: 'b c' }, { id: 'd' }], edges: [['a', 'x']], steps: ['a', 'a', 'z'] });
  const fatal = issues.filter((i) => i.level === 'lỗi').map((i) => i.msg);
  assert.ok(fatal.includes('thiếu tên luồng'));
  assert.ok(fatal.some((m) => /"a" trùng/.test(m)));
  assert.ok(fatal.some((m) => /chỉ được có chữ không dấu/.test(m)));
  assert.ok(fatal.some((m) => /a → x/.test(m)));
  assert.ok(fatal.some((m) => /"a" là bước hai lần/.test(m)));
  assert.ok(fatal.some((m) => /"z" không có/.test(m)));
  const soft = issues.filter((i) => i.level === 'lệch').map((i) => i.msg);
  assert.ok(soft.some((m) => /chưa có chữ/.test(m)), 'a step with no note');
  assert.ok(soft.some((m) => /không nối với khối nào/.test(m)));
  assert.ok(soft.some((m) => /khối phụ "d" chưa có note/.test(m)));
  assert.equal(readFlow('{ nope').issues[0].level, 'lỗi');
  assert.equal(readFlow({ title: 'x', nodes: [{ id: 'a' }] }).issues.find((i) => i.level === 'lỗi').at, 'steps');
}

// Build: the page carries the spec without notes (the notes are the text beside it), every step, and the retell box.
{
  const out = mkdtempSync(join(tmpdir(), 'flow-'));
  const { id } = build(fixture, out);
  assert.equal(id, 'fixture');
  const html = readFileSync(join(out, 'index.html'), 'utf8');
  for (const s of ['branch', 'pr', 'review', 'merge']) assert.match(html, new RegExp(`id="b-${s}"`));
  assert.match(html, /id="n-rules"/, 'aside node');
  assert.match(html, /<b>có ý cần sửa<\/b>: quay lại <a href="#b-pr">Mở PR<\/a>/, 'a loop is written out in words');
  assert.match(html, /Nhận từ <a href="#n-rules">DELEGATION\.md<\/a>/);
  assert.match(html, /id="tell"/);
  assert.match(html, /window\.Diagram\s*=/, 'diagram.js is inlined');
  assert.doesNotMatch(html, /__FLOW__|\/\*FLOW_JS\*\/|\/\*DIAGRAM_JS\*\//);
  const data = JSON.parse(html.match(/<script type="application\/json" id="flow">(.*?)<\/script>/s)[1]);
  assert.ok(data.spec.nodes.every((n) => !('note' in n)), 'notes stay out of the boxes');
  assert.deepEqual(data.labels, ['Tạo nhánh', 'Mở PR', 'CodeRabbit và CI', 'Bạn merge']);
  const pub = JSON.parse(readFileSync(join(out, 'publish.json'), 'utf8'));
  assert.deepEqual(pub.capabilities, { comments: {}, db: {} });
}

// Every flow in docs/flows builds clean.
{
  const dir = join(root, 'docs/flows');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.ok(files.length >= 1);
  const r = spawnSync(process.execPath, [cli, '--check', dir], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const f of files) assert.match(r.stdout, new RegExp(`${f}: đúng mẫu`));
}

// Blocks (KH9 ga 2): default is every block with content; "blocks" picks them, and dropping the diagram drops dagre
// and diagram.js too. Steps stay. A side node without "ngoai-luong" is named, not linked to a missing card.
{
  const dir = mkdtempSync(join(tmpdir(), 'flow-blocks-'));
  const full = build(fixture, join(dir, 'full'));
  assert.deepEqual(full.blocks, ['so-do', 'ngoai-luong', 'ke-lai']);
  const j = JSON.parse(readFileSync(fixture, 'utf8'));
  writeFileSync(join(dir, 'some.json'), JSON.stringify({ ...j, blocks: ['ke-lai'], blocksWhy: 'chỉ ôn lại bằng chữ' }));
  const some = build(join(dir, 'some.json'), join(dir, 'some'));
  assert.deepEqual(some.blocks, ['ke-lai']);
  for (const b of ['so-do', 'ngoai-luong', 'diagram']) assert.ok(some.dropped.includes(b), `${b} dropped`);
  const a = readFileSync(join(dir, 'full/index.html'), 'utf8'), b = readFileSync(join(dir, 'some/index.html'), 'utf8');
  assert.ok(b.length < a.length / 2, `much lighter without the diagram (${a.length} -> ${b.length})`);
  assert.doesNotMatch(b, /id="flow-dg"|Diagram\.mount|dagre|href="#n-/);
  assert.match(b, /class="beat"/);
  assert.match(b, /Nhận từ <b>DELEGATION\.md<\/b>/);
  // Page text naming a dropped block's mark does not keep it (PR #158 review).
  writeFileSync(join(dir, 'named.json'), JSON.stringify({ ...j, title: 'Luồng flow-dg và Diagram', blocks: ['ke-lai'], blocksWhy: 'thử' }));
  build(join(dir, 'named.json'), join(dir, 'named'));
  assert.doesNotMatch(readFileSync(join(dir, 'named/index.html'), 'utf8'), /dagre|Diagram\.mount/);
  const bad = readFlow({ ...j, blocks: ['so-do', 'bang-x'] });
  assert.ok(bad.issues.some((i) => /khối "bang-x" không có/.test(i.msg)));
  assert.ok(bad.issues.some((i) => i.at === 'blocksWhy'));
}

console.log('ok make-flow');
