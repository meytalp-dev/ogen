const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync('ogen-tokens.css', 'utf8');
const componentCss = fs.readFileSync('ogen-components.css', 'utf8');
const chatCss = fs.readFileSync('ogen-chat.css', 'utf8');

function token(name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  assert.ok(match, `missing color token --${name}`);
  return match[1];
}

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255);
  const linear = channels.map((value) => value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('normal-size secondary and metadata text meets WCAG AA on white', () => {
  for (const name of ['ogen-text-secondary', 'ogen-text-muted']) {
    assert.ok(contrast(token(name), '#FFFFFF') >= 4.5, `${name} is below 4.5:1`);
  }
});

test('primary action gradient remains legible with white text', () => {
  for (const name of ['ogen-action-start', 'ogen-action-end']) {
    assert.ok(contrast('#FFFFFF', token(name)) >= 4.5, `${name} is below 4.5:1`);
  }
  assert.match(componentCss, /var\(--ogen-action-start\).*var\(--ogen-action-end\)/);
  assert.match(chatCss, /var\(--ogen-action-start\).*var\(--ogen-action-end\)/);
});

test('evidence and authority text colors meet WCAG AA on pastel surfaces', () => {
  const pairs = [
    ['ogen-success-text', 'ogen-success-bg'],
    ['ogen-warning-text', 'ogen-warning-bg'],
    ['ogen-danger-text', 'ogen-danger-bg'],
    ['ogen-authority-mandatory-text', 'ogen-authority-mandatory-bg'],
    ['ogen-authority-directive-text', 'ogen-authority-directive-bg'],
    ['ogen-authority-professional-text', 'ogen-authority-professional-bg'],
    ['ogen-authority-suggestion-text', 'ogen-authority-suggestion-bg'],
    ['ogen-ai-text', 'ogen-ai-bg']
  ];

  for (const [foreground, background] of pairs) {
    assert.ok(contrast(token(foreground), token(background)) >= 4.5, `${foreground} is below 4.5:1`);
  }
});
