(function () {
  const ICONS = {
    vision: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    mission: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V9"></path><path d="m7 14 5-5 5 5"></path><circle cx="12" cy="4" r="1.7" fill="#fff" stroke="none"></circle></svg>',
    values: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20 4.6 12.6a4.4 4.4 0 0 1 6.22-6.22L12 7.56l1.18-1.18a4.4 4.4 0 0 1 6.22 6.22L12 20Z"></path></svg>',
  };

  const SOCIAL_ICONS = {
    whatsapp: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.5 14.4c-.3-.15-1.7-.83-1.96-.93-.26-.1-.45-.15-.64.15-.19.29-.74.93-.9 1.12-.17.19-.33.21-.62.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.71-1.6-2-.17-.29-.02-.45.12-.6.13-.13.29-.33.44-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.64-1.55-.88-2.12-.23-.55-.47-.48-.64-.49l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38s1.02 2.76 1.17 2.95c.15.19 2.01 3.06 4.86 4.29.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.11.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34zM12.05 2C6.5 2 2 6.5 2 12.06c0 1.77.46 3.5 1.35 5.02L2 22l5.05-1.32a10 10 0 0 0 5 1.28h.01c5.55 0 10.05-4.5 10.05-10.06C22.11 6.5 17.6 2 12.05 2z"></path></svg>',
    x: '<svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.24 2.25H8.1l4.71 6.23 5.43-6.23zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64z"></path></svg>',
    instagram: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1.2" fill="#fff" stroke="none"></circle></svg>',
    snapchat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2c-3 0-4.5 2.2-4.6 4.4-.05 1-.02 1.8 0 2.4-.5.3-1.3.7-1.9.4-.3-.1-.6 0-.7.3-.1.3 0 .6.3.8.5.3.8.7.6 1.1-.2.4-.8.6-1.3.7-.3.1-.5.4-.4.7.1.4.6.6 1.3.8.3.1.4.3.3.6-.1.3-.1.6.2.8.6.4 1.7.2 2.4 0 .5.7 1.6 1.6 3.8 1.6s3.3-.9 3.8-1.6c.7.2 1.8.4 2.4 0 .3-.2.3-.5.2-.8-.1-.3 0-.5.3-.6.7-.2 1.2-.4 1.3-.8.1-.3-.1-.6-.4-.7-.5-.1-1.1-.3-1.3-.7-.2-.4.1-.8.6-1.1.3-.2.4-.5.3-.8-.1-.3-.4-.4-.7-.3-.6.3-1.4-.1-1.9-.4.02-.6.05-1.4 0-2.4C16.5 4.2 15 2 12 2Z"></path></svg>',
    tiktok: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M16.5 2h-3v13.5a3 3 0 1 1-2.2-2.9V9.4a6.2 6.2 0 1 0 5.2 6.1V8.8c1 .7 2.2 1.1 3.5 1.1V6.9c-1.9 0-3.5-1.6-3.5-3.6V2Z"></path></svg>',
    youtube: '<svg width="19" height="19" viewBox="0 0 24 24" fill="#fff"><rect x="2" y="5" width="20" height="14" rx="4"></rect><path d="M10 9.5v5l4.5-2.5Z" fill="#001F65"></path></svg>',
    telegram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path fill-rule="evenodd" d="M21.5 3.5 2.7 10.8c-1 .4-1 1.6.1 1.9l4.7 1.5 1.8 5.6c.3.9 1.4 1.1 2 .4l2.6-2.9 4.8 3.6c.8.6 2 .2 2.2-.8l3-17.3c.2-1-.8-1.8-1.7-1.3ZM8.6 14.8l9.6-8.4c.3-.2.6.1.4.4l-7.8 8-.3 3.3-1.9-3.3Z"></path></svg>',
  };
  const SOCIAL_ORDER = ["whatsapp", "instagram", "x", "snapchat", "tiktok", "youtube", "telegram"];
  const SOCIAL_LABELS = { whatsapp: "WhatsApp", instagram: "Instagram", x: "X", snapchat: "Snapchat", tiktok: "TikTok", youtube: "YouTube", telegram: "Telegram" };
  const SOCIAL_CONTENT_KEY = { whatsapp: "whatsapp_channel_url", instagram: "social_instagram", x: "social_x", snapchat: "social_snapchat", tiktok: "social_tiktok", youtube: "social_youtube", telegram: "social_telegram" };

  const savedLang = (function () {
    try {
      return localStorage.getItem("npLang");
    } catch (err) {
      return null;
    }
  })();

  const state = {
    lang: savedLang === "en" ? "en" : "ar",
    step: "intro", // intro | question | visitor | result
    qi: 0,
    answers: new Array(QUESTIONS.length).fill(null),
    result: null,
  };

  let siteData = { content: {}, activities: [] };

  async function loadSiteContent() {
    try {
      const res = await fetch("/api/site-content");
      if (res.ok) siteData = await res.json();
    } catch (err) {
      // تُستخدم القيم الافتراضية من translations.js إن تعذّر الاتصال بالخادم
    }
  }

  const $ = (id) => document.getElementById(id);

  function t() {
    return I18N[state.lang];
  }

  function arrow() {
    return state.lang === "ar" ? "←" : "→";
  }

  function populateSelect(selectEl, options) {
    selectEl.innerHTML = "";
    for (const opt of options) {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      selectEl.appendChild(o);
    }
  }

  function renderHeader(s) {
    $("brandName").textContent = s.brandName;
    $("brandSub").textContent = s.brandSub;
    $("langToggleLabel").textContent = s.langBtn;
    const navHtml = s.nav.map((label, i) => `<a href="${NAV_HREFS[i]}">${label}</a>`).join("");
    $("navLinks").innerHTML = navHtml;
    $("navDrawerLinks").innerHTML = navHtml;
  }

  function openNavDrawer() {
    $("navDrawerOverlay").classList.remove("hidden");
    $("hamburgerBtn").setAttribute("aria-expanded", "true");
  }

  function closeNavDrawer() {
    $("navDrawerOverlay").classList.add("hidden");
    $("hamburgerBtn").setAttribute("aria-expanded", "false");
  }

  function renderHero(s) {
    $("heroEyebrow").textContent = s.heroEyebrow;
    $("heroTitle1").textContent = s.heroTitle1;
    $("heroTitle2").textContent = s.heroTitle2;
    $("heroSub").textContent = s.heroSub;
    $("heroCta1").textContent = s.heroCta1;
    $("heroArrow1").textContent = arrow();
    $("heroCta2").textContent = s.heroCta2;
    $("heroTagline").textContent = s.heroTagline;
  }

  function renderAbout(s) {
    $("aboutKicker").textContent = s.aboutKicker;
    $("aboutTitle").textContent = s.aboutTitle;
    $("aboutBody").textContent = siteData.content[`about_text_${state.lang}`] || s.aboutBody;
    const aboutImage = siteData.content.about_image_url;
    $("aboutImageWrap").innerHTML = aboutImage
      ? `<img src="${aboutImage}" alt="" style="max-width:100%; border-radius:16px; margin:20px 0; display:block;">`
      : "";
    $("aboutStats").innerHTML = s.aboutStats
      .map((st) => `<div><div class="stat-num">${st.n}</div><div class="stat-label">${st.l}</div></div>`)
      .join("");
    $("aboutCards").innerHTML = s.aboutCards
      .map(
        (c) => `<div class="about-card">
          <span class="about-icon" style="background:${c.bg};">${ICONS[c.icon] || ""}</span>
          <div><div class="about-card-title">${c.t}</div><div class="about-card-body">${c.b}</div></div>
        </div>`
      )
      .join("");
  }

  function renderActivities(s) {
    $("actKicker").textContent = s.actKicker;
    $("actTitle").textContent = s.actTitle;
    $("actSub").textContent = s.actSub;
    const a = arrow();
    $("activitiesGrid").innerHTML = siteData.activities.map((item, index) => {
      const color = ACTIVITY_COLOR_PALETTE[index % ACTIVITY_COLOR_PALETTE.length];
      const chip = ACTIVITY_CHIP_PALETTE[index % ACTIVITY_CHIP_PALETTE.length];
      const banner = item.image_url
        ? `<img src="${item.image_url}" alt="" style="width:100%; height:140px; object-fit:cover; display:block;">`
        : `<div class="activity-bar" style="background:${color};"></div>`;
      const badgeClass = ["available", "upcoming", "ended"].includes(item.status) ? item.status : "upcoming";
      const badgeLabel = { available: s.actBadgeAvailable, upcoming: s.actBadgeUpcoming, ended: s.actBadgeEnded }[badgeClass];
      const isEnded = badgeClass === "ended";
      let action;
      if (badgeClass === "available") {
        action = `<button type="button" class="activity-join activity-register-btn" data-event-id="${item.id}">${s.actJoin}<span>${a}</span></button>`;
      } else if (badgeClass === "ended") {
        action = `<span class="activity-ended-note">${s.actEndedNote}</span>`;
      } else {
        action = `<span class="activity-ended-note">${s.actComingSoonNote}</span>`;
      }
      return `
      <div class="activity-card${isEnded ? " is-ended" : ""}">
        ${banner}
        <div class="activity-body">
          <div class="activity-meta">
            <span class="activity-tag" style="color:${color}; background:${chip};">${item[`tag_${state.lang}`] || ""}</span>
            <span class="activity-badge ${badgeClass}">${badgeLabel}</span>
          </div>
          <span class="activity-date">${item[`date_${state.lang}`] || ""}</span>
          <h3 class="activity-title">${item[`title_${state.lang}`] || ""}</h3>
          <p class="activity-desc">${item[`desc_${state.lang}`] || ""}</p>
          ${action}
        </div>
      </div>`;
    }).join("");

    $("activitiesGrid").querySelectorAll(".activity-register-btn").forEach((btn) => {
      btn.addEventListener("click", () => openRegistrationModal(Number(btn.dataset.eventId)));
    });
  }

  function renderDiscoverStatic(s) {
    $("discKicker").textContent = s.discKicker;
    $("discTitle").textContent = s.discTitle;
    $("discSub").textContent = s.discSub;
    $("discStart").textContent = s.discStart;
    $("discMeta1").textContent = s.discMeta1;
    $("discMeta2").textContent = s.discMeta2;
    $("discMeta3").textContent = s.discMeta3;
    $("discQLabel").textContent = s.discQ;
    $("quizBackBtn").textContent = s.backLabel;
    $("discResultKicker").textContent = s.discResultKicker;
    $("discResultH").textContent = s.discResultH;
    $("discYourMix").textContent = s.discYourMix;
    $("discShareNote").textContent = s.discShareNote;
    $("restartBtn").textContent = s.discRestart;
    $("quizDomains").innerHTML = DOMAIN_ORDER.map((code) => `<span class="quiz-domain-chip">${s.domainNames[code]}</span>`).join("");

    $("visitorTitle").textContent = s.visitorTitle;
    $("visitorSub").textContent = s.visitorSub;
    $("labelFullName").textContent = s.fields.fullName;
    $("labelAge").textContent = s.fields.age;
    $("labelGender").textContent = s.fields.gender;
    $("labelCity").textContent = s.fields.city;
    $("labelEmail").textContent = s.fields.email;
    $("labelPhone").textContent = s.fields.phone;
    $("labelStatus").textContent = s.fields.status;
    populateSelect($("gender"), s.genderOptions);
    populateSelect($("status"), s.statusOptions);
    $("visitorSubmitBtn").textContent = s.visitorSubmit;
  }

  function renderContactStatic(s) {
    $("contactKicker").textContent = s.contactKicker;
    $("contactTitle").textContent = s.contactTitle;
    $("contactSub").textContent = s.contactSub;
    $("fLabelName").textContent = s.fName;
    $("fLabelPhone").textContent = s.fPhone;
    $("fLabelEmail").textContent = s.fEmail;
    $("fLabelInterest").textContent = s.fInterest;
    $("fLabelMsg").textContent = s.fMsg;
    $("cName").placeholder = s.phName;
    $("cEmail").placeholder = s.phEmail;
    $("cPhone").placeholder = s.phPhone;
    $("cMsg").placeholder = s.phMsg;
    const interestSelect = $("cInterest");
    const prevValue = interestSelect.value;
    interestSelect.innerHTML = s.interestOpts.map((o) => `<option value="${o}">${o}</option>`).join("");
    if (prevValue) interestSelect.value = prevValue;
    $("fSendBtn").textContent = s.fSend;
    $("fSentText").textContent = s.fSent;
    $("waT").textContent = s.waT;
    $("waB").textContent = s.waB;
    $("waBtn").textContent = s.waBtn;
    $("reach").textContent = s.reach;

    const waUrl = siteData.content.whatsapp_channel_url || "https://whatsapp.com/channel/PLACEHOLDER";
    $("whatsappChannelBtn").href = waUrl;

    const email = siteData.content.contact_email;
    const phone = siteData.content.contact_phone;
    const reachLinks = [];
    if (email) reachLinks.push(`<a href="mailto:${email}">${email}</a>`);
    if (phone) reachLinks.push(`<a href="tel:${phone}" dir="ltr">${phone}</a>`);
    $("reachLinks").innerHTML = reachLinks.join("");
  }

  function renderSocialIcons(containerId, whatsappHref) {
    const links = SOCIAL_ORDER.map((key) => {
      const url = key === "whatsapp" ? whatsappHref : siteData.content[SOCIAL_CONTENT_KEY[key]];
      if (!url) return "";
      const isWhatsapp = key === "whatsapp";
      return `<a href="${url}" target="_blank" rel="noopener" aria-label="${SOCIAL_LABELS[key]}" class="social-btn${isWhatsapp ? " whatsapp" : ""}">${SOCIAL_ICONS[key]}</a>`;
    }).join("");
    $(containerId).innerHTML = links;
  }

  function renderFooter(s) {
    $("footBrandName").textContent = s.brandName;
    $("footBrandSub").textContent = s.brandSub;
    $("footTagline").textContent = s.footTagline;
    $("footLinks").textContent = s.footLinks;
    $("footFollow").textContent = s.footFollow;
    $("footRights").textContent = s.footRights;
    $("footNavLinks").innerHTML = s.nav.map((label, i) => `<a href="${NAV_HREFS[i]}">${label}</a>`).join("");
    renderSocialIcons("footerSocial", siteData.content.whatsapp_channel_url || "https://whatsapp.com/channel/PLACEHOLDER");
  }

  function renderQuizStep() {
    $("quizIntro").classList.toggle("hidden", state.step !== "intro");
    $("quizQuestion").classList.toggle("hidden", state.step !== "question");
    $("quizVisitor").classList.toggle("hidden", state.step !== "visitor");
    $("quizResult").classList.toggle("hidden", state.step !== "result");

    if (state.step === "question") renderQuestion();
    if (state.step === "result" && state.result) renderResult();
  }

  function renderQuestion() {
    const s = t();
    const q = QUESTIONS[state.qi];
    $("qNum").textContent = state.qi + 1;
    $("qTotal").textContent = QUESTIONS.length;
    $("quizProgressFill").style.width = `${((state.qi + 1) / QUESTIONS.length) * 100}%`;
    $("quizQuestionText").textContent = q[state.lang];

    $("quizOptions").innerHTML = "";
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option";
      if (state.answers[state.qi] === opt.code) btn.classList.add("selected");
      btn.innerHTML = `<span class="quiz-option-dot"></span><span class="quiz-option-label">${opt[state.lang]}</span>`;
      btn.addEventListener("click", () => pick(opt.code));
      $("quizOptions").appendChild(btn);
    });
  }

  function pick(code) {
    state.answers[state.qi] = code;
    if (state.qi < QUESTIONS.length - 1) {
      state.qi++;
      renderQuestion();
    } else {
      state.step = "visitor";
      renderQuizStep();
    }
  }

  function quizBack() {
    if (state.step === "question" && state.qi > 0) {
      state.qi--;
      renderQuestion();
    } else if (state.step === "question" && state.qi === 0) {
      state.step = "intro";
      renderQuizStep();
    } else if (state.step === "visitor") {
      state.step = "question";
      state.qi = QUESTIONS.length - 1;
      renderQuizStep();
    }
  }

  function renderResult() {
    const s = t();
    const { top1, top2, percentages } = state.result;
    $("topLabel").textContent = s.domainNames[top1];
    $("topLabel2").textContent = s.domainNames[top1];
    $("topDot").style.background = DOMAIN_COLORS[top1];
    $("topPct").textContent = `${percentages[top1]}%`;
    $("topDesc").textContent = s.domainDescriptions[top1];
    $("andThenRow").innerHTML = top2
      ? `${s.discAndThen} <strong>${s.domainNames[top2]}</strong>`
      : "";

    const ranked = DOMAIN_ORDER.slice().sort((a, b) => percentages[b] - percentages[a]);
    $("resultMix").innerHTML = ranked.map((code) => `
      <div class="result-row">
        <span class="result-row-label">${s.domainNames[code]}</span>
        <span class="result-row-bar"><span class="result-row-fill" style="width:${percentages[code]}%; background:${DOMAIN_COLORS[code]};"></span></span>
        <span class="result-row-pct">${percentages[code]}%</span>
      </div>`).join("");
  }

  let currentRegistrationEventId = null;

  function renderRegistrationModalStatic(s) {
    $("regModalTitle").textContent = s.regModalTitle;
    $("regLabelName").textContent = s.regLabelName;
    $("regLabelEmail").textContent = s.regLabelEmail;
    $("regLabelPhone").textContent = s.regLabelPhone;
    $("regLabelNote").textContent = s.regLabelNote;
    $("regName").placeholder = s.regPhName;
    $("regEmail").placeholder = s.regPhEmail;
    $("regPhone").placeholder = s.regPhPhone;
    $("regNote").placeholder = s.regPhNote;
    $("regSubmitBtn").textContent = s.regSubmit;
    $("regSentText").textContent = s.regSent;
    $("regModalCloseBtn").setAttribute("aria-label", s.modalCloseLabel);
  }

  function openRegistrationModal(eventId) {
    const s = t();
    const event = siteData.activities.find((a) => a.id === eventId);
    if (!event) return;
    currentRegistrationEventId = eventId;

    $("regModalEventName").textContent = event[`title_${state.lang}`] || "";
    $("regName").value = "";
    $("regEmail").value = "";
    $("regPhone").value = "";
    $("regNote").value = "";
    clearFieldErrors(["regName", "regEmail", "regPhone"]);
    $("regFormError").classList.add("hidden");
    $("regForm").classList.remove("hidden");
    $("regSentState").classList.add("hidden");
    $("regSubmitBtn").disabled = false;
    $("regSubmitBtn").textContent = s.regSubmit;

    $("regModalOverlay").classList.remove("hidden");
  }

  function closeRegistrationModal() {
    $("regModalOverlay").classList.add("hidden");
    currentRegistrationEventId = null;
  }

  function validateRegistrationForm(s) {
    clearFieldErrors(["regName", "regEmail", "regPhone"]);
    let valid = true;

    const fullName = $("regName").value.trim();
    const email = $("regEmail").value.trim();
    const phone = $("regPhone").value.trim();

    if (!fullName) {
      setFieldError("regName", s.errors.nameRequired);
      valid = false;
    }
    if (!email) {
      setFieldError("regEmail", s.errors.emailRequired);
      valid = false;
    } else if (!isValidEmail(email)) {
      setFieldError("regEmail", s.errors.emailInvalid);
      valid = false;
    }
    if (!phone) {
      setFieldError("regPhone", s.errors.phoneRequired);
      valid = false;
    } else if (!isValidPhone(phone)) {
      setFieldError("regPhone", s.errors.phoneInvalid);
      valid = false;
    }

    return valid;
  }

  async function submitRegistration(e) {
    e.preventDefault();
    const s = t();
    $("regFormError").classList.add("hidden");

    if (!validateRegistrationForm(s)) return;
    if (!currentRegistrationEventId) return;

    const payload = {
      fullName: $("regName").value.trim(),
      email: $("regEmail").value.trim(),
      phone: $("regPhone").value.trim(),
      note: $("regNote").value.trim(),
    };

    const btn = $("regSubmitBtn");
    btn.disabled = true;
    btn.textContent = s.regSubmitting;

    try {
      const res = await fetch(`/api/events/${currentRegistrationEventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("registration failed");
      $("regForm").classList.add("hidden");
      $("regSentState").classList.remove("hidden");
    } catch (err) {
      $("regFormError").textContent = s.regSubmitError;
      $("regFormError").classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = s.regSubmit;
    }
  }

  function restartQuiz() {
    state.step = "intro";
    state.qi = 0;
    state.answers = new Array(QUESTIONS.length).fill(null);
    state.result = null;
    $("fullName").value = "";
    $("age").value = "";
    $("city").value = "";
    $("email").value = "";
    $("phone").value = "";
    $("visitorError").classList.add("hidden");
    clearFieldErrors(["fullName", "age", "email", "phone"]);
    renderQuizStep();
  }

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;

  function isValidEmail(value) {
    return EMAIL_PATTERN.test(value.trim());
  }

  function isValidPhone(value) {
    return PHONE_PATTERN.test(value.trim());
  }

  function setFieldError(fieldId, message) {
    const errorEl = $(fieldId + "Error");
    if (!errorEl) return;
    errorEl.textContent = message || "";
    errorEl.classList.toggle("hidden", !message);
  }

  function clearFieldErrors(fieldIds) {
    fieldIds.forEach((id) => setFieldError(id, ""));
  }

  function showVisitorError(message) {
    $("visitorError").textContent = message;
    $("visitorError").classList.remove("hidden");
  }

  function validateVisitorForm(s) {
    clearFieldErrors(["fullName", "age", "email", "phone"]);
    let valid = true;

    const fullName = $("fullName").value.trim();
    const ageValue = $("age").value.trim();
    const emailValue = $("email").value.trim();
    const phoneValue = $("phone").value.trim();

    if (!fullName) {
      setFieldError("fullName", s.errors.nameRequired);
      valid = false;
    }
    if (emailValue && !isValidEmail(emailValue)) {
      setFieldError("email", s.errors.emailInvalid);
      valid = false;
    }
    if (phoneValue && !isValidPhone(phoneValue)) {
      setFieldError("phone", s.errors.phoneInvalid);
      valid = false;
    }
    if (ageValue && (!Number.isInteger(Number(ageValue)) || Number(ageValue) < 1 || Number(ageValue) > 120)) {
      setFieldError("age", s.errors.ageInvalid);
      valid = false;
    }

    return valid;
  }

  async function submitVisitor() {
    const s = t();
    $("visitorError").classList.add("hidden");

    if (!validateVisitorForm(s)) return;

    const fullName = $("fullName").value.trim();
    const ageValue = $("age").value.trim();
    const emailValue = $("email").value.trim();
    const phoneValue = $("phone").value.trim();

    const btn = $("visitorSubmitBtn");
    btn.disabled = true;
    btn.textContent = s.visitorSubmitting;

    const payload = {
      fullName,
      age: ageValue ? Number(ageValue) : null,
      gender: $("gender").value,
      city: $("city").value.trim(),
      email: emailValue,
      phone: phoneValue,
      status: $("status").value,
      answers: state.answers,
      uiLanguage: state.lang,
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("submit failed");
      state.result = await res.json();
      state.step = "result";
      renderQuizStep();
    } catch (err) {
      showVisitorError(s.visitorSubmitError);
    } finally {
      btn.disabled = false;
      btn.textContent = s.visitorSubmit;
    }
  }

  function renderAll() {
    const s = t();
    document.documentElement.setAttribute("lang", state.lang);
    document.documentElement.setAttribute("dir", s.dir);
    renderHeader(s);
    renderHero(s);
    renderAbout(s);
    renderActivities(s);
    renderDiscoverStatic(s);
    renderContactStatic(s);
    renderFooter(s);
    renderRegistrationModalStatic(s);
    renderQuizStep();
  }

  $("langToggle").addEventListener("click", () => {
    state.lang = state.lang === "ar" ? "en" : "ar";
    try {
      localStorage.setItem("npLang", state.lang);
    } catch (err) {
      // يُتجاهل تعذّر الوصول لـ localStorage (وضع التصفح الخاص مثلاً)، يبقى التبديل يعمل لنفس الجلسة
    }
    renderAll();
  });

  $("hamburgerBtn").addEventListener("click", openNavDrawer);
  $("navDrawerCloseBtn").addEventListener("click", closeNavDrawer);
  $("navDrawerOverlay").addEventListener("click", (e) => {
    if (e.target === $("navDrawerOverlay")) closeNavDrawer();
  });
  $("navDrawerLinks").addEventListener("click", (e) => {
    if (e.target.tagName === "A") closeNavDrawer();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("navDrawerOverlay").classList.contains("hidden")) closeNavDrawer();
  });

  $("startQuizBtn").addEventListener("click", () => {
    state.step = "question";
    state.qi = 0;
    renderQuizStep();
  });

  $("quizBackBtn").addEventListener("click", quizBack);
  $("visitorSubmitBtn").addEventListener("click", submitVisitor);
  $("restartBtn").addEventListener("click", restartQuiz);

  function validateContactForm(s) {
    clearFieldErrors(["cName", "cEmail", "cPhone", "cMsg"]);
    let valid = true;

    const fullName = $("cName").value.trim();
    const email = $("cEmail").value.trim();
    const phone = $("cPhone").value.trim();
    const msgText = $("cMsg").value.trim();

    if (!fullName) {
      setFieldError("cName", s.errors.nameRequired);
      valid = false;
    }
    if (!msgText) {
      setFieldError("cMsg", s.errors.messageRequired);
      valid = false;
    }
    if (email && !isValidEmail(email)) {
      setFieldError("cEmail", s.errors.emailInvalid);
      valid = false;
    }
    if (phone && !isValidPhone(phone)) {
      setFieldError("cPhone", s.errors.phoneInvalid);
      valid = false;
    }
    if (!email && !phone) {
      setFieldError("cEmail", s.errors.contactMethodRequired);
      setFieldError("cPhone", s.errors.contactMethodRequired);
      valid = false;
    }

    return valid;
  }

  $("contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const s = t();
    $("contactError").classList.add("hidden");

    if (!validateContactForm(s)) return;

    const fullName = $("cName").value.trim();
    const email = $("cEmail").value.trim();
    const phone = $("cPhone").value.trim();
    const interest = $("cInterest").value;
    const msgText = $("cMsg").value.trim();

    const message = interest ? `[${interest}] ${msgText}` : msgText;
    const btn = $("fSendBtn");
    btn.disabled = true;
    btn.textContent = s.fSending;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, message }),
      });
      if (!res.ok) throw new Error("contact submit failed");
      $("contactForm").classList.add("hidden");
      $("contactSent").classList.remove("hidden");
    } catch (err) {
      $("contactError").textContent = s.fError;
      $("contactError").classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = s.fSend;
    }
  });

  $("regModalCloseBtn").addEventListener("click", closeRegistrationModal);
  $("regForm").addEventListener("submit", submitRegistration);
  $("regModalOverlay").addEventListener("click", (e) => {
    if (e.target === $("regModalOverlay")) closeRegistrationModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("regModalOverlay").classList.contains("hidden")) closeRegistrationModal();
  });

  (async function init() {
    await loadSiteContent();
    renderAll();
  })();
})();
