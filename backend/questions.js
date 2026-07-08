// الأسئلة الـ16 لاستمارة "اكتشف شغفك" — يستخدمها كل من الواجهة الخلفية (للتحقق) والواجهة الأمامية (للعرض)
// نفس المصدر يُستورد من الفرونت-إند عبر نسخة مطابقة في frontend/translations.js

const DOMAINS = ["TECH", "SALES", "CREATIVE", "LEAD", "SOCIAL", "FINANCE", "MAKER", "EDU"];

// أسماء المجالات الكاملة بالعربية — تُستخدم في عرض تصدير CSV فقط، دون المساس برموز DOMAINS المخزَّنة في قاعدة البيانات
const DOMAIN_NAMES_AR = {
  TECH: "التقنية والابتكار",
  SALES: "التجارة والمبيعات",
  CREATIVE: "الإبداع والتصميم والمحتوى",
  LEAD: "القيادة والإدارة",
  SOCIAL: "الأثر الاجتماعي والخدمي",
  FINANCE: "المال والاستثمار",
  MAKER: "الصناعة والإنتاج والحِرَف",
  EDU: "التعليم والتدريب",
};

// أسماء الجنس والحالة الكاملة بالعربية — تُستخدم في عرض تصدير CSV فقط، دون المساس بالقيم المخزَّنة في قاعدة البيانات
const GENDER_NAMES_AR = { male: "ذكر", female: "أنثى" };
const STATUS_NAMES_AR = {
  student: "طالب/ة",
  full_time: "موظف/ة بدوام كامل",
  part_time: "موظف/ة بدوام جزئي",
  job_seeker: "باحث/ة عن عمل",
  business_owner: "صاحب/ة عمل حر أو مشروع قائم",
};

const QUESTIONS = [
  { options: ["TECH", "SALES", "CREATIVE", "LEAD"] },
  { options: ["CREATIVE", "FINANCE", "SOCIAL", "MAKER"] },
  { options: ["SALES", "EDU", "LEAD", "TECH"] },
  { options: ["TECH", "SOCIAL", "FINANCE", "MAKER"] },
  { options: ["TECH", "SALES", "CREATIVE", "EDU"] },
  { options: ["FINANCE", "SOCIAL", "MAKER", "LEAD"] },
  { options: ["LEAD", "SALES", "TECH", "SOCIAL"] },
  { options: ["TECH", "CREATIVE", "EDU", "FINANCE"] },
  { options: ["SALES", "EDU", "MAKER", "TECH"] },
  { options: ["MAKER", "LEAD", "SOCIAL", "CREATIVE"] },
  { options: ["CREATIVE", "FINANCE", "SOCIAL", "LEAD"] },
  { options: ["TECH", "SALES", "EDU", "SOCIAL"] },
  { options: ["MAKER", "LEAD", "CREATIVE", "FINANCE"] },
  { options: ["FINANCE", "EDU", "TECH", "SOCIAL"] },
  { options: ["TECH", "SALES", "CREATIVE", "SOCIAL"] },
  { options: ["LEAD", "MAKER", "EDU", "FINANCE"] },
];

module.exports = { DOMAINS, QUESTIONS, DOMAIN_NAMES_AR, GENDER_NAMES_AR, STATUS_NAMES_AR };
