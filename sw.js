/*
  sw.js — service worker של עוגן (PWA)

  אסטרטגיה:
  - התקנה: שמירת מעטפת האפליקציה (HTML, CSS, JS, אייקונים) במטמון מקומי.
  - ניווט וקבצים מקומיים: מטמון קודם, ורענון ברקע מהרשת (stale-while-revalidate).
  - גופנים של Google Fonts: מטמון בזמן ריצה.
  - קריאות ל-backend (Google Apps Script): לעולם לא נוגעים — תמיד רשת חיה.

  עדכון גרסה: כשמשנים קבצים, מעלים את המספר ב-CACHE_NAME —
  ה-worker החדש ימחק את המטמון הישן ויטען הכל מחדש.
*/

const CACHE_NAME = "ogen-shell-v3";
const RUNTIME_CACHE = "ogen-runtime-v3";

const SHELL_FILES = [
  "./",
  "index.html",
  "chat.html",
  "manifest.webmanifest",
  "manifest-chat.webmanifest",
  "ogen-widget.js",
  "ogen-tokens.css",
  "ogen-base.css",
  "ogen-entity.css",
  "ogen-components.css",
  "ogen-chat.css",
  "ogen-responsive.css",
  "ogen-components.js",
  "ogen-knowledge.js",
  "ogen-app.js",
  "assets/ogen-entity-v4-transparent.webp",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // רק GET — קריאות ה-AI ל-Apps Script הן POST ועוברות ישר לרשת.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // ה-backend לא נכנס למטמון לעולם, גם אם יגיע כ-GET.
  if (url.hostname.endsWith("script.google.com") || url.hostname.endsWith("googleusercontent.com")) return;

  // גופנים — מטמון בזמן ריצה.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // קבצים מקומיים — מהמטמון, עם רענון ברקע. ניווט נופל ל-index.html כשאין רשת.
  if (url.origin === self.location.origin) {
    if (request.mode === "navigate") {
      event.respondWith(
        staleWhileRevalidate(request, CACHE_NAME).catch(() => caches.match("index.html"))
      );
      return;
    }
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
  }
});

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
}
