const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "database", "data.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    city TEXT,
    email TEXT,
    phone TEXT,
    status TEXT,
    answers_json TEXT NOT NULL,
    tech_count INTEGER NOT NULL DEFAULT 0,
    sales_count INTEGER NOT NULL DEFAULT 0,
    creative_count INTEGER NOT NULL DEFAULT 0,
    lead_count INTEGER NOT NULL DEFAULT 0,
    social_count INTEGER NOT NULL DEFAULT 0,
    finance_count INTEGER NOT NULL DEFAULT 0,
    maker_count INTEGER NOT NULL DEFAULT 0,
    edu_count INTEGER NOT NULL DEFAULT 0,
    top1 TEXT,
    top2 TEXT,
    top3 TEXT,
    ui_language TEXT NOT NULL DEFAULT 'ar',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_ar TEXT, tag_en TEXT,
    title_ar TEXT, title_en TEXT,
    desc_ar TEXT, desc_en TEXT,
    date_ar TEXT, date_en TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS event_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    event_title_ar TEXT NOT NULL,
    event_title_en TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    reference_id INTEGER NOT NULL,
    visitor_name TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS email_templates (
    key TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    body TEXT NOT NULL
  );
`);

// Migration آمنة: إضافة أعمدة جديدة لجدول موجود مسبقًا دون فقدان أي بيانات
function ensureColumn(table, column, definition) {
  const existing = db.prepare(`PRAGMA table_info(${table})`).all();
  const hasColumn = existing.some((col) => col.name === column);
  if (!hasColumn) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn("event_registrations", "status", "TEXT NOT NULL DEFAULT 'pending'");
ensureColumn("event_registrations", "acceptance_email_sent", "INTEGER NOT NULL DEFAULT 0");

// بذر القيم الافتراضية (مطابقة للتصميم المستورد) عند أول تشغيل فقط — لا يُكتب فوق تعديلات الأدمن لاحقًا
const DEFAULT_SITE_CONTENT = {
  about_text_ar: "«نقطة انطلاقة» نادٍ ريادي متخصص في ريادة الأعمال، يقدّم الاستشارات والإرشاد لرواد الأعمال والطلاب والجهات الناشئة. نؤمن أن كل فكرة تستحق نقطةً تنطلق منها نحو الأثر.",
  about_text_en: "Launch Point is an entrepreneurship club offering consulting and mentorship for founders, students, and early-stage ventures. We believe every idea deserves a point to launch from toward real impact.",
  about_image_url: "",
  contact_email: "info@launchpoint.sa",
  contact_phone: "",
  whatsapp_channel_url: "https://whatsapp.com/channel/PLACEHOLDER",
  social_instagram: "",
  social_x: "",
  social_snapchat: "",
  social_tiktok: "",
  social_youtube: "",
  social_telegram: "",
  email_signature: "مع تحيات فريق نادي نقطة انطلاقة",
};

const insertContent = db.prepare("INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)");
const seedContent = db.transaction((entries) => {
  for (const [key, value] of entries) insertContent.run(key, value);
});
seedContent(Object.entries(DEFAULT_SITE_CONTENT));

const DEFAULT_ACTIVITIES = [
  { tag_ar: "ورشة عمل", tag_en: "Workshop", title_ar: "من فكرة إلى نموذج أولي", title_en: "From idea to prototype", date_ar: "١٢ سبتمبر ٢٠٢٦", date_en: "Sep 12, 2026", desc_ar: "ورشة عملية لتحويل فكرتك إلى نموذج قابل للاختبار خلال يوم واحد.", desc_en: "A hands-on workshop to turn your idea into a testable prototype in a single day." },
  { tag_ar: "مسابقة", tag_en: "Competition", title_ar: "ماراثون ريادة الأعمال", title_en: "Entrepreneurship Marathon", date_ar: "٢٨ سبتمبر ٢٠٢٦", date_en: "Sep 28, 2026", desc_ar: "٤٨ ساعة من التحدي لبناء مشروع متكامل والتنافس على الجوائز.", desc_en: "48 hours of challenge to build a full venture and compete for prizes." },
  { tag_ar: "لقاء ريادي", tag_en: "Meetup", title_ar: "أمسية المستثمرين", title_en: "Investors Evening", date_ar: "٥ أكتوبر ٢٠٢٦", date_en: "Oct 5, 2026", desc_ar: "لقاء مباشر يجمع الرواد بالمستثمرين وأصحاب الخبرة في مجال ريادة الأعمال.", desc_en: "A direct meetup connecting founders with investors and experienced mentors." },
  { tag_ar: "ورشة عمل", tag_en: "Workshop", title_ar: "بناء العلامة التجارية", title_en: "Building your brand", date_ar: "١٩ أكتوبر ٢٠٢٦", date_en: "Oct 19, 2026", desc_ar: "أسّس هوية مشروعك البصرية ورسالته في ورشة تفاعلية مع خبراء الهوية.", desc_en: "Lay your venture's visual identity and message in an interactive session with brand experts." },
  { tag_ar: "إرشاد", tag_en: "Mentorship", title_ar: "برنامج الإرشاد الفصلي", title_en: "Quarterly Mentorship", date_ar: "يبدأ نوفمبر ٢٠٢٦", date_en: "Starts Nov 2026", desc_ar: "إرشاد فردي مع مستشاري النادي على مدى ثمانية أسابيع لتطوير مشروعك.", desc_en: "One-on-one guidance with club mentors over eight weeks to grow your venture." },
  { tag_ar: "مسابقة", tag_en: "Competition", title_ar: "تحدي الطلاب الرياديين", title_en: "Student Founders Challenge", date_ar: "٣٠ نوفمبر ٢٠٢٦", date_en: "Nov 30, 2026", desc_ar: "مسابقة مخصصة لطلاب الجامعات لعرض مشاريعهم الناشئة أمام لجنة تحكيم.", desc_en: "A competition for university students to pitch their startups to a jury." },
];

const activityCount = db.prepare("SELECT COUNT(*) AS c FROM activities").get().c;
if (activityCount === 0) {
  const insertActivity = db.prepare(`
    INSERT INTO activities (tag_ar, tag_en, title_ar, title_en, desc_ar, desc_en, date_ar, date_en, image_url, status, sort_order, created_at)
    VALUES (@tag_ar, @tag_en, @title_ar, @title_en, @desc_ar, @desc_en, @date_ar, @date_en, '', 'upcoming', @sort_order, @created_at)
  `);
  const seedActivities = db.transaction((items) => {
    items.forEach((item, index) => {
      insertActivity.run({ ...item, sort_order: index, created_at: new Date().toISOString() });
    });
  });
  seedActivities(DEFAULT_ACTIVITIES);
}

// قوالب البريد الافتراضية — تُستخدم للبذر الأولي ولزر "إعادة للنص الافتراضي" في لوحة التحكم
const DEFAULT_EMAIL_TEMPLATES = {
  event_acceptance: {
    subject: "تم قبول تسجيلك في {{اسم_الفعالية}}",
    body: "مرحبًا {{اسم_الزائر}}،\n\nيسعدنا إبلاغك بأنه تم قبول تسجيلك في فعالية \"{{اسم_الفعالية}}\". سنتواصل معك قريبًا بمزيد من التفاصيل.\n\nنتطلع لرؤيتك!",
  },
};

const insertTemplate = db.prepare("INSERT OR IGNORE INTO email_templates (key, subject, body) VALUES (?, ?, ?)");
for (const [key, tpl] of Object.entries(DEFAULT_EMAIL_TEMPLATES)) {
  insertTemplate.run(key, tpl.subject, tpl.body);
}

// يُعاد تصدير db كما هو (توافقًا مع كل الاستيرادات الحالية: const db = require("./db"))
// مع إرفاق DEFAULT_EMAIL_TEMPLATES كخاصية إضافية عليه لمن يحتاجها (مثل server.js عند "إعادة القالب للافتراضي")
db.DEFAULT_EMAIL_TEMPLATES = DEFAULT_EMAIL_TEMPLATES;
module.exports = db;
