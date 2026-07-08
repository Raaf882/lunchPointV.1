require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const db = require("./db");
const { requireAdminAuth, checkCredentials, createSession, destroySession, cookieOptions, SESSION_COOKIE_NAME } = require("./auth");
const { DOMAINS, QUESTIONS, DOMAIN_NAMES_AR, GENDER_NAMES_AR, STATUS_NAMES_AR } = require("./questions");
const { isNonEmptyString, isValidEmail, isValidPhone } = require("./validate");
const { sendAdminNotificationEmail, sendTemplatedEmail } = require("./mailer");

const app = express();
const PORT = process.env.PORT || 3000;
const frontendDir = path.join(__dirname, "..", "frontend");
const uploadsDir = path.join(frontendDir, "assets", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(express.json());
app.use(cookieParser());

const ACTIVITY_STATUSES = ["available", "upcoming", "ended"];
function normalizeActivityStatus(value, fallback) {
  return ACTIVITY_STATUSES.includes(value) ? value : fallback;
}

// ينشئ إشعارًا داخل اللوحة ويُطلق بريد التنبيه دون انتظاره (فشل البريد لا يُفشل حفظ النموذج)
function notifyAdmin(req, { type, referenceId, visitorName, email, phone, extra }) {
  const result = db.prepare(`
    INSERT INTO notifications (type, reference_id, visitor_name, is_read, created_at)
    VALUES (?, ?, ?, 0, ?)
  `).run(type, referenceId, visitorName, new Date().toISOString());

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const detailUrl = `${baseUrl}/admin?notif=${result.lastInsertRowid}`;

  sendAdminNotificationEmail({ type, visitorName, email, phone, extra, detailUrl }).catch((err) => {
    console.error("[notifyAdmin] خطأ غير متوقع أثناء إرسال البريد:", err.message);
  });
}

const COUNT_COLUMN = {
  TECH: "tech_count",
  SALES: "sales_count",
  CREATIVE: "creative_count",
  LEAD: "lead_count",
  SOCIAL: "social_count",
  FINANCE: "finance_count",
  MAKER: "maker_count",
  EDU: "edu_count",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) return cb(new Error("يُسمح برفع صور فقط"));
    cb(null, true);
  },
});

const escapeCsv = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

function toCsv(columns, rows) {
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((col) => escapeCsv(row[col])).join(","));
  return "﻿" + lines.join("\n");
}

