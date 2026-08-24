const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadComponents() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync('ogen-components.js', 'utf8'), context);
  return context.window.OgenComponents;
}

test('invalid entity variants fall back to a supported size and state', () => {
  const components = loadComponents();
  const markup = components.renderOgenEntity({ size: 'enormous', state: 'dancing' });

  assert.match(markup, /data-size="md"/);
  assert.match(markup, /data-state="idle"/);
  assert.match(markup, /aria-label="עוגן במצב מנוחה"/);
});

test('entity renderer uses the generated ribbon artwork with an optimized source and fallback', () => {
  const components = loadComponents();
  const markup = components.renderOgenEntity({ size: 'hero', state: 'searching' });

  assert.equal(fs.existsSync('assets/ogen-entity-v4-transparent.webp'), true);
  assert.equal(fs.existsSync('assets/ogen-entity-v4-transparent.png'), true);
  assert.match(markup, /srcset="assets\/ogen-entity-v4-transparent.webp"/);
  assert.match(markup, /src="assets\/ogen-entity-v4-transparent.png"/);
  assert.match(markup, /class="ogen-entity__art"/);
  assert.equal((markup.match(/ogen-entity__particle/g) || []).length <= 5, true);
});

test('source card blocks unsafe URLs instead of emitting an executable link', () => {
  const components = loadComponents();
  const markup = components.renderSourceCard({
    type: 'website',
    title: 'מקור לבדיקה',
    section: 'פרק 1',
    date: 'אוגוסט 2026',
    authority: 'directive',
    url: 'javascript:alert(1)'
  });

  assert.doesNotMatch(markup, /href=/);
  assert.match(markup, /המקור אינו זמין בתצוגת ההדגמה/);
});

test('external source links isolate the new browsing context', () => {
  const components = loadComponents();
  const markup = components.renderSourceCard({
    type: 'website',
    title: 'מקור רשמי',
    section: 'פרק 2',
    date: 'אוגוסט 2026',
    authority: 'directive',
    url: 'https://example.gov.il/source'
  });

  assert.match(markup, /target="_blank"/);
  assert.match(markup, /rel="noopener noreferrer"/);
});

test('source metadata cannot inject attributes into the card', () => {
  const components = loadComponents();
  const markup = components.renderSourceCard({
    type: 'website\" onclick=\"alert(1)',
    title: 'מקור',
    section: 'פרק',
    date: 'אוגוסט 2026',
    authority: 'directive',
    url: '#'
  });

  assert.doesNotMatch(markup, /onclick=/);
  assert.match(markup, /data-source-type="website"/);
});

test('user content is escaped before it is rendered', () => {
  const components = loadComponents();
  const markup = components.renderUserMessage('<img src=x onerror=alert(1)>');

  assert.doesNotMatch(markup, /<img/);
  assert.match(markup, /&lt;img/);
});

test('unknown authority values do not render a badge or inject attributes', () => {
  const components = loadComponents();
  const markup = components.renderAuthorityBadge('directive\" onclick=\"alert(1)');

  assert.equal(markup, '');
});

test('unknown evidence values fall back to the conservative unsupported state', () => {
  const components = loadComponents();
  const markup = components.renderEvidenceState('certain\" onclick=\"alert(1)');

  assert.doesNotMatch(markup, /onclick=/);
  assert.match(markup, /ogen-evidence--unsupported/);
  assert.match(markup, /לא נמצא בסיס מספיק/);
});

test('answer, searching, empty and error renderers expose distinct accessible states', () => {
  const components = loadComponents();
  const answer = components.renderAnswer({
    summary: 'תשובה קצרה',
    steps: ['צעד ראשון'],
    important: 'מידע חשוב',
    evidence: 'supported',
    entityState: 'found',
    sources: [],
    suggestedActions: ['הפכי לצ׳קליסט']
  });

  assert.match(answer, /בקצרה/);
  assert.match(answer, /מה צריך לעשות/);
  assert.match(answer, /חשוב לדעת/);
  assert.match(answer, /מידע מבוסס/);
  assert.match(components.renderSearchingIndicator('עוגן מחפשת במקורות...'), /role="status"/);
  assert.match(components.renderEmptyState(), /חיפוש במסמכים/);
  assert.match(components.renderErrorState(), /role="alert"/);
});
