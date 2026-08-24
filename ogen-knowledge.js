/*
  ogen-knowledge.js
  Real knowledge base for the עוגן chatbot.

  Every URL here is a real, working link:
  - אתר ההיערכות תשפ"ז — the local work-plans system (same folder tree).
  - דרייב מנהלים — Google Drive folder 1-qrq5zqAzQIHNioklhwxuSasFpuNVc17
  - דרייב יועצים — Google Drive folder 1kjAS46iIFWbluTQDQtcvlsEfYC98kzuv
  The FAQ answers are grounded in "מסמך היערכות ותכנון לגופים מפעילים תשפז"
  (משרד העבודה, ניסן תשפ"ו) — the source PDF is linked from every answer.
*/

(function (global) {
  "use strict";

  var MANAGERS_DRIVE = "https://drive.google.com/drive/folders/1-qrq5zqAzQIHNioklhwxuSasFpuNVc17";
  var COUNSELORS_DRIVE = "https://drive.google.com/drive/folders/1kjAS46iIFWbluTQDQtcvlsEfYC98kzuv";
  var PLANNING_PDF = "https://drive.google.com/file/d/15IyOMOodbuTswQmtGZYyoVsAR4OS6bSV/view";
  var SITE_LOCAL = "../תוכניות-עבודה-בית-ספריות.html";

  /* The main planning-document source card, reused by most FAQ answers. */
  var PLANNING_SOURCE = {
    type: "managers",
    title: "מסמך היערכות ותכנון לגופים מפעילים תשפ\"ז",
    section: "דרייב מנהלים · תכנון תשפז",
    date: 'ניסן תשפ"ו · 24.3.2026',
    authority: "directive",
    url: PLANNING_PDF
  };

  var SITE_SOURCE = {
    type: "website",
    title: "מערכת תוכניות עבודה בית־ספריות",
    section: "אתר ההיערכות לשנת תשפ\"ז",
    date: 'תשפ"ז · עודכן באוגוסט',
    authority: "professional",
    url: SITE_LOCAL
  };

  /* ============ Connected hubs (welcome strip) ============ */
  var HUBS = [
    {
      id: "site",
      icon: "globe",
      title: "אתר ההיערכות תשפ\"ז",
      desc: "מערכת תוכניות העבודה הבית־ספריות",
      url: SITE_LOCAL,
      external: false
    },
    {
      id: "managers",
      icon: "folder",
      title: "דרייב מנהלים",
      desc: "תכנון, אוגדן שעות, פיתוח צוות ותקציב",
      url: MANAGERS_DRIVE,
      external: true
    },
    {
      id: "counselors",
      icon: "folder",
      title: "דרייב יועצים",
      desc: "ערכת ייעוץ, כישורי חיים, שאלונים ומדידה",
      url: COUNSELORS_DRIVE,
      external: true
    }
  ];

  /* ============ FAQ — grounded answers from the planning document ============ */
  var FAQ = [
    {
      id: "process",
      keywords: ["תהליך", "אישור", "הצעת תכנון", "נספח ג", "איך מגישים", "הגשה", "תוכנית עבודה", "תכנית עבודה", "ועדת תכנון", "ספייסנייס", "מי מאשר"],
      answer: {
        summary: "הצעת התכנון לתשפ\"ז עוברת ארבע תחנות אישור: מנהל בית הספר, הגוף המפעיל, המפקח הפדגוגי וועדת התכנון. ההגשה נעשית על גבי הפורמט של נספח ג' במסמך ההיערכות.",
        steps: [
          "מנהל בית הספר מעביר את הצעת התכנון לאישור מקדים של הגוף המפעיל",
          "הגוף המפעיל מגיש את ההצעה על גבי נספח ג' לבחינת המפקח הפדגוגי",
          "המפקח מוודא שההצעה תקינה ועומדת בדרישות המינהל ומעבירה לוועדת התכנון",
          "לאחר אישור הוועדה — נציג המחוז מעלה את התכנון המאושר למערכת הספייסנייס"
        ],
        important: "תכנון שלא יוגש במועדו יידחה לכינוס הבא של ועדת התכנון — שימו לב ללוח הזמנים.",
        evidence: "supported",
        entityState: "found",
        sources: [PLANNING_SOURCE, SITE_SOURCE],
        suggestedActions: ["הפכי לצ'קליסט", "מה לוח הזמנים?", "נסחי הודעה לצוות"]
      }
    },
    {
      id: "timeline",
      keywords: ["לוח זמנים", "מתי", "מועד", "תאריך", "דדליין", "כינוס", "מצבת", "קליטת תלמידים", "30.11", "1.12"],
      answer: {
        summary: "ועדת התכנון מתכנסת שלוש פעמים לקראת תשפ\"ז, וקליטת תלמידים מסתיימת בסוף נובמבר.",
        steps: [
          "תכנון ראשוני: 16.4.2026 – 23.4.2026",
          "תכנון שני: 20.7.2026",
          "תכנון שלישי: אוקטובר 2026 (במהלך שנת הלימודים)",
          "קליטת תלמידים לכל הכיתות: עד 30.11.2026",
          "סגירת מצבת תלמידים תשפ\"ז: 1.12.2026"
        ],
        important: "תכנון שלא יוגש במועד יידחה אוטומטית לכינוס הבא של הוועדה — תכננו אחורה מהתאריכים האלה.",
        evidence: "supported",
        entityState: "found",
        sources: [PLANNING_SOURCE],
        suggestedActions: ["הפכי לצ'קליסט", "מה תהליך האישור?", "נסחי הודעה לצוות"]
      }
    },
    {
      id: "framework",
      keywords: ["כללי מסגרת", "מכסה", "כמה תלמידים", "כיתה חדשה", "חינוך מיוחד", "מסלול", "חריגה", "15 תלמידים", "25%", "10%", "מגמה"],
      answer: {
        summary: "מסגרת התכנון נשענת על מכסת התלמידים המאושרת בנספח א' — חריגה ממנה לא תאושר ולא תתוקצב. אלה הכללים המרכזיים:",
        steps: [
          "כיתה חדשה נפתחת רק עם 15 תלמידים לפחות",
          "שיעור תלמידי החינוך המיוחד — עד 25% מכלל תלמידי בית הספר",
          "מסלולים 59 (כיתות המשך), 63 (של\"צ) ו־64 (אופק תעסוקתי) — עד 10% מהתלמידים",
          "מגמה עם מספרים לא יציבים שלוש שנים ומדדי התמדה נמוכים — פתיחת כיתה חדשה בה טעונה אישור ועדת התכנון",
          "הגדלת מכסה מחייבת תיק קליטה מלא לכל תלמיד ואישור המפקח הפדגוגי"
        ],
        important: "בקשות חריגה מוגשות לדיון בוועדת התכנון בלבד — לא ניתן לחרוג באופן עצמאי.",
        evidence: "supported",
        entityState: "found",
        sources: [PLANNING_SOURCE],
        suggestedActions: ["מה לוח הזמנים?", "אילו תקציבים תוספתיים יש?"]
      }
    },
    {
      id: "budgets",
      keywords: ["תקציב תוספתי", "תקציבים", "נספח ב", "סעיף", "קוד פעילות", "תוספת", "אילו תקציבים", "סל", "תקצוב"],
      answer: {
        summary: "נספח ב' של מסמך ההיערכות מגדיר את סעיפי התקצוב התוספתי לתשפ\"ז. האישור לכולם ניתן בוועדת התכנון:",
        steps: [
          "101 — קליטת עולים ותושבים חוזרים (שעות תגבור עברית והשלמת פערים)",
          "102 — תגבורים לימודיים מערכתיים (טבלת שעות לפי גודל בית הספר)",
          "106 — שיווק ופרסום: עד 100 אש\"ח לבית ספר",
          "110 — בתי ספר קטנים וצומחים: 10–20 ש\"ש לפי שלב",
          "113 — תוכניות העשרה בפנימיות: 10–15 ש\"ש לפי מספר תלמידים",
          "114 — רב / ראש ישיבה: 12 ש\"ש · 115 — שעות פרופסיונליות (גיל 47+)",
          "116 — חנ\"ג לכיתה מפוצלת: 1 ש\"ש · 118 — רכז פדגוגי · 119 — רכז חברתי: חצי ש\"ש לכיתה + תוספת 4–5 ש\"ש",
          "105/107/108/109 — אוחדו לסל העשרה וטיפוח הלומד (תוכנית אס\"א וחונכות)"
        ],
        important: "תקציב 102 מיועד אך ורק לשעות מורה בפועל — חל איסור מוחלט לממן ממנו אבחונים מכל סוג.",
        evidence: "supported",
        entityState: "found",
        sources: [PLANNING_SOURCE],
        suggestedActions: ["כמה תקציב שיווק יש?", "מה מקבל רכז חברתי?", "הפכי לצ'קליסט"]
      }
    },
    {
      id: "marketing",
      keywords: ["שיווק", "פרסום", "106", "100 אשח", "מיתוג", "קמפיין"],
      answer: {
        summary: "סעיף 106 מקצה עד 100 אש\"ח לכל בית ספר לפעילויות שיווק ופרסום — כלי אמיתי לחשיבה יזמית ושיווקית בית־ספרית.",
        steps: [
          "בונים תוכנית עבודה רשתית לשיווק ופרסום (באחריות הגוף המפעיל)",
          "הבקשה מועברת דרך מפקח בית הספר לממונה חניכות ונוער",
          "האישור הסופי ניתן בוועדת התכנון"
        ],
        important: "כדאי לחבר את התוכנית ליעדי רישום מדידים — קבלת תלמידים, ימים פתוחים ונוכחות דיגיטלית — כך הבקשה משכנעת יותר.",
        evidence: "supported",
        entityState: "found",
        sources: [PLANNING_SOURCE],
        suggestedActions: ["בנו לי תוכנית שיווק", "אילו תקציבים תוספתיים יש?"]
      }
    },
    {
      id: "coordinators",
      keywords: ["רכז פדגוגי", "רכז חברתי", "118", "119", "רכז", "מועצת תלמידים", "בוגרים"],
      answer: {
        summary: "הרכזים מקבלים חצי ש\"ש על כל כיתה בבית הספר, ובנוסף תוספת לפי גודל: עד 150 תלמידים — 4 ש\"ש, מעל 150 — 5 ש\"ש.",
        steps: [
          "רכז פדגוגי (118): שדרוג ההוראה, ליווי צוותים ועבודה מבוססת נתונים — בבתי ספר ברפורמת החינוך היוצר",
          "רכז חברתי (119): מועצת תלמידים, תרומה לקהילה וליווי בוגרים",
          "שניהם משתתפים בהכשרה ייעודית לאורך השנה",
          "מציגים את העשייה פעמיים בשנה בוועדה המלווה",
          "בסוף השנה מגישים דו\"ח סיכום פעילות ומסקנות"
        ],
        evidence: "supported",
        entityState: "found",
        sources: [PLANNING_SOURCE,
          { type: "managers", title: "פיתוח צוות — חומרים והכשרות", section: "דרייב מנהלים · פיתוח צוות", date: "עודכן בדצמבר", authority: "professional", url: "https://drive.google.com/drive/folders/14ADJtud4O8_Ke71QVvP9iFlp0qfn6vD7" }],
        suggestedActions: ["הפכי לצ'קליסט", "אילו תקציבים תוספתיים יש?"]
      }
    },
    {
      id: "small-schools",
      keywords: ["צומח", "בית ספר קטן", "110", "בית ספר חדש", "הקמה"],
      answer: {
        summary: "סעיף 110 מקצה תקציב ייעודי לבתי ספר קטנים (עד 100 תלמידים) וצומחים (בחמש שנותיהם הראשונות) — דרך השלמת שעות לבעלי תפקידים.",
        steps: [
          "בית ספר צומח שנה 1 — 20 ש\"ש",
          "בית ספר צומח שנה 2 — 15 ש\"ש",
          "בית ספר צומח שנים 3–5 — 10 ש\"ש",
          "בית ספר קטן (עד 100 תלמידים) שאינו צומח — 10 ש\"ש"
        ],
        important: "מעבירים את תוכנית השלמת המשרות לבחינת המפקח הפדגוגי; האישור הסופי בוועדת התכנון.",
        evidence: "supported",
        entityState: "found",
        sources: [PLANNING_SOURCE],
        suggestedActions: ["מה תהליך האישור?", "אילו תקציבים תוספתיים יש?"]
      }
    },
    {
      id: "olim",
      keywords: ["עולים", "101", "תושב חוזר", "עברית כשפה שנייה", "קליטה ושילוב"],
      answer: {
        summary: "סעיף 101 מתקצב שעות תגבור להוראת עברית כשפה שנייה ולהשלמת פערים עבור תלמידים עולים, אזרחים עולים ותושבים חוזרים.",
        steps: [
          "מוודאים שפרטי התלמידים העולים מוזנים ומעודכנים במערכת המנב\"ס — התקציב מוקצה לפי הרישום",
          "לתלמיד תושב חוזר: שולחים למחוז \"תעודת בירור פרטים על נוסע\" ממשרד הפנים",
          "תחום בקרה ותפעול במחוז מאשר ומעדכן את המערכת"
        ],
        evidence: "supported",
        entityState: "found",
        sources: [PLANNING_SOURCE],
        suggestedActions: ["אילו תקציבים תוספתיים יש?", "הפכי לצ'קליסט"]
      }
    },
    {
      id: "tigbur",
      keywords: ["תגבור", "102", "פיצול", "מרכז למידה", "אבחון", "פערים", "עוז לתמורה"],
      answer: {
        summary: "תקציב 102 (תגבורים לימודיים מערכתיים) נותן לבית הספר גמישות פדגוגית: פיצול כיתות, מרכזי למידה, תגבורים ייחודיים, עברית לחברה הערבית ולימודי יהדות.",
        steps: [
          "מגדירים מראש יעדים מדידים לשימוש בשעות",
          "מציגים תוכנית שנתית למפקח הפדגוגי",
          "מקבלים אישור תקציב בוועדת התכנון",
          "מקפידים שאין כפל דיווח מול שעות פרטניות, חינוך מיוחד ושעות האוגדן"
        ],
        important: "איסור מוחלט לממן אבחונים מתקציב זה — הוא מיועד אך ורק לשעות מורה בפועל. ההקצאה: 26–39 ש\"ש לפי גודל, ותוספת לבתי ספר פנימייתיים.",
        evidence: "supported",
        entityState: "found",
        sources: [PLANNING_SOURCE],
        suggestedActions: ["אילו תקציבים תוספתיים יש?", "מה תהליך האישור?"]
      }
    },
    {
      id: "matlit",
      keywords: ["מתלית", "מת\"לית", "מת״לית", "מתל", "מת\"ל", "תפקודי למידה", "תומכת למידה"],
      answer: {
        summary: "מת\"לית היא בעלת תפקיד קבועה בבתי הספר של החינוך היוצר, לצד רכז פדגוגי, רכז חברתי, רכז חניכות ויועצ/ת. בפועל, ברוב בתי הספר אותו איש צוות משמש גם מת\"לית וגם רכז/ת הכלה ושילוב, והיא משתתפת בהכשרה השנתית מטעם המינהל.",
        steps: [
          "ממנים מת\"לית ומדווחים עליה בטבלת בעלי התפקידים של הוועדה המלווה",
          "משבצים אותה בהכשרה השנתית הייעודית מטעם המינהל",
          "מתאמים מול המפקח הפדגוגי את היקף השעות במסגרת שעות בית הספר"
        ],
        important: "מסמך ההיערכות תשפ\"ז אינו מקצה מכסת שעות ייעודית למת\"לית — שעות תפקיד מוגדרות שם רק לרכז פדגוגי (118) ולרכז חברתי (119): חצי ש\"ש לכיתה + 4–5 ש\"ש לפי גודל. שעות המת\"לית נקבעות מתוך שעות האוגדן ובתיאום עם המפקח.",
        evidence: "partial",
        entityState: "found",
        sources: [
          { type: "managers", title: "מצגות ועדה מלווה — טבלת בעלי תפקידים", section: "דרייב מנהלים · ועדה מלווה", date: "עודכן במאי 2026", authority: "professional", url: "https://drive.google.com/drive/folders/1mGiiKKrhSmaFUMbJsMK6tK4zEw2N_MC9" },
          PLANNING_SOURCE
        ],
        suggestedActions: ["מה מקבל רכז פדגוגי?", "מה יש באוגדן השעות?"]
      }
    },
    {
      id: "hashaya",
      keywords: ["השעיה", "השעיית תלמיד", "הרחקה", "הרחקת תלמיד", "חוזר מנכל", "חוזר מנכ\"ל", "משמעת חמורה"],
      answer: {
        summary: "השעיית תלמיד נעשית לפי חוזר מנכ\"ל של משרד החינוך בנושא אקלים חינוכי מיטבי והתמודדות עם אירועי אלימות. הכלל: השעיה רק במקרים חמורים או חוזרים, אחרי שמוצו תגובות חינוכיות אחרות, ובאישור מנהל/ת בית הספר.",
        steps: [
          "ממצים קודם מדרג תגובות חינוכיות (שיחה, יידוע הורים, מטלה חינוכית)",
          "מקבלים אישור מנהל/ת לפני כל השעיה ומזמנים הורים",
          "אם ההשעיה מהבית מסכנת את התלמיד — בוחרים חלופה כמו השעיה פנים־בית־ספרית",
          "מתעדים את האירוע ואת התגובה שנבחרה"
        ],
        important: "החוזר המלא נמצא באתר חוזרי המנכ\"ל של משרד החינוך (הוראת קבע בנושא \"קידום אקלים חינוכי מיטבי\"). לא להשתמש בהשעיה כדרך קבע.",
        evidence: "supported",
        entityState: "found",
        sources: [
          { type: "website", title: "חוזר מנכ\"ל — אקלים חינוכי מיטבי (הוראת קבע)", section: "אתר משרד החינוך · חוזרי מנכ\"ל", date: "עודכן בפברואר 2026", authority: "mandatory", url: "https://apps.education.gov.il/mankal/horaa.aspx?siduri=341" },
          { type: "website", title: "הרחקת תלמיד מבית הספר (השעיה) — כל־זכות", section: "מדריך הליך מעשי", date: "מתעדכן שוטף", authority: "professional", url: "https://www.kolzchut.org.il/he/הרחקת_תלמיד_מבית_הספר_(השעיה)" }
        ],
        suggestedActions: ["איפה חוזרי המנכ\"ל?", "אילו חומרי ייעוץ ורווחה זמינים?"]
      }
    },
    {
      id: "ogdan",
      keywords: ["אוגדן", "אוגדן שעות", "מסלול 45", "שעות תקן", "מערכת שעות"],
      answer: {
        summary: "מנהל בית הספר נדרש לתכנן את מערכת השעות כך שכל שעות האוגדן ישולבו בה, כפי שפורסמו באוגדן הנוער לשנה\"ל תשפ\"ז. חומרי האוגדן המלאים נמצאים בדרייב המנהלים.",
        evidence: "supported",
        entityState: "found",
        sources: [
          { type: "managers", title: "אוגדני תשפ\"ז — מצגת", section: "דרייב מנהלים · אוגדן שעות", date: "עודכן ביולי 2026", authority: "directive", url: "https://drive.google.com/file/d/1miWnxZ0rqt4D_Iu9D23lIM7QgsPEnT-O/view" },
          { type: "managers", title: "אוגדן מסלול 45", section: "דרייב מנהלים · אוגדן שעות", date: "עודכן במרץ 2026", authority: "directive", url: "https://drive.google.com/file/d/1IiatICoLcJxzjhSlyzZwWVHhNPzJa8gQ/view" },
          PLANNING_SOURCE
        ],
        suggestedActions: ["מה תהליך האישור?", "מה לוח הזמנים?"]
      }
    }
  ];

  /* ============ Searchable resource index — real Drive links ============ */
  var INDEX = [
    /* --- אתר החינוך היוצר --- */
    { keywords: ["חינוך יוצר", "החינוך היוצר", "ספר ההפעלה", "ספירלת הזרימה", "רפורמה", "פדגוגיה יוצרת", "אדם יוצר"],
      source: { type: "website", title: "ספר ההפעלה של החינוך היוצר — חזון, פדגוגיה ויישום", section: "אתר החינוך היוצר · yotzer.education", date: "מתעדכן שוטף", authority: "professional", url: "https://guidebook.yotzer.education/" } },
    { keywords: ["בתי ספר יוצרים", "רשימת בתי ספר", "בתי הספר ברפורמה", "איזה בתי ספר"],
      source: { type: "website", title: "רשימת בתי הספר היוצרים (סינון לפי מחוז, מגמה ורשת)", section: "אתר החינוך היוצר", date: "מתעדכן שוטף", authority: "professional", url: "https://yotzer.education/ourschools/" } },
    /* --- חוזרי מנכ"ל — אתר משרד החינוך --- */
    { keywords: ["חוזר מנכל", "חוזר מנכ\"ל", "חוזרי מנכל", "הוראות מנכל", "השעיה", "השעיית תלמיד", "הרחקת תלמיד", "משמעת", "נוהל", "נהלים"],
      source: { type: "website", title: "חוזרי מנכ\"ל — אתר משרד החינוך (חיפוש לפי נושא ושנה)", section: "אתר רשמי · הוראות מנכ\"ל", date: "מתעדכן שוטף", authority: "directive", url: "https://apps.education.gov.il/mankal/" } },
    /* --- דרייב מנהלים --- */
    { keywords: ["תכנון", "היערכות", "גופים מפעילים"], source: PLANNING_SOURCE },
    { keywords: ["עובדי הוראה", "מורים", "העסקה", "כוח אדם"],
      source: { type: "managers", title: "עובדי הוראה", section: "דרייב מנהלים", date: "עודכן במאי 2026", authority: "professional", url: "https://drive.google.com/drive/folders/1wmRmBn3R_Vqbxcibl9eKHQ_3TBytKNFA" } },
    { keywords: ["מורים חונכים", "חונך", "חניכה", "מנטור", "ליווי מורים"],
      source: { type: "managers", title: "מורים חונכים", section: "דרייב מנהלים", date: "עודכן בנובמבר", authority: "professional", url: "https://drive.google.com/drive/folders/1BFTo7pzI43UQC5IRTsi6y2gBFqAw5-d5" } },
    { keywords: ["אוגדן", "שעות", "מסלול 45"],
      source: { type: "managers", title: "אוגדן שעות", section: "דרייב מנהלים", date: "עודכן ביולי 2026", authority: "directive", url: "https://drive.google.com/drive/folders/1_7xy-YenyrkwzVV0nTll8xX5MG2t8fYw" } },
    { keywords: ["ועדה מלווה", "מעקב", "הצגת עשייה"],
      source: { type: "managers", title: "ועדה מלווה", section: "דרייב מנהלים", date: "עודכן במאי", authority: "professional", url: "https://drive.google.com/drive/folders/1mGiiKKrhSmaFUMbJsMK6tK4zEw2N_MC9" } },
    { keywords: ["פיתוח צוות", "פיתוח מקצועי", "השתלמות", "הכשרה", "רכזים פדגוגיים"],
      source: { type: "managers", title: "פיתוח צוות", section: "דרייב מנהלים", date: "עודכן בדצמבר", authority: "professional", url: "https://drive.google.com/drive/folders/14ADJtud4O8_Ke71QVvP9iFlp0qfn6vD7" } },
    { keywords: ["תקציב", "כספים", "תשלומים"],
      source: { type: "managers", title: "תקציב", section: "דרייב מנהלים", date: "עודכן בדצמבר", authority: "professional", url: "https://drive.google.com/drive/folders/1x_qt-ezw-JqX5WLkzVcSZzHhz5NkJbHr" } },

    /* --- דרייב יועצים --- */
    { keywords: ["ערכת ייעוץ", "יועצת", "יועץ", "ייעוץ"],
      source: { type: "counseling", title: "ערכת הייעוץ", section: "דרייב יועצים", date: "עודכן בספטמבר", authority: "professional", url: "https://drive.google.com/drive/folders/1XExgVWe9AtZLp0qEmNh-fEVJCYsKSikE" } },
    { keywords: ["כישורי חיים", "שיעור כישורי חיים", "מיומנויות רגשיות"],
      source: { type: "counseling", title: "כישורי חיים — שיעורים וחומרי פיקוח", section: "דרייב יועצים · כישורי חיים", date: "עודכן באוגוסט", authority: "professional", url: "https://drive.google.com/drive/folders/1t6g3Xp-uXn_bRWVPP7XVDzavg0NlK50I" } },
    { keywords: ["שאלון", "מדידה", "מצוקה", "איתור", "סקר"],
      source: { type: "counseling", title: "שאלונים ומדידה (כולל שאלוני מצוקה)", section: "דרייב יועצים", date: "עודכן ביולי", authority: "professional", url: "https://drive.google.com/drive/folders/1457MlngML7xHBNNkslRQ9oujWC7QxRYp" } },
    { keywords: ["אסא", "אס\"א", "העשרה וטיפוח"],
      source: { type: "counseling", title: "תוכנית אס\"א", section: "דרייב יועצים", date: "עודכן ביולי", authority: "professional", url: "https://drive.google.com/drive/folders/1zUtc2TkvQhRUJfU1rHppxkpKW6YHvlnL" } },
    { keywords: ["למידת עמיתים", "למידה מהצלחות", "הצלחות"],
      source: { type: "counseling", title: "למידת עמיתים — למידה מהצלחות", section: "דרייב יועצים · למידת עמיתים", date: "עודכן במאי 2025", authority: "suggestion", url: "https://drive.google.com/drive/folders/1iqlIeGgnGFU5UuTAcR_R5hqQhzEvmz3W" } },
    { keywords: ["חינוך יוצר", "עקרונות מארגנים", "מודל הערכה"],
      source: { type: "counseling", title: "החינוך היוצר — מחברת עקרונות מארגנים ומודל הערכה", section: "דרייב יועצים · החינוך היוצר", date: "עודכן בפברואר", authority: "professional", url: "https://drive.google.com/drive/folders/1QcMO2HbVd2KOE-FD6ItzGz_3a_fAQPSA" } },
    { keywords: ["נשירה", "התמדה", "חברה ערבית", "מניעת נשירה"],
      source: { type: "counseling", title: "התוכנית למניעת נשירה בחברה הערבית", section: "דרייב יועצים", date: "עודכן בנובמבר", authority: "professional", url: "https://drive.google.com/drive/folders/1ZnOM_3MRV88uvoGnHQ_-eLd46p-ZdAEY" } },

    /* --- אתר ההיערכות --- */
    { keywords: ["מערכת תוכניות עבודה", "אתר", "תוכניות עבודה בית ספריות", "דשבורד"],
      source: SITE_SOURCE }
  ];

  global.OgenKnowledge = {
    HUBS: HUBS,
    FAQ: FAQ,
    INDEX: INDEX,
    LINKS: {
      managersDrive: MANAGERS_DRIVE,
      counselorsDrive: COUNSELORS_DRIVE,
      planningPdf: PLANNING_PDF,
      site: SITE_LOCAL
    }
  };
})(window);
