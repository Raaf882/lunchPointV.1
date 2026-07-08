const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

function isValidPhone(value) {
  return typeof value === "string" && PHONE_PATTERN.test(value.trim());
}

module.exports = { isNonEmptyString, isValidEmail, isValidPhone };
