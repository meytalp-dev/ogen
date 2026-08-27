/*
  ogen-app.js
  Application state and event wiring for the עוגן chatbot.

  Retrieval is real: every question is matched against OgenKnowledge —
  grounded FAQ answers from מסמך ההיערכות תשפ"ז plus a resource index
  of דרייב המנהלים, דרייב היועצים ואתר ההיערכות. Every source card
  links to the actual document or folder. Answer *phrasing* is local
  (no LLM backend), so unanswered questions fall back honestly to the
  matching folders instead of guessing.
*/

(function () {
  "use strict";

  var C = window.OgenComponents;
  var K = window.OgenKnowledge;

  /* Real AI backend (Google Apps Script + Claude API).
     Set window.OGEN_BACKEND_URL in index.html to activate; when empty,
     the local keyword engine below answers on its own. */
  var BACKEND_URL = String(window.OGEN_BACKEND_URL || "").trim();

  /* ============ Hebrew keyword search ============ */
  function normalize(text) {
    return " " + String(text || "")
      .replace(/["'׳״`?!.,:;()\[\]\-–—]/g, " ")
      .replace(/\s+/g, " ")
      .trim() + " ";
  }

  function scoreKeywords(queryNorm, keywords) {
    var score = 0;
    for (var i = 0; i < keywords.length; i++) {
      var kw = normalize(keywords[i]).trim();
      if (!kw) continue;
      if (queryNorm.indexOf(kw) !== -1) {
        /* Longer keyword = more specific = stronger signal */
        score += Math.max(2, Math.min(kw.length, 14));
      }
    }
    return score;
  }

  function findFaq(text) {
    var q = normalize(text);
    var best = null, bestScore = 0;
    for (var i = 0; i < K.FAQ.length; i++) {
      var s = scoreKeywords(q, K.FAQ[i].keywords);
      if (s > bestScore) { bestScore = s; best = K.FAQ[i]; }
    }
    return bestScore >= 3 ? best : null;
  }

  function findResources(text, limit) {
    var q = normalize(text);
    var hits = [];
    for (var i = 0; i < K.INDEX.length; i++) {
      var s = scoreKeywords(q, K.INDEX[i].keywords);
      if (s > 0) hits.push({ score: s, source: K.INDEX[i].source });
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.slice(0, limit || 3).map(function (h) { return h.source; });
  }

  function faqById(id) {
    for (var i = 0; i < K.FAQ.length; i++) {
      if (K.FAQ[i].id === id) return K.FAQ[i];
    }
    return null;
  }

  /* ============ AI-drafted micro-actions (clearly marked as generated) ============ */
  function buildChecklistAnswer(fromSteps) {
    var steps = fromSteps && fromSteps.length ? fromSteps : faqById("process").answer.steps;
    var list = steps.map(function (s) { return "☐ " + s; }).join("\n");
    return {
      summary: "הפכתי את הצעדים לצ׳קליסט עבודה קצר שאפשר להעביר הלאה כמו שהוא — לישיבת צוות, למעקב אישי או ללוח משימות:",
      important: list,
      aiGenerated: true,
      entityState: "found",
      suggestedActions: ["נסחי הודעה לצוות"]
    };
  }

  function buildSimpleExplanation(fromAnswer) {
    var base = fromAnswer && fromAnswer.summary
      ? fromAnswer.summary
      : "צריך להגיש הצעת תכנון מסודרת, לקבל אישור מהגוף המפעיל, מהמפקח ומוועדת התכנון — ואז התכנון עולה למערכת.";
    return {
      summary: "בפשטות: " + base,
      aiGenerated: true,
      entityState: "found",
      suggestedActions: ["הפכי לצ'קליסט"]
    };
  }

  function buildTeamMessage() {
    return {
      summary: "טיוטת הודעה לצוות:",
      important: '"שלום לכולם, אנחנו נכנסים לתקופת ההיערכות לשנת תשפ"ז. בימים הקרובים נשלים את הצעת התכנון ואשתף אתכם בעיקריה בפגישת הצוות הקרובה. מי שיש לו רעיונות או צרכים מהשטח — זה הזמן להעלות אותם."',
      aiGenerated: true,
      entityState: "found",
      suggestedActions: []
    };
  }

  function buildMarketingPlan() {
    return {
      summary: "שלד תוכנית שיווק בית־ספרית לניצול סעיף 106 (עד 100 אש\"ח) — מתאים גם כתרגיל בחשיבה יזמית ושיווקית:",
      steps: [
        "יעד מדיד: כמה תלמידים חדשים רוצים לרשום עד 30.11? זה המספר שמנחה הכול",
        "קהלים: הורים, תלמידי כיתות ט', רשויות ומחלקות רווחה — מסר מותאם לכל קהל",
        "ערוצים: יום פתוח, סרטון תדמית, נוכחות ברשתות, שיתופי פעולה קהילתיים",
        "תקציב: חלוקה בין הפקה, פרסום ממומן ואירועים — עם 10% רזרבה",
        "מדידה: מאיפה הגיע כל נרשם? טופס קצר בכל נקודת מגע"
      ],
      important: "את התוכנית מגישים דרך המפקח לממונה חניכות ונוער, והאישור הסופי בוועדת התכנון.",
      aiGenerated: true,
      entityState: "found",
      sources: [{ type: "managers", title: "מסמך היערכות ותכנון תשפ\"ז — סעיף 106", section: "דרייב מנהלים · תכנון תשפז", date: 'ניסן תשפ"ו', authority: "directive", url: K.LINKS.planningPdf }],
      suggestedActions: ["הפכי לצ'קליסט", "נסחי הודעה לצוות"]
    };
  }

  /* ============ Domain answers — real folder maps by subject ============ */
  function buildPedagogyAnswer() {
    return {
      summary: "בתחום הפדגוגיה והצוות מרוכזים חומרי הפיתוח המקצועי, אוגדן השעות והליווי לבעלי תפקידים. אלו המקורות המרכזיים — כל קישור נפתח ישירות:",
      evidence: "supported",
      entityState: "found",
      sources: [
        { type: "managers", title: "פיתוח צוות — פיתוח מקצועי לעובדי הוראה ורכזים", section: "דרייב מנהלים · פיתוח צוות", date: "עודכן בדצמבר", authority: "professional", url: "https://drive.google.com/drive/folders/14ADJtud4O8_Ke71QVvP9iFlp0qfn6vD7" },
        { type: "managers", title: "אוגדן שעות (כולל אוגדן מסלול 45)", section: "דרייב מנהלים · אוגדן שעות", date: "עודכן ביולי 2026", authority: "directive", url: "https://drive.google.com/drive/folders/1_7xy-YenyrkwzVV0nTll8xX5MG2t8fYw" },
        { type: "managers", title: "מורים חונכים", section: "דרייב מנהלים", date: "עודכן בנובמבר", authority: "professional", url: "https://drive.google.com/drive/folders/1BFTo7pzI43UQC5IRTsi6y2gBFqAw5-d5" }
      ],
      suggestedActions: ["מה מקבל רכז חברתי?", "איפה אוגדן השעות?", "מה תהליך האישור?"]
    };
  }

  function buildWellbeingAnswer() {
    return {
      summary: "בתחום הייעוץ והרווחה מרוכזים כלי העבודה של היועצות: ערכת הייעוץ, שיעורי כישורי חיים, כלי מדידה ותוכניות התערבות. אלו המקורות המרכזיים:",
      evidence: "supported",
      entityState: "found",
      sources: [
        { type: "counseling", title: "ערכת הייעוץ", section: "דרייב יועצים", date: "עודכן בספטמבר", authority: "professional", url: "https://drive.google.com/drive/folders/1XExgVWe9AtZLp0qEmNh-fEVJCYsKSikE" },
        { type: "counseling", title: "כישורי חיים — שיעורים וחומרי פיקוח", section: "דרייב יועצים · כישורי חיים", date: "עודכן באוגוסט", authority: "professional", url: "https://drive.google.com/drive/folders/1t6g3Xp-uXn_bRWVPP7XVDzavg0NlK50I" },
        { type: "counseling", title: "שאלונים ומדידה (כולל שאלוני מצוקה)", section: "דרייב יועצים", date: "עודכן ביולי", authority: "professional", url: "https://drive.google.com/drive/folders/1457MlngML7xHBNNkslRQ9oujWC7QxRYp" },
        { type: "counseling", title: "התוכנית למניעת נשירה בחברה הערבית", section: "דרייב יועצים", date: "עודכן בנובמבר", authority: "professional", url: "https://drive.google.com/drive/folders/1ZnOM_3MRV88uvoGnHQ_-eLd46p-ZdAEY" }
      ],
      suggestedActions: ["יש חומרים על מניעת נשירה?", "איפה שאלוני מצוקה?"]
    };
  }

  /* ============ Hub answers — real folder maps ============ */
  function buildManagersHubAnswer() {
    return {
      summary: "דרייב המנהלים מרכז את חומרי הניהול והתכנון לתשפ\"ז. אלו התיקיות המרכזיות — כל קישור נפתח ישירות בדרייב:",
      evidence: "supported",
      entityState: "found",
      sources: [
        { type: "managers", title: "תכנון תשפז — מסמך ההיערכות", section: "דרייב מנהלים", date: "עודכן במרץ 2026", authority: "directive", url: K.LINKS.planningPdf },
        { type: "managers", title: "אוגדן שעות", section: "דרייב מנהלים", date: "עודכן ביולי 2026", authority: "directive", url: "https://drive.google.com/drive/folders/1_7xy-YenyrkwzVV0nTll8xX5MG2t8fYw" },
        { type: "managers", title: "פיתוח צוות · עובדי הוראה · מורים חונכים · ועדה מלווה · תקציב", section: "דרייב מנהלים — התיקייה הראשית", date: "מתעדכן שוטף", authority: "professional", url: K.LINKS.managersDrive }
      ],
      suggestedActions: ["מה תהליך האישור?", "מה לוח הזמנים?", "אילו תקציבים תוספתיים יש?"]
    };
  }

  function buildCounselorsHubAnswer() {
    return {
      summary: "דרייב היועצים מרכז את חומרי הייעוץ וההדרכה. אלו המאגרים המרכזיים — כל קישור נפתח ישירות בדרייב:",
      evidence: "supported",
      entityState: "found",
      sources: [
        { type: "counseling", title: "ערכת הייעוץ", section: "דרייב יועצים", date: "עודכן בספטמבר", authority: "professional", url: "https://drive.google.com/drive/folders/1XExgVWe9AtZLp0qEmNh-fEVJCYsKSikE" },
        { type: "counseling", title: "כישורי חיים · שאלונים ומדידה · אס\"א", section: "דרייב יועצים — התיקייה הראשית", date: "מתעדכן שוטף", authority: "professional", url: K.LINKS.counselorsDrive },
        { type: "counseling", title: "למידת עמיתים ולמידה מהצלחות", section: "דרייב יועצים · למידת עמיתים", date: "עודכן במאי 2025", authority: "suggestion", url: "https://drive.google.com/drive/folders/1iqlIeGgnGFU5UuTAcR_R5hqQhzEvmz3W" }
      ],
      suggestedActions: ["יש חומרים על מניעת נשירה?", "מה תהליך האישור?"]
    };
  }

  /* ============ Welcome / quick-action content — by subject domain ============ */
  var QUICK_ACTIONS = [
    { id: "planning", icon: "document", title: "תכנון והיערכות", desc: "תהליך האישור, לוח הזמנים וכללי המסגרת לתשפ\"ז", ask: "מה תהליך האישור של הצעת התכנון לתשפ\"ז?" },
    { id: "budgets", icon: "checkCircle", title: "תקציב ומשאבים", desc: "סעיפי התקצוב התוספתי, שעות ותקציב שיווק", ask: "אילו תקציבים תוספתיים יש?" },
    { id: "pedagogy", icon: "graduationCap", title: "פדגוגיה וצוות", desc: "פיתוח מקצועי, אוגדן שעות, רכזים וחונכים", ask: "אילו חומרים יש בתחום הפדגוגיה ופיתוח הצוות?" },
    { id: "wellbeing", icon: "users", title: "ייעוץ ורווחה", desc: "כישורי חיים, שאלונים, אס\"א ומניעת נשירה", ask: "אילו חומרים יש בתחום הייעוץ והרווחה?" },
    { id: "build", icon: "sparkles", title: "בנו לי משהו", desc: "צ'קליסט, הודעה לצוות או תוכנית שיווק", ask: "בנו לי צ'קליסט להיערכות לתשפ\"ז" }
  ];

  var EXAMPLE_QUESTIONS = [
    "מתי מתכנסת ועדת התכנון?",
    "כמה תקציב שיווק יש?",
    "כמה תלמידים צריך לכיתה חדשה?",
    "איפה חומרי כישורי חיים?",
    "מה מקבל בית ספר צומח?"
  ];

  /* ============ App state ============ */
  var state = {
    timeouts: [],
    lastAnswer: null,
    lastAnswerSteps: null,
    welcomeShown: true,
    history: []          // {role, content} — conversation memory for the AI backend
  };

  var el = {}; // filled on init

  function schedule(fn, delay) {
    var id = setTimeout(fn, delay);
    state.timeouts.push(id);
    return id;
  }

  function scrollToBottom() {
    el.conversation.scrollTop = el.conversation.scrollHeight;
  }

  function appendNode(html, shouldScroll) {
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    var node = wrap.firstElementChild;
    el.conversation.appendChild(node);
    if (shouldScroll !== false) scrollToBottom();
    return node;
  }

  function dismissWelcome() {
    if (!state.welcomeShown) return;
    state.welcomeShown = false;
    var welcome = document.getElementById("ogen-welcome");
    if (welcome) welcome.remove();
  }

  /* ============ Welcome screen ============ */
  function renderHubs() {
    return '<div class="ogen-hubs">' + K.HUBS.map(function (h) {
      var external = h.external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return (
        '<a class="ogen-hub" href="' + C.escapeHtml(h.url) + '"' + external + '>' +
          '<span class="ogen-hub__icon">' + C.icon(h.icon, 19) + "</span>" +
          '<span class="ogen-hub__meta">' +
            '<span class="ogen-hub__title">' + C.escapeHtml(h.title) + "</span>" +
            '<span class="ogen-hub__desc">' + C.escapeHtml(h.desc) + "</span>" +
          "</span>" +
          '<span class="ogen-hub__open" aria-hidden="true">' + C.icon("externalArrow", 15) + "</span>" +
        "</a>"
      );
    }).join("") + "</div>";
  }

  /* תגיות נושא במסך הפתיחה — לחיצה שולחת שאלה מוכנה */
  var TOPIC_TAGS = [
    { label: "נהלים והנחיות", ask: 'אילו נהלים והנחיות חשוב להכיר לקראת תשפ"ז?' },
    { label: "תהליך אישור התכנון", ask: "מה תהליך אישור התכנון?" },
    { label: "לוחות זמנים", ask: 'מהם לוחות הזמנים החשובים לתשפ"ז?' },
    { label: "תקציבים תוספתיים", ask: "אילו תקציבים תוספתיים יש?" },
    { label: "ייעוץ ורווחה", ask: "אילו חומרי ייעוץ ורווחה זמינים?" },
    { label: "חומרים בדרייב", ask: "מה יש בדרייב המנהלים?" },
    { label: "בנו לי תוצר", ask: "בנו לי צ'קליסט לתחילת שנה" }
  ];

  function renderWelcome() {
    var quickActionsHtml = QUICK_ACTIONS.map(function (a) {
      return C.renderQuickAction(a);
    }).join("");

    var topicTagsHtml = TOPIC_TAGS.map(function (t) {
      return '<button type="button" class="ogen-chip" data-ask="' + C.escapeHtml(t.ask) + '">' + C.escapeHtml(t.label) + "</button>";
    }).join("");

    var exampleChips = EXAMPLE_QUESTIONS.map(function (q) {
      return '<button type="button" class="ogen-chip" data-ask="' + C.escapeHtml(q) + '">' + C.escapeHtml(q) + "</button>";
    }).join("");

    return (
      '<div id="ogen-welcome" class="ogen-welcome">' +
        '<div class="ogen-welcome__hero">' +
          '<div class="ogen-welcome__entity">' + C.renderOgenEntity({ size: "hero", state: "idle" }) + "</div>" +
          '<div class="ogen-welcome__copy">' +
            '<span class="ogen-welcome__eyebrow">עוגן · סוכנת ידע מחוברת</span>' +
            '<h1 class="ogen-hero-title">ידע שמניע את העבודה קדימה.</h1>' +
            '<p class="ogen-welcome__lede">אני כאן כדי לחסוך לכם את החיפוש — נהלים, הנחיות, טפסים ותהליכים, עם הקישור למסמך עצמו. שאלו אותי כל דבר, גם אם זה נשמע לכם שאלה קטנה.</p>' +
            '<div class="ogen-chip-row ogen-welcome__tags">' + topicTagsHtml + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="ogen-welcome__section-head"><span>מקורות מחוברים</span><span aria-hidden="true">01</span></div>' +
        renderHubs() +
        '<div class="ogen-welcome__section-head"><span>אפשר להתחיל מכאן</span><span aria-hidden="true">02</span></div>' +
        '<div class="ogen-quick-actions" id="ogen-quick-actions">' + quickActionsHtml + "</div>" +
        '<div class="ogen-welcome__demos">' +
          '<p class="ogen-text-meta">שאלות לדוגמה:</p>' +
          '<div class="ogen-chip-row">' + exampleChips + "</div>" +
        "</div>" +
      "</div>"
    );
  }

  /* ============ Ask flow — AI backend with local fallback ============ */
  function rememberAnswer(answer) {
    state.lastAnswer = answer;
    state.lastAnswerSteps = answer.steps || state.lastAnswerSteps;
    var memo = answer.summary || "";
    if (answer.steps && answer.steps.length) memo += "\n" + answer.steps.join("\n");
    state.history.push({ role: "assistant", content: memo });
  }

  /* ברכת שלום נענית מיד, בלי לפנות ל-AI — כמו בצ'אט אנושי */
  var GREETING_RE = /^(שלום|היי+|הי|אהלן|הלו|בוקר טוב|ערב טוב|צהריים טובים|מה נשמע|מה שלומך|hi|hello|hey)[\s!?.,]*$/i;
  var GREETING_REPLIES = [
    "שלום לך! 😊 טוב שהגעתם. מה מעסיק אתכם היום?",
    "היי! אני כאן — עם כל הנהלים, בלי לחפש בדרייב 'סופי-סופי-2'. מה תרצו לדעת?",
    "שלום! הגעתם למקום הנכון לשאול. מה הכי בוער עכשיו?",
    "אהלן! קחו נשימה, ותשאלו בשקט. מה צריך?"
  ];
  function greetingReply() {
    return GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)];
  }

  function renderGreetingReply(text) {
    return (
      '<div class="ogen-answer">' +
        '<div class="ogen-answer__head">' + C.renderOgenEntity({ size: "xs", state: "found" }) +
        '<span class="ogen-answer__name">עוגן</span></div>' +
        '<div class="ogen-answer__body"><p>' + C.escapeHtml(text) + "</p></div>" +
      "</div>"
    );
  }

  function ask(text) {
    var trimmed = (text || "").trim();
    if (!trimmed) return;
    dismissWelcome();
    appendNode(C.renderUserMessage(trimmed));
    state.history.push({ role: "user", content: trimmed });

    if (GREETING_RE.test(trimmed)) {
      var hello = greetingReply();
      state.history.push({ role: "assistant", content: hello });
      appendNode(renderGreetingReply(hello));
      return;
    }

    if (BACKEND_URL) {
      askBackend(trimmed);
    } else {
      answerLocally(trimmed);
    }
  }

  /* --- Real AI: send the question (plus recent history) to the backend --- */
  function normalizeBackendAnswer(a) {
    a = a || {};
    var evidence = ["supported", "partial", "unsupported"].indexOf(a.evidence) !== -1 ? a.evidence : null;
    return {
      summary: String(a.summary || ""),
      steps: Array.isArray(a.steps) ? a.steps.map(String).filter(Boolean) : [],
      important: a.important ? String(a.important) : "",
      evidence: evidence,
      aiGenerated: true,
      entityState: evidence === "supported" ? "found" : "warning",
      sources: Array.isArray(a.sources) ? a.sources.slice(0, 4) : [],
      suggestedActions: Array.isArray(a.suggestedActions) ? a.suggestedActions.slice(0, 3).map(String) : []
    };
  }

  /* משפטים קלילים למנהלים — מוצגים בסבב בזמן שעוגן חושבת */
  var WAITING_QUIPS = [
    "מדפדפת בנספח ג'... כמו כל מנהל בתחילת שנה 😉",
    "מחפשת איפה בדיוק שמו את הקובץ בדרייב... נשמע מוכר? 😄",
    "סופרת ש\"ש... 26, 27, 28... עוד רגע מסיימת ☕",
    "בודקת שאף תלמיד לא חורג ממכסת נספח א'...",
    "מנסחת תשובה שתעבור גם ועדה מלווה 😉",
    "מתאמת עם המפקח הפדגוגי... זה תמיד לוקח רגע 😄",
    "רגע של שקט בחדר מנהלים — נצלו אותו, התשובה בדרך ☕",
    "עוברת על אוגדן השעות... מבטיחה לא להירדם 😴",
    "התשובה כמעט מוכנה — מהר יותר ממערכת שעות בספטמבר 😄",
    "בודקת פעמיים, כמו לפני ישיבת הורים 😉",
    "מחממת את המוח... המזגן בחדר מורים עדיין לא עובד? ❄️",
    "עונה מהר יותר ממורה שרואה את המנהל במסדרון 🏃",
    "רק מוודאת שאין צלצול באמצע התשובה 🔔",
    "מסדרת את התשובה בנקודות — כמו מערכת בלי חלונות, חלום 😄",
    "עוד שנייה... גם ועדת התכנון לא מתכנסת ביום אחד 😉",
    "מחפשת בדרייב... הפעם בלי 'עותק של עותק של סופי-סופי' 📁",
    "התשובה בדרך — מהר יותר ממענה ממשרד ממשלתי 😇",
    "קוראת את הנוהל — ואת הנוהל שמעדכן את הנוהל 📄",
    "מוצאת לכם את הקישור המדויק, שלא תחפשו לבד 🔗",
    "נושמת עמוק במקומכם... שנייה ואני איתכם 🌬️",
    "עוד רגע — ובינתיים, מגיע לכם קפה ☕",
    "מוודאת שהתשובה תהיה קצרה. גם לי נמאס ממסמכים ארוכים 😄",
  ];

  function askBackend(question) {
    var searchNode = appendNode(C.renderSearchingIndicator("עוגן חושבת על התשובה..."));
    var quipIndex = Math.floor(Math.random() * WAITING_QUIPS.length);
    var quipTimer = setInterval(function () {
      var el = searchNode.querySelector(".ogen-searching__text");
      if (el) el.textContent = WAITING_QUIPS[quipIndex % WAITING_QUIPS.length];
      quipIndex++;
    }, 3200);
    var historyBeforeQuestion = state.history.slice(0, -1);
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutId = setTimeout(function () { if (controller) controller.abort(); }, 90000);

    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ question: question, history: historyBeforeQuestion.slice(-6) }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        clearTimeout(timeoutId);
        clearInterval(quipTimer);
        searchNode.remove();
        if (data && data.ok && data.answer && data.answer.summary) {
          var answer = normalizeBackendAnswer(data.answer);
          rememberAnswer(answer);
          appendNode(C.renderAnswer(answer));
        } else {
          answerLocally(question);
        }
      })
      .catch(function () {
        clearTimeout(timeoutId);
        clearInterval(quipTimer);
        searchNode.remove();
        answerLocally(question);
      });
  }

  /* --- Local keyword engine — offline fallback --- */
  function answerLocally(trimmed) {
    if (trimmed.indexOf("דרייב המנהלים") !== -1 || trimmed.indexOf("דרייב מנהלים") !== -1) {
      runSearchThenRender(["עוגן ממפה את דרייב המנהלים..."], function () {
        var a = buildManagersHubAnswer(); rememberAnswer(a); return C.renderAnswer(a);
      });
      return;
    }
    if (trimmed.indexOf("דרייב היועצים") !== -1 || trimmed.indexOf("דרייב יועצים") !== -1) {
      runSearchThenRender(["עוגן ממפה את דרייב היועצים..."], function () {
        var a = buildCounselorsHubAnswer(); rememberAnswer(a); return C.renderAnswer(a);
      });
      return;
    }
    if (trimmed.indexOf("פדגוגיה") !== -1) {
      runSearchThenRender(["עוגן אוספת את חומרי הפדגוגיה..."], function () {
        var a = buildPedagogyAnswer(); rememberAnswer(a); return C.renderAnswer(a);
      });
      return;
    }
    if (trimmed.indexOf("ייעוץ והרווחה") !== -1 || trimmed.indexOf("רווחה") !== -1) {
      runSearchThenRender(["עוגן אוספת את חומרי הייעוץ..."], function () {
        var a = buildWellbeingAnswer(); rememberAnswer(a); return C.renderAnswer(a);
      });
      return;
    }

    var faq = findFaq(trimmed);
    if (faq) {
      runSearchThenRender(["עוגן מחפשת במקורות המחוברים...", "מצאתי — מנסחת תשובה מבוססת..."], function () {
        rememberAnswer(faq.answer);
        return C.renderAnswer(faq.answer);
      });
      return;
    }

    var resources = findResources(trimmed, 3);
    if (resources.length) {
      runSearchThenRender(["עוגן מחפשת במקורות המחוברים..."], function () {
        var answer = {
          summary: "לא מצאתי תשובה מנוסחת לשאלה הזו, אבל מצאתי את המקורות הרלוונטיים ביותר במאגרים המחוברים — כל קישור נפתח ישירות:",
          evidence: "partial",
          entityState: "warning",
          sources: resources,
          suggestedActions: ["מה תהליך האישור?", "אילו תקציבים תוספתיים יש?"]
        };
        rememberAnswer(answer);
        return C.renderAnswer(answer);
      });
      return;
    }

    runSearchThenRender(["עוגן מחפשת במקורות המחוברים..."], function () {
      return C.renderEmptyState();
    });
  }

  function runSearchThenRender(searchSteps, buildFinalHtml, isError) {
    var searchNode = appendNode(C.renderSearchingIndicator(searchSteps[0]));

    var t = 0;
    for (var i = 1; i < searchSteps.length; i++) {
      t += 900;
      (function (text, delay) {
        schedule(function () {
          searchNode.querySelector(".ogen-searching__text").textContent = text;
        }, delay);
      })(searchSteps[i], t);
    }

    t += 900;
    schedule(function () {
      searchNode.remove();
      var node = appendNode(buildFinalHtml());
      if (isError) node.setAttribute("role", "alert");
      scrollToBottom();
    }, t);
  }

  function runGenerated(userText, workingText, buildAnswer) {
    dismissWelcome();
    appendNode(C.renderUserMessage(userText));
    state.history.push({ role: "user", content: userText });
    runSearchThenRender([workingText], function () {
      var answer = buildAnswer();
      rememberAnswer(answer);
      return C.renderAnswer(answer);
    });
  }

  /* ============ Suggested-action handling ============ */
  var ACTION_HANDLERS = {
    "הפכי לצ'קליסט": function () {
      runGenerated("הפכי לצ'קליסט", "עוגן מכינה צ'קליסט...", function () {
        return buildChecklistAnswer(state.lastAnswerSteps);
      });
    },
    "הסבירי בפשטות": function () {
      runGenerated("הסבירי בפשטות", "עוגן מפשטת את התשובה...", function () {
        return buildSimpleExplanation(state.lastAnswer);
      });
    },
    "נסחי הודעה לצוות": function () {
      runGenerated("נסחי הודעה לצוות", "עוגן מנסחת הודעה...", function () {
        return buildTeamMessage();
      });
    },
    "בנו לי תוכנית שיווק": function () {
      runGenerated("בנו לי תוכנית שיווק", "עוגן בונה שלד תוכנית...", function () {
        return buildMarketingPlan();
      });
    },
    "מה תהליך האישור?": function () { ask("מה תהליך האישור של הצעת התכנון?"); },
    "מה לוח הזמנים?": function () { ask("מה לוח הזמנים של ועדת התכנון?"); },
    "אילו תקציבים תוספתיים יש?": function () { ask("אילו תקציבים תוספתיים יש?"); },
    "כמה תקציב שיווק יש?": function () { ask("כמה תקציב שיווק יש?"); },
    "מה מקבל רכז חברתי?": function () { ask("מה מקבל רכז חברתי?"); },
    "אילו כללי מסגרת חלים?": function () { ask("מה כללי המסגרת לתכנון?"); },
    "יש חומרים על מניעת נשירה?": function () { ask("יש חומרים על מניעת נשירה?"); },
    "חיפוש במסמכים": function () { ask("מה יש בדרייב המנהלים?"); },
    "ניסוח מחדש": function () { el.textarea.focus(); }
  };

  document.addEventListener("click", function (evt) {
    var chip = evt.target.closest("[data-suggested-action]");
    if (chip) {
      var actionText = chip.getAttribute("data-suggested-action");
      if (actionText === "ניסוח מחדש") { el.textarea.focus(); return; }
      /* With a live AI backend, every chip becomes a real question;
         offline, the scripted handlers answer instead. */
      if (BACKEND_URL) { ask(actionText); return; }
      var handler = ACTION_HANDLERS[actionText];
      if (handler) handler();
      else ask(actionText);
      return;
    }

    var askChip = evt.target.closest("[data-ask]");
    if (askChip) {
      ask(askChip.getAttribute("data-ask"));
      return;
    }

    var demoAction = evt.target.closest("[data-demo-action]");
    if (demoAction) {
      var key = demoAction.getAttribute("data-demo-action");
      if (key === "search-docs") ask("מה יש בדרייב המנהלים?");
      if (key === "rephrase") el.textarea.focus();
      if (key === "retry") ask("מה תהליך האישור של הצעת התכנון?");
      return;
    }

    var quickAction = evt.target.closest("[data-quick-action]");
    if (quickAction) {
      var qa = QUICK_ACTIONS.filter(function (a) { return a.id === quickAction.getAttribute("data-quick-action"); })[0];
      if (!qa) return;
      if (BACKEND_URL) { ask(qa.ask); return; }
      if (qa.id === "build") {
        runGenerated(qa.ask, "עוגן מכינה צ'קליסט...", function () {
          return buildChecklistAnswer(faqById("timeline").answer.steps);
        });
      } else if (qa.id === "pedagogy") {
        runGenerated(qa.ask, "עוגן אוספת את חומרי הפדגוגיה...", function () { return buildPedagogyAnswer(); });
      } else if (qa.id === "wellbeing") {
        runGenerated(qa.ask, "עוגן אוספת את חומרי הייעוץ...", function () { return buildWellbeingAnswer(); });
      } else {
        ask(qa.ask);
      }
      return;
    }
  });

  /* ============ Composer ============ */
  function autosizeTextarea() {
    el.textarea.style.height = "auto";
    el.textarea.style.height = Math.min(el.textarea.scrollHeight, 120) + "px";
  }

  function handleSend() {
    var text = el.textarea.value;
    if (!text.trim()) return;
    ask(text);
    el.textarea.value = "";
    autosizeTextarea();
    el.sendBtn.disabled = true;
  }

  function wireComposer() {
    el.textarea.addEventListener("input", function () {
      autosizeTextarea();
      el.sendBtn.disabled = !el.textarea.value.trim();
    });

    el.textarea.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" && !evt.shiftKey) {
        evt.preventDefault();
        handleSend();
      }
    });

    el.sendBtn.addEventListener("click", handleSend);
    el.sendBtn.disabled = true;

    el.composerForm.addEventListener("submit", function (evt) {
      evt.preventDefault();
      handleSend();
    });
  }

  /* ============ Init ============ */
  function init() {
    el.conversation = document.getElementById("ogen-chat-conversation");
    el.textarea = document.getElementById("ogen-chat-textarea");
    el.sendBtn = document.getElementById("ogen-chat-send");
    el.composerForm = document.getElementById("ogen-composer-form");
    el.headerEntitySlot = document.getElementById("ogen-chat-header-entity-slot");

    el.headerEntitySlot.outerHTML = C.renderOgenEntity({ size: "xs", state: "idle" });
    el.sendBtn.innerHTML = C.icon("send", 18);

    var statusEl = document.querySelector(".ogen-chat-header__status");
    if (statusEl && BACKEND_URL) {
      statusEl.innerHTML = '<span class="ogen-chat-header__status-dot" aria-hidden="true"></span> מחוברת · AI פעיל';
      statusEl.setAttribute("aria-label", "מצב המערכת: מחוברת למוח AI ולשלושה מאגרי ידע");
    }

    wireComposer();
    appendNode(renderWelcome(), false);
    el.conversation.scrollTop = 0;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
