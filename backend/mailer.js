const nodemailer = require("nodemailer");
const db = require("./db");

const TYPE_LABELS_AR = {
  quiz: "استمارة اكتشف شغفك",
  contact: "رسالة تواصل معنا",
  event_registration: "تسجيل في فعالية",
};

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let cachedTransporter = null;
function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return cachedTransporter;
}

function getEmailSignature() {
  try {
    const row = db.prepare("SELECT value FROM site_content WHERE key = 'email_signature'").get();
    return row && row.value ? row.value : "";
  } catch (err) {
    return "";
  }
}

function appendSignature(body) {
  const signature = getEmailSignature();
  return signature ? `${body}\n\n${signature}` : body;
}

function substituteVariables(text, variables) {
  let result = text || "";
  for (const [token, value] of Object.entries(variables || {})) {
    result = result.split(token).join(value ?? "");
  }
  return result;
}

// لا تُرمى أي أخطاء من هذه الدالة أبدًا — فشل إرسال البريد يجب ألا يُفشل حفظ النموذج في قاعدة البيانات
async function sendAdminNotificationEmail({ type, visitorName, email, phone, extra, detailUrl }) {
  if (!isSmtpConfigured() || !process.env.ADMIN_NOTIFICATION_EMAIL) {
    console.log(`[mailer] تخطّي إرسال البريد (SMTP أو ADMIN_NOTIFICATION_EMAIL غير مُعدّين في .env) — إشعار: ${type} من "${visitorName}"`);
    return;
  }

  try {
    const label = TYPE_LABELS_AR[type] || type;
    const lines = [
      `نوع النموذج: ${label}`,
      `الاسم: ${visitorName}`,
      email ? `البريد الإلكتروني: ${email}` : null,
      phone ? `رقم الجوال: ${phone}` : null,
      extra || null,
      "",
      `لعرض التفاصيل الكاملة في لوحة التحكم: ${detailUrl}`,
    ].filter((line) => line !== null);

    await getTransporter().sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      subject: `[نقطة انطلاقة] ${label} جديد من ${visitorName}`,
      text: appendSignature(lines.join("\n")),
    });
  } catch (err) {
    console.error("[mailer] تعذّر إرسال بريد التنبيه:", err.message);
  }
}

// يُرسل بريدًا لزائر بالاستعانة بقالب محفوظ في قاعدة البيانات (email_templates)، مع استبدال متغيرات مثل {{اسم_الزائر}}
// يُعيد true فقط إذا أُرسل البريد فعليًا بنجاح — يُستخدم هذا لتفادي تكرار الإرسال عند تكرار محاولة الإرسال
async function sendTemplatedEmail({ templateKey, to, variables }) {
  if (!isSmtpConfigured()) {
    console.log(`[mailer] تخطّي إرسال بريد القالب "${templateKey}" (SMTP غير مُعد في .env) — المستلم: ${to}`);
    return false;
  }
  if (!to) {
    console.error(`[mailer] لا يوجد بريد إلكتروني للمستلم — تعذّر إرسال قالب "${templateKey}"`);
    return false;
  }

  try {
    const template = db.prepare("SELECT subject, body FROM email_templates WHERE key = ?").get(templateKey);
    if (!template) {
      console.error(`[mailer] لا يوجد قالب بريد بالمفتاح "${templateKey}"`);
      return false;
    }

    const subject = substituteVariables(template.subject, variables);
    const body = appendSignature(substituteVariables(template.body, variables));

    await getTransporter().sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text: body,
    });
    return true;
  } catch (err) {
    console.error(`[mailer] تعذّر إرسال بريد القالب "${templateKey}":`, err.message);
    return false;
  }
}

module.exports = { sendAdminNotificationEmail, sendTemplatedEmail };
