// Tests for artifacts/kit/pack.mjs: shrinking a page must not change what runs or what the page shows.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { minCss, minJs, trimIcons, trimBlocks, packHtml } from '../../artifacts/kit/pack.mjs';
import { checkSizes } from '../../artifacts/kit/check-pages.mjs';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// CSS: comments and spacing go, strings stay byte for byte.
assert.equal(minCss('/* a */\n.x  {\n  color: red;\n}\n\n.y , .z { content: "a  /* b */  c"; }'), '.x{color: red;}.y,.z{content: "a  /* b */  c";}');
assert.equal(minCss('a { background: url("data:image/svg+xml,%3Csvg viewBox=\'0 0 24 24\'%3E"); }'), 'a{background: url("data:image/svg+xml,%3Csvg viewBox=\'0 0 24 24\'%3E");}');
assert.equal(minCss('.a .b:hover { margin: calc(100% - 4px) 0; }'), '.a .b:hover{margin: calc(100% - 4px) 0;}', 'descendant space and calc() spaces kept');

// JS: only whole comment lines go; code lines, template literal lines and trailing comments stay.
const js = [
  '/* header',
  '   more */',
  '// line comment',
  'const a = 1; // keep me',
  'const t = `first',
  '// inside a template literal',
  '/* also inside */',
  'last`;',
  '  /* one-line block */',
  'const url = "http://x/y";',
].join('\n');
assert.equal(minJs(js), ['const a = 1; // keep me', 'const t = `first', '// inside a template literal', '/* also inside */', 'last`;', 'const url = "http://x/y";'].join('\n'));
// A block comment that ends mid-line keeps the code after it.
assert.equal(minJs('/* a\n b */ run();'), ' run();');

// Icons: unused ones are removed, used ones (class, var(), Kit.icon('…')) are kept. Not-a-prefix: "ic-x" must not keep "ic-x-ray".
const kit = ':root{--ic-check: url("data:a");--ic-x: url("data:b");--ic-copy: url("data:c");--ic-play: url("data:d");}\n'
  + '.ic-check{--i: var(--ic-check)}.ic-x{--i: var(--ic-x)}.ic-copy{--i: var(--ic-copy)}.ic-play{--i: var(--ic-play)}\n'
  + '.ai::before{mask: var(--ic-play)}';
