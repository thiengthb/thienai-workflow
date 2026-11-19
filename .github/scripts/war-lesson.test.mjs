// war-lesson.js: "Xem Claude làm" on a sand-table step only offers that step's tracks
// (data-board, plus data-track and data-plan buttons inside the step), never another lesson's tracks
// from the same battle file. Bug found in war lesson 7 (2026-11-17): the demo walked through lesson 3's `real`, `A`.
// Runs the script in node:vm with a tiny fake DOM, enough for the parts war-lesson.js touches.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = readFileSync(fileURLToPath(new URL('../../artifacts/war/war-lesson.js', import.meta.url)), 'utf8');

class Node {
  constructor(tag, attrs = {}, kids = []) {
    this.tagName = tag.toUpperCase(); this.attrs = { ...attrs }; this.children = kids; this.textContent = attrs.text || '';
    kids.forEach((k) => { k.parent = this; });
    this.dataset = Object.fromEntries(Object.entries(attrs).filter(([k]) => k.startsWith('data-'))
      .map(([k, v]) => [k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase()), v]));
    const cls = new Set((attrs.class || '').split(/\s+/).filter(Boolean));
    this.classList = { contains: (c) => cls.has(c), toggle() {}, add() {} };
  }
  matches(sel) {
    return sel.split(',').map((x) => x.trim()).some((one) => {
      const m = one.match(/^(\w+)?(?:#([\w-]+))?((?:\.[\w-]+)*)((?:\[[\w-]+(?:="[^"]*")?\])*)$/);
      if (!m) return false;
      const [, tag, id, classes, attrs] = m;
      if (tag && this.tagName !== tag.toUpperCase()) return false;
      if (id && this.attrs.id !== id) return false;
      if (classes && !classes.split('.').filter(Boolean).every((c) => this.classList.contains(c))) return false;
      for (const [, name, val] of attrs.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)) {
        if (!(name in this.attrs)) return false;
        if (val != null && this.attrs[name] !== val) return false;
      }
      return true;
    });
  }
  all() { return this.children.flatMap((k) => [k, ...k.all()]); }
  querySelectorAll(sel) { return this.all().filter((n) => n.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener() {}
  scrollIntoView() {}
  after() {}
}
const h = (tag, attrs, ...kids) => new Node(tag, attrs, kids);

const key = (title) => ({ date: '1954', title, text: title + ' chữ' });
const battle = {
  terrain: { h: [] },
  tracks: {
    real: { label: 'Chuyện thật', keys: [key('Hoãn đánh 25/1'), key('Kéo pháo ra')] },
    A: { label: 'Nếu đánh ngay', tag: 'sim', keys: [key('Đánh ngay')] },
    p7: { label: 'Chuyện thật', keys: [key('Hầm pháo sườn trong'), key('Trận địa giả')] },
    p7A: { label: 'Nếu đặt sau núi', tag: 'sim', keys: [key('Sau núi')] },
    p7B: { label: 'Nếu đặt trống', tag: 'sim', keys: [key('Sườn trống')] },
  },
};
const stepLocked = h('section', { class: 'step on', 'data-board': 'p7@0' });
const stepChoose = h('section', { class: 'step', 'data-board': 'p7' },
  h('div', { class: 'choose', 'data-c': 'd1', 'data-real': 'C' }, h('button', { 'data-plan': 'p7A' }), h('button', { 'data-plan': 'p7B' })));
const stepReal = h('section', { class: 'step', 'data-board': 'p7' },
  h('button', { 'data-track': 'p7' }), h('button', { 'data-track': 'p7A' }), h('button', { 'data-track': 'p7B' }));
const stepPlain = h('section', { class: 'step', 'data-board': 'p7' });
const stepGhost = h('section', { class: 'step', 'data-board': 'nope' });
const body = h('body', {},
  h('script', { id: 'battle', text: JSON.stringify(battle) }), h('div', { id: 'board' }),
  stepLocked, stepChoose, stepReal, stepPlain, stepGhost);
const document = {
  body, documentElement: { dataset: {} },
  querySelector: (s) => body.querySelector(s), querySelectorAll: (s) => body.querySelectorAll(s), addEventListener() {},
};
const shown = [];
let provider = null;
const window = {
  innerWidth: 1200,
  Sandtable: { mount: () => ({ track: 'p7', at: 0, show(t, o) { this.track = t; this.at = o.at; shown.push(t + ':' + o.at); } }) },
  Lesson: { demo: (p) => { provider = p; }, done() {}, extras: [] },
};
vm.runInNewContext(src, { window, document, MutationObserver: class { observe() {} }, ...window });
assert.ok(provider, 'war-lesson.js registers a demo provider');

const tracksOf = (step) => [...provider.match(step).tools[0].inputSchema.properties.track.enum];   // copy: the vm's arrays come from another realm
assert.equal(provider.match(stepLocked), null, 'locked step (p7@0): no demo');
assert.deepEqual(tracksOf(stepReal), ['p7', 'p7A', 'p7B'], 'real-story step: its own track plus its "Xem" buttons');
assert.deepEqual(tracksOf(stepChoose), ['p7', 'p7A', 'p7B'], 'choice step: its own track plus its "Nếu chọn" buttons');
assert.deepEqual(tracksOf(stepPlain), ['p7'], 'step without buttons: only its own track');
assert.equal(provider.match(stepGhost), null, 'board track missing from the battle file: no demo');

const ctx = provider.match(stepReal).context();
assert.ok(!/\[real = /.test(ctx) && !/\[A = /.test(ctx) && !ctx.includes('Hoãn đánh'), 'context leaves out lesson 3 tracks');
assert.ok(ctx.includes('Hầm pháo sườn trong'), 'context lists this step\'s moments');

const tool = provider.match(stepReal).tools[0];
assert.throws(() => tool.execute({ track: 'real', index: 0, why: 'x' }), /Không có mốc real:0/, 'another lesson\'s track is refused');
const r = tool.execute({ track: 'p7', index: 1, why: 'x' });
assert.match(r.did, /Trận địa giả/);
assert.equal(shown.at(-1), 'p7:1');
console.log('war-lesson.test: ok');
