const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const tokens = fs.readFileSync('ogen-tokens.css', 'utf8');
const base = fs.readFileSync('ogen-base.css', 'utf8');
const components = fs.readFileSync('ogen-components.css', 'utf8');
const chat = fs.readFileSync('ogen-chat.css', 'utf8');
const responsive = fs.readFileSync('ogen-responsive.css', 'utf8');

function rule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(escaped + '\\s*\\{([^}]*)\\}', 's'));
  return match ? match[1] : '';
}

test('compact controls retain a 44px minimum touch target', () => {
  assert.match(tokens, /--ogen-touch-target:\s*44px/);

  for (const [css, selector] of [
    [components, '.ogen-chip'],
    [components, '.ogen-btn--sm'],
    [components, '.ogen-section-ask'],
    [chat, '.ogen-icon-btn']
  ]) {
    assert.match(rule(css, selector), /min-height:\s*var\(--ogen-touch-target\)/, selector);
  }
});

test('the full-page chatbot keeps scrolling inside the conversation', () => {
  assert.match(responsive, /html,\s*body\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(rule(chat, '.ogen-chat-conversation'), /overflow-y:\s*auto/);
});

test('long source metadata wraps without widening the chat', () => {
  assert.match(rule(components, '.ogen-source-card'), /min-width:\s*0/);
  assert.match(rule(components, '.ogen-source-card__meta'), /overflow-wrap:\s*anywhere/);
});

test('unavailable demo sources look and behave disabled', () => {
  const disabled = rule(components, '.ogen-source-card__link--disabled');
  assert.match(disabled, /color:\s*var\(--ogen-text-muted\)/);
  assert.match(disabled, /cursor:\s*not-allowed/);
});
