/*
  ogen-widget.js — "שאל את עוגן": וויג'ט צ'אט צף בסגנון ווטסאפ.

  הטמעה בכל אתר — שורה אחת לפני סגירת ה-body:
    <script src="https://meytalp-dev.github.io/ogen/ogen-widget.js" defer></script>

  אפשרויות (לא חובה, מגדירים לפני טעינת הסקריפט):
    window.OGEN_WIDGET_BACKEND  — כתובת exec של ה-Apps Script (ברירת מחדל: ה-backend הקיים)
    window.OGEN_WIDGET_POSITION — "left" (ברירת מחדל) או "right"

  הוויג'ט עצמאי לחלוטין: מזריק את העיצוב שלו, לא דורש CSS או JS נוספים,
  ולא מתנגש עם עמוד המארח (כל המחלקות תחת ogenw-).
*/
(function () {
  "use strict";
  if (window.__OGEN_WIDGET_LOADED__) return;
  window.__OGEN_WIDGET_LOADED__ = true;

  var BACKEND_URL = String(
    window.OGEN_WIDGET_BACKEND ||
    window.OGEN_BACKEND_URL ||
    "https://script.google.com/macros/s/AKfycbzggpSrv4lHq6RF4784hJKEp1cTktjUmZDZ8TliicXYjfM_cJ4xoRYsIVa-8y7EgvYl/exec"
  ).trim();

  var POSITION = window.OGEN_WIDGET_POSITION === "right" ? "right" : "left";

  /* מצב עצמאי (chat.html): צ'אט במסך מלא, בלי כפתור צף — משמש כאפליקציה לנייד */
  var STANDALONE = !!window.OGEN_WIDGET_STANDALONE;
  var AVATAR_URL = "https://meytalp-dev.github.io/ogen/assets/icons/icon-192.png";
  var FULL_APP_URL = "https://meytalp-dev.github.io/ogen/";

  var GREETING_RE = /^(שלום|היי+|הי|אהלן|הלו|בוקר טוב|ערב טוב|צהריים טובים|מה נשמע|מה שלומך|hi|hello|hey)[\s!?.,]*$/i;
  var GREETING_REPLY = "שלום לך! הגעת למקום הנכון לשאול שאלה. מה תרצו לדעת?";
  var OPENING_MESSAGE = "שלום 👋 אני עוגן, סוכנת הידע של בתי הספר המקצועיים. שאלו אותי כל דבר על היערכות, נהלים, תקציבים וחומרים.";

  var history = [];
  var busy = false;

  /* ============ עיצוב (מוזרק, בסגנון ווטסאפ, RTL) ============ */
  var css = "" +
    ".ogenw-launcher{position:fixed;bottom:20px;" + POSITION + ":20px;z-index:99990;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:#0D3B66;box-shadow:0 8px 24px rgba(13,59,102,.35);padding:0;display:flex;align-items:center;justify-content:center;transition:transform .18s ease}" +
    ".ogenw-launcher:hover{transform:scale(1.07)}" +
    ".ogenw-launcher img{width:44px;height:44px;border-radius:50%;background:#F8FBFF;object-fit:cover}" +
    ".ogenw-launcher-label{position:fixed;bottom:32px;" + POSITION + ":90px;z-index:99990;background:#0D3B66;color:#fff;font:600 13px/1 'Heebo','Assistant',system-ui,sans-serif;padding:8px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(13,59,102,.25);pointer-events:none}" +
    ".ogenw-panel{position:fixed;bottom:92px;" + POSITION + ":20px;z-index:99991;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100dvh - 120px));display:none;flex-direction:column;border-radius:16px;overflow:hidden;box-shadow:0 24px 64px rgba(13,59,102,.3);direction:rtl;font-family:'Heebo','Assistant',system-ui,sans-serif;background:#EFEAE2}" +
    ".ogenw-panel.ogenw-open{display:flex}" +
    ".ogenw-header{display:flex;align-items:center;gap:10px;background:#0D3B66;color:#fff;padding:10px 14px;flex:0 0 auto}" +
    ".ogenw-header img{width:38px;height:38px;border-radius:50%;background:#F8FBFF}" +
    ".ogenw-header-meta{flex:1;min-width:0}" +
    ".ogenw-header-name{font-weight:700;font-size:15px}" +
    ".ogenw-header-status{font-size:12px;opacity:.85;display:flex;align-items:center;gap:5px}" +
    ".ogenw-header-dot{width:7px;height:7px;border-radius:50%;background:#3DDC97;display:inline-block}" +
    ".ogenw-close{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;padding:4px 8px;line-height:1}" +
    ".ogenw-body{flex:1;overflow-y:auto;padding:14px 12px;background:#EFEAE2 url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"80\" height=\"80\" opacity=\".04\"><circle cx=\"12\" cy=\"14\" r=\"5\" fill=\"%230D3B66\"/><circle cx=\"55\" cy=\"46\" r=\"7\" fill=\"%230D3B66\"/><circle cx=\"30\" cy=\"66\" r=\"4\" fill=\"%230D3B66\"/></svg>')}" +
    ".ogenw-msg{max-width:82%;margin:0 0 8px;padding:8px 12px;border-radius:10px;font-size:14.5px;line-height:1.55;color:#111B21;box-shadow:0 1px 1px rgba(0,0,0,.08);white-space:pre-wrap;word-wrap:break-word;position:relative;clear:both}" +
    ".ogenw-msg-bot{background:#FFFFFF;float:right;border-top-right-radius:2px}" +
    ".ogenw-msg-user{background:#D9FDD3;float:left;border-top-left-radius:2px}" +
    ".ogenw-msg a{color:#0D3B66;font-weight:600}" +
    ".ogenw-time{display:block;font-size:10.5px;color:#667781;text-align:left;margin-top:3px}" +
    ".ogenw-typing{display:inline-flex;gap:4px;align-items:center;padding:4px 2px}" +
    ".ogenw-typing span{width:7px;height:7px;border-radius:50%;background:#8696A0;animation:ogenw-blink 1.2s infinite}" +
    ".ogenw-typing span:nth-child(2){animation-delay:.2s}" +
    ".ogenw-typing span:nth-child(3){animation-delay:.4s}" +
    "@keyframes ogenw-blink{0%,80%,100%{opacity:.25}40%{opacity:1}}" +
    ".ogenw-composer{display:flex;gap:8px;align-items:flex-end;padding:8px 10px;background:#F0F2F5;flex:0 0 auto}" +
    ".ogenw-input{flex:1;border:none;border-radius:20px;padding:10px 14px;font:400 14.5px/1.4 'Heebo','Assistant',system-ui,sans-serif;resize:none;max-height:96px;outline:none;background:#fff;color:#111B21}" +
    ".ogenw-send{width:42px;height:42px;border-radius:50%;border:none;background:#0D3B66;color:#fff;cursor:pointer;flex:0 0 auto;display:flex;align-items:center;justify-content:center;transition:transform .15s ease}" +
    ".ogenw-send:hover{transform:scale(1.06)}" +
    ".ogenw-send:disabled{opacity:.5;cursor:default;transform:none}" +
    ".ogenw-send svg{transform:scaleX(-1)}" +
    ".ogenw-footer{text-align:center;font-size:11px;color:#667781;background:#F0F2F5;padding:0 0 6px}" +
    ".ogenw-footer a{color:#0D3B66;text-decoration:none;font-weight:600}" +
    "@media (max-width:480px){.ogenw-panel{bottom:0;" + POSITION + ":0;width:100vw;height:100dvh;border-radius:0}}" +
    ".ogenw-panel.ogenw-standalone{bottom:0;" + POSITION + ":0;width:100vw;height:100dvh;border-radius:0;box-shadow:none}" +
    ".ogenw-panel.ogenw-standalone .ogenw-close{display:none}";

  /* ============ בניית ה-DOM ============ */
  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function timeNow() {
    var d = new Date();
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }

  var style = el("style", null);
  style.textContent = css;
  document.head.appendChild(style);

  var launcher = el("button", "ogenw-launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-label", "שאל את עוגן");
  launcher.innerHTML = '<img src="' + AVATAR_URL + '" alt="">';

  var label = el("div", "ogenw-launcher-label", "שאל את עוגן");

  var panel = el("div", "ogenw-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "צ'אט עם עוגן");
  panel.innerHTML =
    '<div class="ogenw-header">' +
      '<img src="' + AVATAR_URL + '" alt="">' +
      '<div class="ogenw-header-meta">' +
        '<div class="ogenw-header-name">עוגן</div>' +
        '<div class="ogenw-header-status"><span class="ogenw-header-dot"></span>סוכנת הידע · מחוברת</div>' +
      "</div>" +
      '<button type="button" class="ogenw-close" aria-label="סגירה">✕</button>' +
    "</div>" +
    '<div class="ogenw-body"></div>' +
    '<div class="ogenw-composer">' +
      '<textarea class="ogenw-input" rows="1" placeholder="שאלו את עוגן..." aria-label="שאלו את עוגן"></textarea>' +
      '<button type="button" class="ogenw-send" aria-label="שליחה">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
      "</button>" +
    "</div>" +
    '<div class="ogenw-footer"><a href="' + FULL_APP_URL + '" target="_blank" rel="noopener">עוגן — האפליקציה המלאה ←</a></div>';

  var body = panel.querySelector(".ogenw-body");
  var input = panel.querySelector(".ogenw-input");
  var sendBtn = panel.querySelector(".ogenw-send");

  /* ============ הודעות ============ */
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function addMessage(kind, text) {
    var msg = el("div", "ogenw-msg ogenw-msg-" + kind,
      escapeHtml(text) + '<span class="ogenw-time">' + timeNow() + "</span>");
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
    return msg;
  }

  function addTyping() {
    var t = el("div", "ogenw-msg ogenw-msg-bot",
      '<span class="ogenw-typing"><span></span><span></span><span></span></span>');
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
    return t;
  }

  function answerToText(a) {
    a = a || {};
    var parts = [];
    if (a.summary) parts.push(a.summary);
    if (a.steps && a.steps.length) parts.push(a.steps.map(function (s, i) { return (i + 1) + ". " + s; }).join("\n"));
    if (a.important) parts.push("חשוב לדעת: " + a.important);
    return parts.join("\n\n") || "לא הצלחתי למצוא תשובה. נסו לנסח אחרת.";
  }

  function send() {
    var text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    input.style.height = "auto";
    addMessage("user", text);
    history.push({ role: "user", content: text });

    /* ברכה — מענה מיידי, בלי לפנות ל-AI */
    if (GREETING_RE.test(text)) {
      var typing = addTyping();
      setTimeout(function () {
        typing.remove();
        addMessage("bot", GREETING_REPLY);
        history.push({ role: "assistant", content: GREETING_REPLY });
      }, 700);
      return;
    }

    busy = true;
    sendBtn.disabled = true;
    var typingNode = addTyping();
    var historyBefore = history.slice(0, -1);

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutId = setTimeout(function () { if (controller) controller.abort(); }, 90000);

    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ question: text, history: historyBefore.slice(-6) }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        clearTimeout(timeoutId);
        typingNode.remove();
        /* ה-backend עוטף את התשובה: {ok: true, answer: {...}} */
        var answer = data && data.ok && data.answer && data.answer.summary ? data.answer : null;
        if (answer) {
          var reply = answerToText(answer);
          addMessage("bot", reply);
          history.push({ role: "assistant", content: reply });
        } else {
          addMessage("bot", "לא מצאתי לזה תשובה מבוססת במקורות שלי. נסו לנסח אחרת — או פתחו את עוגן המלא (הקישור למטה), שם אפשר לחפש גם במסמכים.");
        }
      })
      .catch(function () {
        clearTimeout(timeoutId);
        typingNode.remove();
        addMessage("bot", "משהו השתבש בדרך למקור. נסו שוב בעוד רגע 🙏");
      })
      .then(function () {
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      });
  }

  /* ============ אירועים ============ */
  var opened = false;
  function togglePanel() {
    var isOpen = panel.classList.toggle("ogenw-open");
    label.style.display = isOpen ? "none" : "";
    if (isOpen) {
      if (!opened) {
        opened = true;
        addMessage("bot", OPENING_MESSAGE);
        history.push({ role: "assistant", content: OPENING_MESSAGE });
      }
      input.focus();
    }
  }

  launcher.addEventListener("click", togglePanel);
  panel.querySelector(".ogenw-close").addEventListener("click", togglePanel);
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  input.addEventListener("input", function () {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 96) + "px";
  });

  function mount() {
    if (STANDALONE) {
      document.body.appendChild(panel);
      panel.classList.add("ogenw-standalone", "ogenw-open");
      opened = true;
      addMessage("bot", OPENING_MESSAGE);
      history.push({ role: "assistant", content: OPENING_MESSAGE });
      return;
    }
    document.body.appendChild(launcher);
    document.body.appendChild(label);
    document.body.appendChild(panel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
