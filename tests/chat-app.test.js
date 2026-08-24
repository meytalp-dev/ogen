const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const chatHtml = fs.readFileSync('chat.html', 'utf8');
const chatManifestRaw = fs.readFileSync('manifest-chat.webmanifest', 'utf8');
const widget = fs.readFileSync('ogen-widget.js', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

test('the chat manifest is a separate installable app named שאל את עוגן', () => {
  const manifest = JSON.parse(chatManifestRaw);
  assert.equal(manifest.short_name, 'שאל את עוגן');
  assert.equal(manifest.start_url, 'chat.html');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.dir, 'rtl');
  assert.notEqual(manifest.id, JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8')).id,
    'chat app id must differ from the full app id so both can be installed');
  for (const icon of manifest.icons) assert.ok(fs.existsSync(icon.src), icon.src);
});

test('chat.html boots the widget in standalone full-screen mode with its own manifest', () => {
  assert.match(chatHtml, /OGEN_WIDGET_STANDALONE = true/);
  assert.match(chatHtml, /rel="manifest"\s+href="manifest-chat\.webmanifest"/);
  assert.match(chatHtml, /<script src="ogen-widget\.js">/);
  assert.match(chatHtml, /register\("sw\.js"\)/);
});

test('the widget supports standalone mode: full screen, no launcher, opens the conversation', () => {
  assert.match(widget, /OGEN_WIDGET_STANDALONE/);
  assert.match(widget, /ogenw-standalone/);
  assert.match(widget, /"ogenw-standalone", "ogenw-open"/);
});

test('the service worker precaches the chat app shell', () => {
  assert.match(sw, /"chat\.html"/);
  assert.match(sw, /"manifest-chat\.webmanifest"/);
  assert.match(sw, /"ogen-widget\.js"/);
});
