const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const chat = fs.readFileSync('ogen-chat.css', 'utf8');
const responsive = fs.readFileSync('ogen-responsive.css', 'utf8');
const appJs = fs.readFileSync('ogen-app.js', 'utf8');

function rule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(escaped + '\\s*\\{([^}]*)\\}', 's'));
  return match ? match[1] : '';
}

test('chatbot fills the viewport with a three-row flex layout', () => {
  const app = rule(chat, '.ogen-app');
  assert.match(app, /min-height:\s*100dvh/);
  assert.match(app, /display:\s*flex/);
  assert.match(app, /flex-direction:\s*column/);
  assert.match(app, /overflow:\s*hidden/);
});

test('conversation scrolls independently between sticky chrome', () => {
  const conversation = rule(chat, '.ogen-chat-conversation');
  assert.match(conversation, /min-height:\s*0/);
  assert.match(conversation, /overflow-y:\s*auto/);
  assert.match(rule(chat, '.ogen-chat-header'), /position:\s*sticky/);
  assert.match(rule(chat, '.ogen-composer'), /position:\s*sticky/);
});

test('chat-only responsive CSS contains no floating widget or dialog panel rules', () => {
  assert.doesNotMatch(responsive, /ogen-chat-panel|ogen-floating|ogen-chat-overlay/);
  assert.match(responsive, /@media\s*\(min-width:\s*768px\)/);
  assert.match(responsive, /@media\s*\(min-width:\s*1024px\)/);
});

test('the mobile welcome screen opens at the start instead of auto-scrolling to its actions', () => {
  assert.match(appJs, /function appendNode\(html, shouldScroll\)/);
  assert.match(appJs, /appendNode\(renderWelcome\(\), false\)/);
});
