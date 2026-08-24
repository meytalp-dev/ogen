const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');

test('the prototype exposes a semantic full-page Hebrew RTL chatbot shell', () => {
  assert.match(html, /<html lang="he" dir="rtl">/);
  assert.match(html, /href="#ogen-chat-textarea"/);
  assert.match(html, /<main class="ogen-app"/);
  assert.match(html, /<header class="ogen-chat-header"/);
  assert.match(html, /<form class="ogen-composer"/);
  assert.match(html, /aria-live="polite"/);
  assert.doesNotMatch(html, /ogen-site-nav|ogen-floating|ogen-chat-panel/);
});

test('all six design-system stylesheets load in dependency order', () => {
  const expected = [
    'ogen-tokens.css',
    'ogen-base.css',
    'ogen-entity.css',
    'ogen-components.css',
    'ogen-chat.css',
    'ogen-responsive.css'
  ];
  const positions = expected.map((file) => html.indexOf(`href="${file}"`));

  assert.equal(positions.every((position) => position >= 0), true);
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});
