const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const widget = fs.readFileSync('ogen-widget.js', 'utf8');
const appJs = fs.readFileSync('ogen-app.js', 'utf8');
const demo = fs.readFileSync('widget-demo.html', 'utf8');

function extractGreetingRe(src, label) {
  const match = src.match(/GREETING_RE = (\/.*\/i);/);
  assert.ok(match, 'GREETING_RE found in ' + label);
  return eval(match[1]);
}

test('widget and full app share the same greeting behavior', () => {
  for (const [src, label] of [[widget, 'widget'], [appJs, 'app']]) {
    const re = extractGreetingRe(src, label);
    for (const greeting of ['שלום', 'שלום!', 'היי', 'בוקר טוב', 'מה נשמע?', 'hello']) {
      assert.ok(re.test(greeting), label + ' greets on: ' + greeting);
    }
    for (const question of ['שלום, מה תהליך אישור התכנון?', 'מה יש בדרייב המנהלים?']) {
      assert.ok(!re.test(question), label + ' must not greet on: ' + question);
    }
    assert.match(src, /שלום לך! הגעת למקום הנכון לשאול שאלה/, label + ' greeting reply text');
  }
});

test('the widget is self-contained, RTL, and talks to the same backend contract', () => {
  assert.match(widget, /__OGEN_WIDGET_LOADED__/);
  assert.match(widget, /direction:rtl/);
  assert.match(widget, /Content-Type": "text\/plain;charset=utf-8/);
  assert.match(widget, /question: text, history: historyBefore\.slice\(-6\)/);
  assert.match(widget, /escapeHtml/);
  assert.match(widget, /script\.google\.com\/macros/);
});

test('the demo page embeds the widget with a single script tag', () => {
  assert.match(demo, /<script src="ogen-widget\.js" defer><\/script>/);
  assert.match(demo, /dir="rtl"/);
});
