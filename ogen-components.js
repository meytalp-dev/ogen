/*
  ogen-components.js
  Pure render functions: given data, return an HTML string. No global
  state is read here — that boundary is kept so a future move to a
  component framework or a live API only touches ogen-app.js.
*/

(function (global) {
  "use strict";

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  /* ============ Icons ============ */
  /* One consistent line-icon set, stroke-based, no fills, no mixing with emoji. */
  var ICONS = {
    document: '<path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V8h4"/><path d="M8.5 12.5h7M8.5 15.5h7M8.5 9.5h3"/>',
    checkCircle: '<circle cx="12" cy="12" r="8.5"/><path d="m8.3 12.3 2.4 2.4 5-5"/>',
    graduationCap: '<path d="M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9Z"/><path d="M6.5 11v4.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V11"/><path d="M21.5 9v6"/>',
    users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 9a2.6 2.6 0 1 0 0-5.2"/><path d="M18 14.2c2 .4 3.5 2 3.5 4.3"/>',
    sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    send: '<path d="m4 12 16-8-6 16-2.8-6.2L4 12Z"/>',
    minimize: '<path d="M5 12h14"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    externalArrow: '<path d="M8 16 16 8M9 8h7v7"/>',
    alertTriangle: '<path d="M12 4.5 21 19.5H3L12 4.5Z"/><path d="M12 10v4.2"/><circle cx="12" cy="17" r=".3" fill="currentColor" stroke="none"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.6M4 13a8 8 0 0 0 14.6 4.6"/><path d="M5 3.5V7h3.5M19 20.5V17h-3.5"/>',
    chevronLeft: '<path d="m14.5 6-6 6 6 6"/>',
    folder: '<path d="M3.5 6.5a1.5 1.5 0 0 1 1.5-1.5h4.2l2 2.5H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V6.5Z"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.3 3.9 5.1 3.9 8.5s-1.3 6.2-3.9 8.5c-2.6-2.3-3.9-5.1-3.9-8.5s1.3-6.2 3.9-8.5Z"/>'
  };

  function ogenIcon(name, size) {
    size = size || 18;
    var body = ICONS[name] || "";
    return '<svg class="ogen-icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + "</svg>";
  }

  /* ============ OgenEntity ============ */
  var ENTITY_STATE_LABEL = {
    idle: "עוגן במצב מנוחה",
    listening: "עוגן מקשיבה",
    searching: "עוגן מחפשת במקורות",
    found: "עוגן מצאה תשובה",
    warning: "עוגן מזהה צורך בבירור נוסף"
  };

  var ENTITY_SIZES = ["xs", "sm", "md", "lg", "hero"];
  var ENTITY_STATES = ["idle", "listening", "searching", "found", "warning"];

  function renderOgenEntity(opts) {
    opts = opts || {};
    var size = ENTITY_SIZES.indexOf(opts.size) !== -1 ? opts.size : "md";
    var state = ENTITY_STATES.indexOf(opts.state) !== -1 ? opts.state : "idle";
    var label = opts.label || ENTITY_STATE_LABEL[state] || "עוגן";

    return (
      '<span class="ogen-entity" data-size="' + size + '" data-state="' + state + '" role="img" aria-label="' + escapeHtml(label) + '">' +
        '<span class="ogen-entity__aura" aria-hidden="true"></span>' +
        '<picture class="ogen-entity__picture" aria-hidden="true">' +
          '<source srcset="assets/ogen-entity-v4-transparent.webp" type="image/webp">' +
          '<img class="ogen-entity__art" src="assets/ogen-entity-v4-transparent.png" alt="" width="1122" height="1402" decoding="async">' +
        "</picture>" +
        '<span class="ogen-entity__core" aria-hidden="true"></span>' +
        '<span class="ogen-entity__particles" aria-hidden="true">' +
          '<i class="ogen-entity__particle" style="--particle-x:-32%;--particle-y:-31%;--particle-delay:0ms"></i>' +
          '<i class="ogen-entity__particle" style="--particle-x:36%;--particle-y:-18%;--particle-delay:230ms"></i>' +
          '<i class="ogen-entity__particle" style="--particle-x:28%;--particle-y:30%;--particle-delay:460ms"></i>' +
          '<i class="ogen-entity__particle" style="--particle-x:-35%;--particle-y:22%;--particle-delay:690ms"></i>' +
        "</span>" +
        '<span class="ogen-entity__warning-ring" aria-hidden="true"></span>' +
      "</span>"
    );
  }

  /* ============ Authority badge ============ */
  var AUTHORITY_LABEL = {
    mandatory: "חובה",
    directive: "הנחיית מינהל",
    professional: "מידע מקצועי",
    suggestion: "הצעה פדגוגית"
  };

  function renderAuthorityBadge(type) {
    if (!Object.prototype.hasOwnProperty.call(AUTHORITY_LABEL, type)) return "";
    var label = AUTHORITY_LABEL[type];
    return '<span class="ogen-badge ogen-badge--' + type + '">' + escapeHtml(label) + "</span>";
  }

  /* ============ Evidence state ============ */
  var EVIDENCE = {
    supported: { icon: "✓", text: "מידע מבוסס" },
    partial: { icon: "◐", text: "נמצא מידע חלקי" },
    unsupported: { icon: "!", text: "לא נמצא בסיס מספיק" }
  };

  function renderEvidenceState(kind) {
    kind = Object.prototype.hasOwnProperty.call(EVIDENCE, kind) ? kind : "unsupported";
    var e = EVIDENCE[kind];
    return (
      '<span class="ogen-evidence ogen-evidence--' + kind + '">' +
        '<span class="ogen-evidence__icon" aria-hidden="true">' + e.icon + "</span>" +
        escapeHtml(e.text) +
      "</span>"
    );
  }

  /* ============ AI generated marker ============ */
  function renderAiMarker() {
    return '<span class="ogen-ai-marker">✨ נוצר על ידי עוגן</span>';
  }

  /* ============ Source card ============ */
  var SOURCE_TYPE = {
    website: { label: 'אתר ההיערכות תשפ"ז', icon: "globe" },
    managers: { label: "דרייב מנהלים", icon: "folder" },
    counseling: { label: "דרייב יועצים", icon: "folder" }
  };

  /* Real https links open in a new tab; relative links (the local
     היערכות site living next to this prototype) open in-place. */
  function isSafeSourceUrl(url) {
    return /^(https?:\/\/|\.\.?\/)/i.test(String(url || ""));
  }

  function renderSourceCard(source) {
    source = source || {};
    var sourceType = SOURCE_TYPE[source.type] ? source.type : "website";
    var type = SOURCE_TYPE[sourceType];
    var authorityBadge = source.authority ? renderAuthorityBadge(source.authority) : "";
    var sourceAction = isSafeSourceUrl(source.url)
      ? '<a class="ogen-source-card__link" href="' + escapeHtml(source.url) + '" data-source-link="true" target="_blank" rel="noopener noreferrer">' +
          "פתיחת המקור " + ogenIcon("chevronLeft", 15) +
        "</a>"
      : '<span class="ogen-source-card__link ogen-source-card__link--disabled" aria-disabled="true">המקור אינו זמין בתצוגת ההדגמה</span>';
    return (
      '<article class="ogen-source-card" data-source-type="' + sourceType + '">' +
        '<div class="ogen-source-card__top">' +
          '<span class="ogen-source-card__type">' + ogenIcon(type.icon, 16) + escapeHtml(type.label) + "</span>" +
          authorityBadge +
        "</div>" +
        '<div>' +
          '<div class="ogen-source-card__title">' + escapeHtml(source.title) + "</div>" +
          '<div class="ogen-source-card__meta">' + escapeHtml(source.section) + " · " + escapeHtml(source.date) + "</div>" +
        "</div>" +
        sourceAction +
      "</article>"
    );
  }

  function renderSourceList(sources) {
    return '<div class="ogen-source-list">' + sources.map(renderSourceCard).join("") + "</div>";
  }

  /* ============ Conflict banner ============ */
  function renderConflict(sources) {
    return (
      '<div class="ogen-conflict" role="status">' +
        ogenIcon("alertTriangle", 20) +
        "<span>מצאתי שתי הנחיות שאינן תואמות. אני מציגה את שתיהן כדי שתוכלו להחליט מה מתאים למקרה שלכם.</span>" +
      "</div>" +
      renderSourceList(sources)
    );
  }

  /* ============ Chips / suggested actions ============ */
  function renderChip(text, action) {
    return '<button type="button" class="ogen-chip" data-suggested-action="' + escapeHtml(action || text) + '">' + escapeHtml(text) + "</button>";
  }

  function renderChipRow(items) {
    if (!items || !items.length) return "";
    return '<div class="ogen-chip-row">' + items.map(function (t) { return renderChip(t); }).join("") + "</div>";
  }

  /* ============ Quick actions (home) ============ */
  function renderQuickAction(action) {
    return (
      '<button type="button" class="ogen-quick-action" data-quick-action="' + escapeHtml(action.id) + '">' +
        '<span class="ogen-quick-action__icon">' + ogenIcon(action.icon, 20) + "</span>" +
        '<span class="ogen-quick-action__title">' + escapeHtml(action.title) + "</span>" +
        '<span class="ogen-quick-action__desc">' + escapeHtml(action.desc) + "</span>" +
      "</button>"
    );
  }

  /* ============ "מה עכשיו?" task item ============ */
  function renderTask(task) {
    return (
      '<div class="ogen-task">' +
        '<span class="ogen-task__main">' +
          '<span class="ogen-task__dot ogen-task__dot--' + task.status + '"></span>' +
          '<span class="ogen-task__title">' + escapeHtml(task.title) + "</span>" +
        "</span>" +
        '<span class="ogen-task__due">' + escapeHtml(task.due) + "</span>" +
      "</div>"
    );
  }

  /* ============ Chat messages ============ */
  function renderUserMessage(text) {
    return '<div class="ogen-msg-user">' + escapeHtml(text) + "</div>";
  }

  function renderSearchingIndicator(text) {
    return (
      '<div class="ogen-searching" role="status" aria-live="polite">' +
        renderOgenEntity({ size: "sm", state: "searching" }) +
        '<span class="ogen-searching__text">' + escapeHtml(text) + "</span>" +
      "</div>"
    );
  }

  function renderSkeletonLines(n) {
    n = n || 3;
    var widths = ["92%", "78%", "60%"];
    var out = '<div class="ogen-answer">' +
      '<div class="ogen-answer__head">' + renderOgenEntity({ size: "xs", state: "searching" }) +
      '<span class="ogen-answer__name">עוגן</span></div><div style="display:flex;flex-direction:column;gap:10px;">';
    for (var i = 0; i < n; i++) {
      out += '<span class="ogen-skeleton" style="height:14px;width:' + (widths[i] || "70%") + ';display:block;"></span>';
    }
    out += "</div></div>";
    return out;
  }

  function renderAnswer(answer) {
    var blocks = "";

    blocks += '<div><div class="ogen-answer__block-title">בקצרה</div><p>' + escapeHtml(answer.summary) + "</p></div>";

    if (answer.steps && answer.steps.length) {
      blocks += '<div><div class="ogen-answer__block-title">מה צריך לעשות?</div><ol class="ogen-answer__steps">' +
        answer.steps.map(function (s) { return "<li>" + escapeHtml(s) + "</li>"; }).join("") +
        "</ol></div>";
    }

    if (answer.important) {
      blocks += '<div><div class="ogen-answer__block-title">חשוב לדעת</div><p>' + escapeHtml(answer.important) + "</p></div>";
    }

    if (answer.evidence) {
      blocks += renderEvidenceState(answer.evidence);
    }

    if (answer.aiGenerated) {
      blocks += renderAiMarker();
    }

    if (answer.conflictSources) {
      blocks += renderConflict(answer.conflictSources);
    } else if (answer.sources && answer.sources.length) {
      blocks += renderSourceList(answer.sources);
    }

    blocks += renderChipRow(answer.suggestedActions);

    return (
      '<div class="ogen-answer">' +
        '<div class="ogen-answer__head">' + renderOgenEntity({ size: "xs", state: answer.entityState || "found" }) +
        '<span class="ogen-answer__name">עוגן</span></div>' +
        '<div class="ogen-answer__body">' + blocks + "</div>" +
      "</div>"
    );
  }

  /* ============ Empty / error states ============ */
  function renderEmptyState() {
    return (
      '<div class="ogen-state-panel">' +
        renderOgenEntity({ size: "md", state: "warning" }) +
        '<h3 class="ogen-h3">לא מצאתי עדיין מקור מספק</h3>' +
        '<p class="ogen-state-panel__text">לא מצאתי עדיין מקור שמאפשר לי לענות על זה בוודאות. אפשר לנסות לנסח אחרת או לחפש במסמכים קשורים.</p>' +
        '<div class="ogen-state-panel__actions">' +
          '<button type="button" class="ogen-btn ogen-btn--secondary" data-demo-action="search-docs">חיפוש במסמכים</button>' +
          '<button type="button" class="ogen-btn ogen-btn--ghost" data-demo-action="rephrase">ניסוח מחדש</button>' +
        "</div>" +
      "</div>"
    );
  }

  function renderErrorState() {
    return (
      '<div class="ogen-state-panel" role="alert">' +
        renderOgenEntity({ size: "md", state: "warning" }) +
        '<h3 class="ogen-h3">משהו השתבש בדרך למקור</h3>' +
        '<p class="ogen-state-panel__text">אפשר לנסות שוב בעוד רגע.</p>' +
        '<div class="ogen-state-panel__actions">' +
          '<button type="button" class="ogen-btn ogen-btn--primary" data-demo-action="retry">' + ogenIcon("refresh", 16) + " נסו שוב</button>" +
        "</div>" +
      "</div>"
    );
  }

  global.OgenComponents = {
    escapeHtml: escapeHtml,
    icon: ogenIcon,
    renderOgenEntity: renderOgenEntity,
    renderAuthorityBadge: renderAuthorityBadge,
    renderEvidenceState: renderEvidenceState,
    renderAiMarker: renderAiMarker,
    renderSourceCard: renderSourceCard,
    renderSourceList: renderSourceList,
    renderConflict: renderConflict,
    renderChip: renderChip,
    renderChipRow: renderChipRow,
    renderQuickAction: renderQuickAction,
    renderTask: renderTask,
    renderUserMessage: renderUserMessage,
    renderSearchingIndicator: renderSearchingIndicator,
    renderSkeletonLines: renderSkeletonLines,
    renderAnswer: renderAnswer,
    renderEmptyState: renderEmptyState,
    renderErrorState: renderErrorState
  };
})(window);