// ينسّق التاريخ بصيغة عربية مقروءة (يوم-شهر-سنة ساعة:دقيقة ص/م) — لطبقة العرض/التصدير فقط، لا يمس created_at المخزَّن
function formatDateAr(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const time = d.toLocaleTimeString("ar-EG-u-nu-latn", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${day}-${month}-${d.getFullYear()} ${time}`;
}

// ===================== استمارة اكتشف شغفك (عام) =====================

app.post("/api/submit", (req, res) => {
  const { fullName, age, gender, city, email, phone, status, answers, uiLanguage } = req.body || {};

  if (!isNonEmptyString(fullName)) {
    return res.status(400).json({ error: "الاسم الكامل مطلوب" });
  }
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
  }
  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ error: "رقم الجوال غير صحيح" });
  }
  if (age !== null && age !== undefined && age !== "" && (!Number.isInteger(Number(age)) || Number(age) < 1 || Number(age) > 120)) {
    return res.status(400).json({ error: "العمر غير صحيح" });
  }
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    return res.status(400).json({ error: "يجب الإجابة على جميع الأسئلة الـ16" });
  }
  for (let i = 0; i < answers.length; i++) {
    if (!QUESTIONS[i].options.includes(answers[i])) {
      return res.status(400).json({ error: `إجابة غير صالحة للسؤال رقم ${i + 1}` });
    }
  }

  const counts = Object.fromEntries(DOMAINS.map((d) => [d, 0]));
  for (const code of answers) counts[code]++;

  const ranked = DOMAINS.slice().sort((a, b) => counts[b] - counts[a]);
  const [top1, top2, top3] = ranked;

  const createdAt = new Date().toISOString();
  const language = uiLanguage === "en" ? "en" : "ar";

  const insert = db.prepare(`
    INSERT INTO responses (
      full_name, age, gender, city, email, phone, status, answers_json,
      tech_count, sales_count, creative_count, lead_count, social_count, finance_count, maker_count, edu_count,
      top1, top2, top3, ui_language, created_at
    ) VALUES (
      @full_name, @age, @gender, @city, @email, @phone, @status, @answers_json,
      @tech_count, @sales_count, @creative_count, @lead_count, @social_count, @finance_count, @maker_count, @edu_count,
      @top1, @top2, @top3, @ui_language, @created_at
    )
  `);

  const insertResult = insert.run({
    full_name: fullName.trim(),
    age: Number.isFinite(Number(age)) ? Number(age) : null,
    gender: gender || null,
    city: city || null,
    email: email || null,
    phone: phone || null,
    status: status || null,
    answers_json: JSON.stringify(answers),
    tech_count: counts.TECH,
    sales_count: counts.SALES,
    creative_count: counts.CREATIVE,
    lead_count: counts.LEAD,
    social_count: counts.SOCIAL,
    finance_count: counts.FINANCE,
    maker_count: counts.MAKER,
    edu_count: counts.EDU,
    top1,
    top2,
    top3,
    ui_language: language,
    created_at: createdAt,
  });

  notifyAdmin(req, {
    type: "quiz",
    referenceId: insertResult.lastInsertRowid,
    visitorName: fullName.trim(),
    email: email || "",
    phone: phone || "",
    extra: `المجال الأول: ${top1}`,
  });

  const percentages = Object.fromEntries(
    DOMAINS.map((d) => [d, Math.round((counts[d] / QUESTIONS.length) * 100)])
  );

  res.json({ counts, percentages, top1, top2, top3 });
});

// ===================== تواصل معنا (عام) =====================

app.post("/api/contact", (req, res) => {
  const { fullName, email, phone, message } = req.body || {};

  if (!isNonEmptyString(fullName)) {
    return res.status(400).json({ error: "الاسم الكامل مطلوب" });
  }
  if (!isNonEmptyString(message)) {
    return res.status(400).json({ error: "الرسالة مطلوبة" });
  }
  if (!email && !phone) {
    return res.status(400).json({ error: "يرجى إدخال البريد الإلكتروني أو رقم الجوال" });
  }
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
  }
  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ error: "رقم الجوال غير صحيح" });
  }

  const contactResult = db.prepare(`
    INSERT INTO contact_messages (full_name, email, phone, message, status, created_at)
    VALUES (?, ?, ?, ?, 'new', ?)
  `).run(fullName.trim(), email || null, phone || null, message.trim(), new Date().toISOString());

  notifyAdmin(req, {
    type: "contact",
    referenceId: contactResult.lastInsertRowid,
    visitorName: fullName.trim(),
    email: email || "",
    phone: phone || "",
    extra: `الرسالة: ${message.trim().slice(0, 200)}`,
  });

  res.json({ ok: true });
});

// ===================== التسجيل في الفعاليات (عام) =====================

app.post("/api/events/:id/register", (req, res) => {
  const { fullName, email, phone, note } = req.body || {};

  if (!isNonEmptyString(fullName)) {
    return res.status(400).json({ error: "الاسم الكامل مطلوب" });
  }
  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    return res.status(400).json({ error: "البريد الإلكتروني مطلوب ويجب أن يكون صحيحًا" });
  }
  if (!isNonEmptyString(phone) || !isValidPhone(phone)) {
    return res.status(400).json({ error: "رقم الجوال مطلوب ويجب أن يكون صحيحًا" });
  }

  const event = db.prepare("SELECT * FROM activities WHERE id = ?").get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: "الفعالية غير موجودة" });
  }
  if (event.status !== "available") {
    return res.status(400).json({ error: "التسجيل غير متاح لهذه الفعالية حاليًا" });
  }

  const regResult = db.prepare(`
    INSERT INTO event_registrations (event_id, event_title_ar, event_title_en, full_name, email, phone, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(event.id, event.title_ar, event.title_en, fullName.trim(), email.trim(), phone.trim(), (note || "").trim() || null, new Date().toISOString());

  notifyAdmin(req, {
    type: "event_registration",
    referenceId: regResult.lastInsertRowid,
    visitorName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    extra: `الفعالية: ${event.title_ar}`,
  });

  res.json({ ok: true });
});

// ===================== محتوى الموقع (عام للقراءة) =====================

app.get("/api/site-content", (req, res) => {
  const rows = db.prepare("SELECT key, value FROM site_content").all();
  const content = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const activities = db.prepare("SELECT * FROM activities ORDER BY sort_order ASC, id ASC").all();
  res.json({ content, activities });
});

// ===================== لوحة التحكم: نتائج الاستبيان =====================

app.get("/api/admin/responses", requireAdminAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM responses ORDER BY created_at DESC").all();
  res.json(rows);
});

