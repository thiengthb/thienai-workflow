// Tests for artifacts/kit/pack.mjs: shrinking a page must not change what runs or what the page shows.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { minCss, minJs, trimIcons, packHtml } from '../../artifacts/kit/pack.mjs';

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
console.log('pack.test: ok');