const page = `<style>${kit}</style><i class="ic ic-check"></i><script>Kit.icon('copy'); music-x;</script>`;
const out = trimIcons(page);
for (const n of ['check', 'copy', 'play']) assert.match(out, new RegExp(`--ic-${n}:`), `${n} kept`);
assert.doesNotMatch(out, /--ic-x:/, 'unused x removed');
assert.doesNotMatch(out, /\.ic-x\{/, 'unused class removed');

// The real kit: a page that uses no icon keeps only those the kit's own rules point at, and shrinks.
const real = `<style>${readFileSync(new URL('../../artifacts/kit/kit.css', import.meta.url), 'utf8')}</style><p>x</p>`;
const packed = packHtml(real);
assert.ok(packed.length < real.length * 0.75, `kit.css shrinks by a quarter or more (${real.length} -> ${packed.length})`);
assert.match(packed, /--ic-circle-help:/, 'icon used by .ai-open kept');
assert.doesNotMatch(packed, /--ic-calendar:/, 'unused icon dropped');
// JSON data blocks are left alone.
assert.equal(packHtml('<script type="application/json">{"a": "// x"}\n// y</script>'), '<script type="application/json">{"a": "// x"}\n// y</script>');

// Blocks (KH9 ga 2): a region stays when one of its marks is on the page outside every region and outside comments,
// or inside a region that stays. Several regions with the same name go together. Marks match whole words.
{
  const page = '<style>/* @block a foo */.foo{}/* @end a */\n/* @block b bar */.bar{}/* @end b */\n/* @block c */.c{}/* @end c */\n'
    + '/* @block e foo-x */.foo-x{}/* @end e */\n/* uses .bar and .c in a comment only */</style><p class="foo c">x</p>'
    + '<script>/* @block a */ Kit.uses("chain") /* @end a */ /* @block f chain */ f() /* @end f */\n  // bar\n</script>';
  const out = trimBlocks(page);
  assert.match(out, /\.foo\{\}/, 'used block kept');
  assert.match(out, /\.c\{\}/, 'name is the mark when none is given');
  assert.doesNotMatch(out, /\.bar\{\}/, 'a mark only in comments does not count');
  assert.doesNotMatch(out, /foo-x/, 'marks match whole words');
  assert.match(out, /Kit\.uses/, 'every region of a kept block stays');
  assert.match(out, /f\(\)/, 'a block used from inside a kept block stays');
  assert.doesNotMatch(out, /@block|@end/, 'markers are gone');
  assert.deepEqual(trimBlocks.last.sort(), ['b', 'e']);
  assert.equal(trimBlocks('<p>no blocks</p>'), '<p>no blocks</p>');
  assert.match(packHtml(page, { blocks: false }), /\.bar\{\}/, 'blocks: false keeps everything (component gallery)');
}

// Review of PR #158: only real comments are ignored ("/*" inside a JS string is not one), HTML comments are ignored,
// markers outside <style>/<script> are page text and stay, ":empty" is not the class "empty", and blocks the builder
// dropped stay dropped even when page text names them.
{
  const css = '<style>/* @block callout */.callout{}/* @end callout */ /* @block empty empty empty-ic */.empty{}/* @end empty */ p:empty{}'
    + '/* @block q cau-hoi */.qs{}/* @end q */</style>';
  const strings = trimBlocks(css + '<script>a = "/*"; el.className = "callout"; b = "*/";</script>');
  assert.match(strings, /\.callout\{\}/, 'a class between the strings "/*" and "*/" still counts');
  assert.doesNotMatch(trimBlocks(css + '<!-- class="callout" --><p>x</p>'), /\.callout\{\}/, 'HTML comments do not count');
  assert.doesNotMatch(trimBlocks(css + '<p>x</p>'), /\.empty\{\}/, ':empty is not a use of .empty');
  assert.match(trimBlocks(css + '<div class="empty">x</div>'), /\.empty\{\}/, '.empty without .empty-ic keeps the block');
  const text = '<pre>/* @block example unused */ code /* @end example */</pre>';
  assert.equal(trimBlocks(css + text).endsWith(text), true, 'markers in page text are left alone');
  const named = css + '<h1>Trả lời ở cau-hoi</h1>';
  assert.match(trimBlocks(named), /\.qs\{\}/);
  assert.doesNotMatch(trimBlocks(named, { drop: ['q'] }), /\.qs\{\}/, 'drop wins over page text');
  assert.doesNotMatch(packHtml(named, { drop: ['q'] }), /\.qs\{\}/, 'packHtml passes drop on');
}

// The real kit: a page with none of the optional blocks loses their CSS; a page that uses one keeps it.
{
  const kitCss = readFileSync(new URL('../../artifacts/kit/kit.css', import.meta.url), 'utf8');
  const bare = packHtml(`<style>${kitCss}</style><p>x</p>`);
  for (const sel of ['.dg-node', '.steps', '.callout', '.skel', '.kit-send', '.choice']) assert.ok(!bare.includes(sel + '{') && !bare.includes(sel + ' '), `${sel} dropped`);
  const used = packHtml(`<style>${kitCss}</style><div class="kit-send"><button class="choice"></button></div><details class="acc"></details>`);
  for (const sel of ['.kit-send', '.choice', '.trial', '.acc summary']) assert.ok(used.includes(sel), `${sel} kept`);
  assert.doesNotMatch(used, /\.dg-node/, 'diagram CSS dropped');
}

// Size check (check-pages item 8): over the base plus 20% is an error, under is a line with the change.
{
  const dir = mkdtempSync(join(tmpdir(), 'sizes-'));
  writeFileSync(join(dir, 'a.html'), 'x'.repeat(130));
  writeFileSync(join(dir, 'b.html'), 'x'.repeat(100));
  const r = await checkSizes([{ name: 'a', file: join(dir, 'a.html') }, { name: 'b', file: join(dir, 'b.html') }, { name: 'new', file: join(dir, 'b.html') }],
    { limit: 1.2, pages: { a: 100, b: 100 } });
  assert.equal(r.fails, 1);
  assert.match(r.lines[0], /^LỖI \[mau-a\].*30%/);
  assert.match(r.lines[1], /^cỡ \[mau-b\].*\+0%/);
  assert.match(r.lines[2], /chưa có cỡ gốc/);
  const base = JSON.parse(readFileSync(new URL('../../artifacts/kit/sizes.json', import.meta.url), 'utf8'));
  for (const n of ['lesson', 'war', 'frontend', 'ba', 'decide', 'compare', 'review', 'plan', 'flow', 'gallery']) assert.ok(base.pages[n] > 0, `sizes.json has ${n}`);
}
console.log('pack.test: ok');