app.get("/api/admin/responses/:id", requireAdminAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM responses WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "غير موجود" });

  const answers = JSON.parse(row.answers_json);
  const detailedAnswers = QUESTIONS.map((q, i) => ({
    questionIndex: i,
    code: answers[i],
  }));
  const percentages = Object.fromEntries(
    DOMAINS.map((d) => [d, Math.round((row[COUNT_COLUMN[d]] / QUESTIONS.length) * 100)])
  );

  res.json({ ...row, answers: detailedAnswers, percentages });
});

app.get("/api/admin/export.csv", requireAdminAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM responses ORDER BY created_at DESC").all();
  const columns = [
    "id", "full_name", "age", "gender", "city", "email", "phone", "status",
    "answers_json", "tech_count", "sales_count", "creative_count", "lead_count",
    "social_count", "finance_count", "maker_count", "edu_count",
    "top1", "top2", "top3", "ui_language", "created_at",
  ];
  // نعرض القيم الكاملة المقروءة في التصدير فقط، دون تعديل الرموز/التواريخ المخزَّنة في قاعدة البيانات
  const displayRows = rows.map((row) => ({
    ...row,
    gender: GENDER_NAMES_AR[row.gender] || row.gender,
    status: STATUS_NAMES_AR[row.status] || row.status,
    top1: DOMAIN_NAMES_AR[row.top1] || row.top1,
    top2: DOMAIN_NAMES_AR[row.top2] || row.top2,
    top3: DOMAIN_NAMES_AR[row.top3] || row.top3,
    created_at: formatDateAr(row.created_at),
  }));
  const csv = toCsv(columns, displayRows);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="responses.csv"');
  res.send(csv);
});

// ===================== لوحة التحكم: رسائل تواصل معنا =====================

app.get("/api/admin/messages", requireAdminAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all();
  res.json(rows);
});

app.patch("/api/admin/messages/:id", requireAdminAuth, (req, res) => {
  const { status } = req.body || {};
  if (!["new", "answered"].includes(status)) {
    return res.status(400).json({ error: "حالة غير صالحة" });
  }
  const result = db.prepare("UPDATE contact_messages SET status = ? WHERE id = ?").run(status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "غير موجود" });
  res.json({ ok: true });
});

app.get("/api/admin/messages/export.csv", requireAdminAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all();
  const columns = ["id", "full_name", "email", "phone", "message", "status", "created_at"];
  const csv = toCsv(columns, rows);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="messages.csv"');
  res.send(csv);
});

// ===================== لوحة التحكم: إدارة المحتوى =====================

