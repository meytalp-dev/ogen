const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const manifestRaw = fs.readFileSync('manifest.webmanifest', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

test('the manifest is valid JSON with an installable RTL Hebrew identity', () => {
  const manifest = JSON.parse(manifestRaw);
  assert.equal(manifest.lang, 'he');
  assert.equal(manifest.dir, 'rtl');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.short_name, 'עוגן');
  assert.ok(manifest.start_url);
  assert.match(manifest.theme_color, /^#[0-9A-Fa-f]{6}$/);
  assert.match(manifest.background_color, /^#[0-9A-Fa-f]{6}$/);
});

test('every icon the manifest declares exists on disk, including a maskable one', () => {
  const manifest = JSON.parse(manifestRaw);
  assert.ok(manifest.icons.length >= 3);
  for (const icon of manifest.icons) {
    assert.ok(fs.existsSync(icon.src), icon.src);
  }
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'));
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes('192x192'));
  assert.ok(sizes.includes('512x512'));
});

test('index.html wires the manifest, icons and service worker registration', () => {
  assert.match(indexHtml, /rel="manifest"\s+href="manifest\.webmanifest"/);
  assert.match(indexHtml, /name="theme-color"/);
  assert.match(indexHtml, /rel="apple-touch-icon"/);
  assert.match(indexHtml, /serviceWorker/);
  assert.match(indexHtml, /register\("sw\.js"\)/);
});

test('every file the service worker precaches exists on disk', () => {
  const listMatch = sw.match(/SHELL_FILES\s*=\s*\[([^\]]*)\]/s);
  assert.ok(listMatch, 'SHELL_FILES list found in sw.js');
  const files = [...listMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(files.length >= 10);
  for (const file of files) {
    if (file === './') continue;
    assert.ok(fs.existsSync(path.normalize(file)), file);
  }
});

test('the service worker never caches the AI backend and skips non-GET requests', () => {
  assert.match(sw, /request\.method !== "GET"/);
  assert.match(sw, /script\.google\.com/);
});
