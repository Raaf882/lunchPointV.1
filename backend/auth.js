const crypto = require("crypto");
const db = require("./db");

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const SESSION_COOKIE_NAME = "np_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 أيام

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function checkCredentials(username, password) {
  return safeEqual(username || "", ADMIN_USERNAME) && safeEqual(password || "", ADMIN_PASSWORD);
}

function createSession() {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  db.prepare("INSERT INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)").run(
    token,
    new Date(now).toISOString(),
    new Date(now + SESSION_TTL_MS).toISOString()
  );
  return token;
}

function destroySession(token) {
  if (!token) return;
  db.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
}

function isValidSession(token) {
  if (!token) return false;
  const row = db.prepare("SELECT expires_at FROM admin_sessions WHERE token = ?").get(token);
  if (!row) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
    return false;
  }
  return true;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  };
}

function requireAdminAuth(req, res, next) {
  const token = req.cookies ? req.cookies[SESSION_COOKIE_NAME] : null;
  if (isValidSession(token)) return next();

  const wantsHtml = (req.headers.accept || "").includes("text/html");
  if (wantsHtml) {
    const next_ = encodeURIComponent(req.originalUrl);
    return res.redirect(`/login.html?next=${next_}`);
  }
  return res.status(401).json({ error: "مطلوب تسجيل الدخول" });
}

module.exports = {
  SESSION_COOKIE_NAME,
  cookieOptions,
  checkCredentials,
  createSession,
  destroySession,
  requireAdminAuth,
};