app.put("/api/admin/content", requireAdminAuth, (req, res) => {
  const updates = req.body || {};
  const upsert = db.prepare(`
    INSERT INTO site_content (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  const applyAll = db.transaction((entries) => {
    for (const [key, value] of entries) upsert.run(key, value == null ? "" : String(value));
  });
  applyAll(Object.entries(updates));
  res.json({ ok: true });
});

app.post("/api/admin/upload", requireAdminAuth, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "لم يتم إرفاق أي صورة" });
    res.json({ url: `/assets/uploads/${req.file.filename}` });
  });
});

// ===================== لوحة التحكم: إدارة الأنشطة =====================

app.get("/api/admin/activities", requireAdminAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM activities ORDER BY sort_order ASC, id ASC").all();
  res.json(rows);
});

app.post("/api/admin/activities", requireAdminAuth, (req, res) => {
  const b = req.body || {};
  if (!b.title_ar || !b.title_en) {
    return res.status(400).json({ error: "العنوان مطلوب باللغتين" });
  }
  const maxOrder = db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM activities").get().m;
  const result = db.prepare(`
    INSERT INTO activities (tag_ar, tag_en, title_ar, title_en, desc_ar, desc_en, date_ar, date_en, image_url, status, sort_order, created_at)
    VALUES (@tag_ar, @tag_en, @title_ar, @title_en, @desc_ar, @desc_en, @date_ar, @date_en, @image_url, @status, @sort_order, @created_at)
  `).run({
    tag_ar: b.tag_ar || "", tag_en: b.tag_en || "",
    title_ar: b.title_ar, title_en: b.title_en,
    desc_ar: b.desc_ar || "", desc_en: b.desc_en || "",
    date_ar: b.date_ar || "", date_en: b.date_en || "",
    image_url: b.image_url || "",
    status: normalizeActivityStatus(b.status, "upcoming"),
    sort_order: maxOrder + 1,
    created_at: new Date().toISOString(),
  });
  res.json({ id: result.lastInsertRowid });
});

app.put("/api/admin/activities/:id", requireAdminAuth, (req, res) => {
  const b = req.body || {};
  const existing = db.prepare("SELECT * FROM activities WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "غير موجود" });

  db.prepare(`
    UPDATE activities SET
      tag_ar = @tag_ar, tag_en = @tag_en,
      title_ar = @title_ar, title_en = @title_en,
      desc_ar = @desc_ar, desc_en = @desc_en,
      date_ar = @date_ar, date_en = @date_en,
      image_url = @image_url, status = @status
    WHERE id = @id
  `).run({
    id: req.params.id,
    tag_ar: b.tag_ar ?? existing.tag_ar,
    tag_en: b.tag_en ?? existing.tag_en,
    title_ar: b.title_ar ?? existing.title_ar,
    title_en: b.title_en ?? existing.title_en,
    desc_ar: b.desc_ar ?? existing.desc_ar,
    desc_en: b.desc_en ?? existing.desc_en,
    date_ar: b.date_ar ?? existing.date_ar,
    date_en: b.date_en ?? existing.date_en,
    image_url: b.image_url ?? existing.image_url,
    status: normalizeActivityStatus(b.status, existing.status),
  });
  res.json({ ok: true });
});

app.delete("/api/admin/activities/:id", requireAdminAuth, (req, res) => {
  const result = db.prepare("DELETE FROM activities WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "غير موجود" });
  res.json({ ok: true });
});

// ===================== لوحة التحكم: تسجيلات الفعاليات =====================

const REGISTRATION_STATUSES = ["pending", "accepted", "rejected"];

function queryEventRegistrations(query) {
  const clauses = [];
  const params = {};

  if (query.eventId) {
    clauses.push("event_id = @eventId");
    params.eventId = query.eventId;
  }
  if (query.status && REGISTRATION_STATUSES.includes(query.status)) {
    clauses.push("status = @status");
    params.status = query.status;
  }
  if (query.q) {
    clauses.push("(full_name LIKE @q OR email LIKE @q OR phone LIKE @q)");
    params.q = `%${query.q}%`;
  }
  if (query.dateFrom) {
    clauses.push("created_at >= @dateFrom");
    params.dateFrom = query.dateFrom;
  }
  if (query.dateTo) {
    clauses.push("created_at <= @dateTo");
    params.dateTo = query.dateTo;
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db.prepare(`SELECT * FROM event_registrations ${where} ORDER BY created_at DESC`).all(params);
}

app.get("/api/admin/event-registrations", requireAdminAuth, (req, res) => {
  res.json(queryEventRegistrations(req.query));
});

app.patch("/api/admin/event-registrations/:id/status", requireAdminAuth, (req, res) => {
  const { status } = req.body || {};
  if (!REGISTRATION_STATUSES.includes(status)) {
    return res.status(400).json({ error: "حالة غير صالحة" });
  }

  const registration = db.prepare("SELECT * FROM event_registrations WHERE id = ?").get(req.params.id);
  if (!registration) return res.status(404).json({ error: "غير موجود" });

  db.prepare("UPDATE event_registrations SET status = ? WHERE id = ?").run(status, req.params.id);

  if (status === "accepted" && !registration.acceptance_email_sent) {
    sendTemplatedEmail({
      templateKey: "event_acceptance",
      to: registration.email,
      variables: {
        "{{اسم_الزائر}}": registration.full_name,
        "{{اسم_الفعالية}}": registration.event_title_ar,
      },
    }).then((sent) => {
      if (sent) db.prepare("UPDATE event_registrations SET acceptance_email_sent = 1 WHERE id = ?").run(req.params.id);
    }).catch((err) => {
      console.error("[event-registrations] خطأ غير متوقع أثناء إرسال بريد القبول:", err.message);
    });
  }

  res.json({ ok: true });
});

app.get("/api/admin/event-registrations/export.csv", requireAdminAuth, (req, res) => {
  const rows = queryEventRegistrations(req.query);
  const columns = ["id", "event_id", "event_title_ar", "event_title_en", "full_name", "email", "phone", "note", "status", "created_at"];
  const csv = toCsv(columns, rows);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="event-registrations.csv"');
  res.send(csv);
});

// ===================== لوحة التحكم: قوالب البريد =====================

app.get("/api/admin/email-templates", requireAdminAuth, (req, res) => {
  const templates = db.prepare("SELECT * FROM email_templates").all();
  res.json(templates);
});

app.put("/api/admin/email-templates/:key", requireAdminAuth, (req, res) => {
  const { subject, body } = req.body || {};
  if (!isNonEmptyString(subject) || !isNonEmptyString(body)) {
    return res.status(400).json({ error: "العنوان والنص مطلوبان" });
  }
  const result = db.prepare("UPDATE email_templates SET subject = ?, body = ? WHERE key = ?").run(subject, body, req.params.key);
  if (result.changes === 0) return res.status(404).json({ error: "القالب غير موجود" });
  res.json({ ok: true });
});

app.post("/api/admin/email-templates/:key/reset", requireAdminAuth, (req, res) => {
  const defaultTemplate = db.DEFAULT_EMAIL_TEMPLATES[req.params.key];
  if (!defaultTemplate) return res.status(404).json({ error: "لا يوجد قالب افتراضي بهذا المفتاح" });
  db.prepare("UPDATE email_templates SET subject = ?, body = ? WHERE key = ?").run(
    defaultTemplate.subject, defaultTemplate.body, req.params.key
  );
  res.json({ ok: true, template: defaultTemplate });
});

// ===================== لوحة التحكم: الإشعارات =====================

app.get("/api/admin/notifications", requireAdminAuth, (req, res) => {
  const notifications = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50").all();
  const unreadCount = db.prepare("SELECT COUNT(*) AS c FROM notifications WHERE is_read = 0").get().c;
  res.json({ notifications, unreadCount });
});

app.patch("/api/admin/notifications/:id/read", requireAdminAuth, (req, res) => {
  const result = db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "غير موجود" });
  res.json({ ok: true });
});

app.patch("/api/admin/notifications/read-all", requireAdminAuth, (req, res) => {
  db.prepare("UPDATE notifications SET is_read = 1 WHERE is_read = 0").run();
  res.json({ ok: true });
});

// ===================== تسجيل الدخول =====================

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!checkCredentials(username, password)) {
    return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
  }
  const token = createSession();
  res.cookie(SESSION_COOKIE_NAME, token, cookieOptions());
  res.json({ ok: true });
});

app.post("/api/admin/logout", (req, res) => {
  destroySession(req.cookies ? req.cookies[SESSION_COOKIE_NAME] : null);
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

// ===================== الصفحات =====================

app.get(["/admin", "/admin.html"], requireAdminAuth, (req, res) => {
  res.sendFile(path.join(frontendDir, "admin.html"));
});

app.use(express.static(frontendDir, { index: "index.html" }));

app.listen(PORT, () => {
  console.log(`الخادم يعمل على http://localhost:${PORT}`);
});
