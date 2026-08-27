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

function extractGreetingReplies(src, label) {
  const match = src.match(/GREETING_REPLIES = (\[[\s\S]*?\]);/);
  assert.ok(match, 'GREETING_REPLIES found in ' + label);
  return eval(match[1]);
}

test('widget and full app share the same greeting behavior', () => {
  const greetingSets = [];
  for (const [src, label] of [[widget, 'widget'], [appJs, 'app']]) {
    const re = extractGreetingRe(src, label);
    for (const greeting of ['שלום', 'שלום!', 'היי', 'בוקר טוב', 'מה נשמע?', 'hello']) {
      assert.ok(re.test(greeting), label + ' greets on: ' + greeting);
    }
    for (const question of ['שלום, מה תהליך אישור התכנון?', 'מה יש בדרייב המנהלים?']) {
      assert.ok(!re.test(question), label + ' must not greet on: ' + question);
    }
    const replies = extractGreetingReplies(src, label);
    assert.ok(replies.length >= 3, label + ' has several greeting replies');
    greetingSets.push(replies.join('|'));
  }
  assert.equal(greetingSets[0], greetingSets[1], 'widget and app share the same greetings');
});

test('the widget shows rotating waiting quips while Ogen thinks', () => {
  for (const [src, label] of [[widget, 'widget'], [appJs, 'app']]) {
    const match = src.match(/WAITING_QUIPS = (\[[\s\S]*?\]);/);
    assert.ok(match, 'WAITING_QUIPS found in ' + label);
    assert.ok(eval(match[1]).length >= 10, label + ' has enough quips');
  }
  assert.match(widget, /clearInterval\(cycleTimer\)/, 'widget stops the quip timer');
});

test('answers surface their source links', () => {
  assert.match(widget, /function sourcesHtml/, 'widget renders source links');
  assert.match(widget, /linkifyEscaped\(escapeHtml\(text\)\)/, 'widget linkifies message text');
  const components = fs.readFileSync('ogen-components.js', 'utf8');
  assert.match(components, /function textWithLinks/, 'app linkifies answer text');
  assert.match(components, /textWithLinks\(answer\.summary\)/, 'app summary is linkified');
});

test('the widget is self-contained, RTL, and talks to the same backend contract', () => {
  assert.match(widget, /__OGEN_WIDGET_LOADED__/);
  assert.match(widget, /direction:rtl/);
  assert.match(widget, /Content-Type": "text\/plain;charset=utf-8/);
  assert.match(widget, /question: text, history: historyBefore\.slice\(-6\)/);
  // ה-backend עוטף את התשובה ב-{ok, answer} — הוויג'ט חייב לפרק את העטיפה
  assert.match(widget, /data\.ok && data\.answer && data\.answer\.summary/);
  assert.match(widget, /escapeHtml/);
  assert.match(widget, /script\.google\.com\/macros/);
});

test('the demo page embeds the widget with a single script tag', () => {
  assert.match(demo, /<script src="ogen-widget\.js" defer><\/script>/);
  assert.match(demo, /dir="rtl"/);
});

/* 27.8.2026 — Apps Script עונה ב-302 לכתובת תוכן זמנית שמדי פעם מחזירה 404 רגעי.
   התשובה כבר חושבה, אבל נופלת בדרך והמשתמש רואה "משהו השתבש". שני הצדדים
   חייבים לנסות שוב לבד לפני שהם מציגים שגיאה. */
test('both clients retry a failed backend call before showing an error', () => {
  for (const [src, label] of [[widget, 'widget'], [appJs, 'app']]) {
    assert.match(src, /BACKEND_ATTEMPTS = 3/, label + ' retries three times');
    assert.match(src, /RETRY_DELAYS = \[1500, 4000\]/, label + ' backs off between attempts');
    assert.match(src, /if \(!r\.ok\) throw new Error\("http " \+ r\.status\)/, label + ' treats a bad status as failure');
    assert.match(src, /askBackendWithRetry\(payload\)/, label + ' sends through the retry wrapper');
  }
});
