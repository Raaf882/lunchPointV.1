
(function () {
  const lang = "ar";
  const s = I18N[lang].admin;
  const $ = (id) => document.getElementById(id);

  async function adminFetch(url, options) {
    const res = await fetch(url, options);
    if (res.status === 401) {
      location.href = "/login.html";
      throw new Error("session expired");
    }
    return res;
  }

  $("logoutBtn").addEventListener("click", async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    location.href = "/login.html";
  });

  let responses = [];
  let messages = [];
  let siteContentCache = { content: {}, activities: [] };
  let editingActivityId = null;
  let pendingAboutImageUrl = null;
  let pendingActivityImageUrl = null;

  // ===== نصوص ثابتة =====
  document.title = s.pageTitle;
  $("pageTitle").textContent = s.pageTitle;
  $("tabBtnResponses").textContent = s.tabResponses;
  $("tabBtnMessages").textContent = s.tabMessages;
  $("tabBtnRegistrations").textContent = s.tabRegistrations;
  $("tabBtnContent").textContent = s.tabContent;
  $("respSearch").placeholder = s.searchPlaceholder;
  $("respSortLabel").textContent = s.sortLabel;
  $("respSort").children[0].textContent = s.sortNewest;
  $("respSort").children[1].textContent = s.sortOldest;
  $("respSort").children[2].textContent = s.sortNameAsc;
  $("respSort").children[3].textContent = s.sortDomain;
  $("respExportBtn").textContent = s.exportButton;
  $("msgSearch").placeholder = s.searchPlaceholder;
  $("msgSortLabel").textContent = s.sortLabel;
  $("msgSort").children[0].textContent = s.sortNewest;
  $("msgSort").children[1].textContent = s.sortOldest;
  $("msgSort").children[2].textContent = s.sortNameAsc;
  $("msgExportBtn").textContent = s.exportButton;
  $("regSearch").placeholder = s.searchPlaceholder;
  $("regExportBtn").textContent = s.exportButton;
  $("contentAboutTitle").textContent = s.contentAboutTitle;
  $("aboutTextArLabel").textContent = s.aboutTextArLabel;
  $("aboutTextEnLabel").textContent = s.aboutTextEnLabel;
  $("aboutImageLabel").textContent = s.aboutImageLabel;
  $("saveAboutBtn").textContent = s.saveButton;
  $("contentContactTitle").textContent = s.contentContactTitle;
  $("contactEmailLabel").textContent = s.contactEmailLabel;
  $("contactPhoneLabel").textContent = s.contactPhoneLabel;
  $("saveContactBtn").textContent = s.saveButton;
  $("contentSocialTitle").textContent = s.contentSocialTitle;
  $("saveSocialBtn").textContent = s.saveButton;
  $("contentActivitiesTitle").textContent = s.contentActivitiesTitle;
  $("activityFormTitle").textContent = s.addActivity;
  $("lblActivityTitleAr").textContent = s.activityTitleAr;
  $("lblActivityTitleEn").textContent = s.activityTitleEn;
  $("lblActivityTagAr").textContent = s.activityTagAr;
  $("lblActivityTagEn").textContent = s.activityTagEn;
  $("lblActivityDateAr").textContent = s.activityDateAr;
  $("lblActivityDateEn").textContent = s.activityDateEn;
  $("lblActivityDescAr").textContent = s.activityDescAr;
  $("lblActivityDescEn").textContent = s.activityDescEn;
  $("lblActivityImage").textContent = s.activityImage;
  $("lblActivityStatus").textContent = s.activityStatus;
  $("optAvailable").textContent = s.statusAvailable;
  $("optUpcoming").textContent = s.statusUpcoming;
  $("optEnded").textContent = s.statusEnded;
  const STATUS_LABELS = { available: s.statusAvailable, upcoming: s.statusUpcoming, ended: s.statusEnded };
  $("saveActivityBtn").textContent = s.saveActivity;
  $("cancelActivityBtn").textContent = s.cancelEdit;

  const SOCIAL_KEYS = ["whatsapp_channel_url", "social_instagram", "social_x", "social_snapchat", "social_tiktok", "social_youtube", "social_telegram"];
  $("socialFieldsWrap").innerHTML = SOCIAL_KEYS.map((key) => `
    <div class="field">
      <label>${s.socialLabels[key]}</label>
      <input type="url" dir="ltr" id="social_${key}" placeholder="https://" />
    </div>`).join("");

  // ===== تبويبات =====
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".admin-tab").forEach((sec) => sec.classList.add("hidden"));
      btn.classList.add("active");
      $(`tab-${btn.dataset.tab}`).classList.remove("hidden");
    });
  });

  // ===== نتائج اكتشف شغفك =====
  const respCols = ["id", "full_name", "age", "gender", "city", "email", "phone", "status", "top1", "top2", "top3", "ui_language", "created_at"];
  const respHeadRow = $("respHeadRow");
  respCols.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = s.columns[c];
    respHeadRow.appendChild(th);
  });

  function filterSortResponses() {
    const q = $("respSearch").value.trim().toLowerCase();
    let rows = responses.filter((r) =>
      !q || (r.full_name || "").toLowerCase().includes(q) || (r.city || "").toLowerCase().includes(q)
    );
    const sortBy = $("respSort").value;
    if (sortBy === "oldest") rows = rows.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sortBy === "name") rows = rows.slice().sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "", "ar"));
    else if (sortBy === "domain") rows = rows.slice().sort((a, b) => (a.top1 || "").localeCompare(b.top1 || ""));
    else rows = rows.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return rows;
  }

  function renderResponsesTable() {
    const rows = filterSortResponses();
    const body = $("respBodyRows");
    body.innerHTML = "";
    if (!rows.length) {
      $("respStatusText").textContent = s.empty;
      return;
    }
    $("respStatusText").textContent = "";
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      respCols.forEach((c) => {
        const td = document.createElement("td");
        td.textContent = row[c] ?? "";
        tr.appendChild(td);
      });
      tr.addEventListener("click", () => showResponseDetail(row.id));
      body.appendChild(tr);
    });
  }

  async function showResponseDetail(id) {
    const res = await adminFetch(`/api/admin/responses/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    const panel = $("respDetail");
    panel.classList.remove("hidden");

    const answerLines = data.answers.map((a) => {
      const q = QUESTIONS[a.questionIndex];
      const opt = q.options.find((o) => o.code === a.code);
      return `<div class="detail-answer-row"><span>${s.question} ${a.questionIndex + 1}: ${q.ar}</span><strong>${opt ? opt.ar : a.code}</strong></div>`;
    }).join("");

    const mixLines = DOMAIN_ORDER.map((code) => `
      <div class="detail-answer-row">
        <span style="width:160px;">${I18N.ar.domainNames[code]}</span>
        <span class="mini-bar"><span style="width:${data.percentages[code]}%; background:${DOMAIN_COLORS[code]};"></span></span>
        <span>${data.percentages[code]}%</span>
      </div>`).join("");

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <strong>${data.full_name}</strong>
        <button class="small-btn" id="closeDetailBtn">${s.closeDetails}</button>
      </div>
      <h4 style="margin:0 0 10px;">${s.detailMix}</h4>
      ${mixLines}
      <h4 style="margin:18px 0 10px;">${s.detailAnswers}</h4>
      ${answerLines}
    `;
    $("closeDetailBtn").addEventListener("click", () => panel.classList.add("hidden"));
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  $("respSearch").addEventListener("input", renderResponsesTable);
  $("respSort").addEventListener("change", renderResponsesTable);

  // ===== رسائل تواصل معنا =====
  const msgCols = ["id", "full_name", "email", "phone", "message", "status", "created_at"];
  const msgHeadRow = $("msgHeadRow");
  msgCols.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = s.msgColumns[c];
    msgHeadRow.appendChild(th);
  });
  const msgActionsTh = document.createElement("th");
  msgHeadRow.appendChild(msgActionsTh);

  function filterSortMessages() {
    const q = $("msgSearch").value.trim().toLowerCase();
    let rows = messages.filter((m) =>
      !q || (m.full_name || "").toLowerCase().includes(q) || (m.message || "").toLowerCase().includes(q)
    );
    const sortBy = $("msgSort").value;
    if (sortBy === "oldest") rows = rows.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sortBy === "name") rows = rows.slice().sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "", "ar"));
    else rows = rows.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return rows;
  }

  function renderMessagesTable() {
    const rows = filterSortMessages();
    const body = $("msgBodyRows");
    body.innerHTML = "";
    if (!rows.length) {
      $("msgStatusText").textContent = s.empty;
      return;
    }
    $("msgStatusText").textContent = "";
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      msgCols.forEach((c) => {
        const td = document.createElement("td");
        if (c === "status") {
          td.innerHTML = row.status === "answered"
            ? `<span class="badge-pill" style="background:#E3F6EC;color:#1E9E5A;">${s.msgStatusAnswered}</span>`
            : `<span class="badge-pill" style="background:#EAF0FD;color:#001F65;">${s.msgStatusNew}</span>`;
        } else if (c === "message") {
          td.style.whiteSpace = "normal";
          td.style.maxWidth = "280px";
          td.textContent = row.message;
        } else {
          td.textContent = row[c] ?? "";
        }
        tr.appendChild(td);
      });
      const actionTd = document.createElement("td");
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "small-btn";
      toggleBtn.textContent = row.status === "answered" ? s.markNew : s.markAnswered;
      toggleBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const newStatus = row.status === "answered" ? "new" : "answered";
        const res = await adminFetch(`/api/admin/messages/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          row.status = newStatus;
          renderMessagesTable();
        }
      });
      actionTd.appendChild(toggleBtn);
      tr.appendChild(actionTd);
      body.appendChild(tr);
    });
  }

  $("msgSearch").addEventListener("input", renderMessagesTable);
  $("msgSort").addEventListener("change", renderMessagesTable);

  // ===== تسجيلات الفعاليات =====
  const regCols = ["id", "event_title_ar", "full_name", "email", "phone", "note", "created_at"];
  const regHeadRow = $("regHeadRow");
  regCols.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = s.regColumns[c];
    regHeadRow.appendChild(th);
  });

  function populateEventFilterDropdown() {
    const select = $("regFilterEvent");
    const prevValue = select.value;
    select.innerHTML = `<option value="">${s.regFilterEvent}</option>` +
      siteContentCache.activities.map((a) => `<option value="${a.id}">${a.title_ar}</option>`).join("");
    if (prevValue) select.value = prevValue;
  }

  function buildRegQuery() {
    const params = new URLSearchParams();
    if ($("regFilterEvent").value) params.set("eventId", $("regFilterEvent").value);
    if ($("regSearch").value.trim()) params.set("q", $("regSearch").value.trim());
    if ($("regDateFrom").value) params.set("dateFrom", $("regDateFrom").value);
    if ($("regDateTo").value) params.set("dateTo", $("regDateTo").value + "T23:59:59");
    return params.toString();
  }

  function renderRegistrationsTable(rows) {
    const body = $("regBodyRows");
    body.innerHTML = "";
    if (!rows.length) {
      $("regStatusText").textContent = s.empty;
      return;
    }
    $("regStatusText").textContent = "";
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      regCols.forEach((c) => {
        const td = document.createElement("td");
        td.textContent = row[c] ?? "";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }

  async function loadRegistrations() {
    const query = buildRegQuery();
    const res = await adminFetch(`/api/admin/event-registrations${query ? "?" + query : ""}`);
    const rows = res.ok ? await res.json() : [];
    renderRegistrationsTable(rows);
    $("regExportBtn").href = `/api/admin/event-registrations/export.csv${query ? "?" + query : ""}`;
  }

  $("regFilterEvent").addEventListener("change", loadRegistrations);
  $("regSearch").addEventListener("input", loadRegistrations);
  $("regDateFrom").addEventListener("change", loadRegistrations);
  $("regDateTo").addEventListener("change", loadRegistrations);

  // ===== إدارة المحتوى: من نحن =====
  function renderAboutImagePreview() {
    const url = pendingAboutImageUrl !== null ? pendingAboutImageUrl : siteContentCache.content.about_image_url;
    $("aboutImagePreviewWrap").innerHTML = url
      ? `<img src="${url}" alt="" style="max-width:220px;border-radius:10px;display:block;"><button type="button" class="small-btn danger" id="removeAboutImageBtn" style="margin-top:8px;">${s.removeImage}</button>`
      : "";
    const removeBtn = $("removeAboutImageBtn");
    if (removeBtn) removeBtn.addEventListener("click", () => { pendingAboutImageUrl = ""; renderAboutImagePreview(); });
  }

  $("aboutImageFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const res = await adminFetch("/api/admin/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      pendingAboutImageUrl = data.url;
      renderAboutImagePreview();
    }
  });

  $("saveAboutBtn").addEventListener("click", async () => {
    const payload = {
      about_text_ar: $("aboutTextAr").value,
      about_text_en: $("aboutTextEn").value,
    };
    if (pendingAboutImageUrl !== null) payload.about_image_url = pendingAboutImageUrl;
    await adminFetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    Object.assign(siteContentCache.content, payload);
    pendingAboutImageUrl = null;
    $("aboutSavedNote").textContent = s.savedMessage;
    $("aboutSavedNote").classList.remove("hidden");
    setTimeout(() => $("aboutSavedNote").classList.add("hidden"), 2500);
  });

  // ===== إدارة المحتوى: بيانات التواصل =====
  $("saveContactBtn").addEventListener("click", async () => {
    const payload = {
      contact_email: $("contactEmailInput").value.trim(),
      contact_phone: $("contactPhoneInput").value.trim(),
    };
    await adminFetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    Object.assign(siteContentCache.content, payload);
    $("contactSavedNote").textContent = s.savedMessage;
    $("contactSavedNote").classList.remove("hidden");
    setTimeout(() => $("contactSavedNote").classList.add("hidden"), 2500);
  });

  // ===== إدارة المحتوى: روابط التواصل الاجتماعي =====
  $("saveSocialBtn").addEventListener("click", async () => {
    const payload = {};
    SOCIAL_KEYS.forEach((key) => { payload[key] = $(`social_${key}`).value.trim(); });
    await adminFetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    Object.assign(siteContentCache.content, payload);
    $("socialSavedNote").textContent = s.savedMessage;
    $("socialSavedNote").classList.remove("hidden");
    setTimeout(() => $("socialSavedNote").classList.add("hidden"), 2500);
  });

  // ===== إدارة المحتوى: الأنشطة =====
  function renderActivitiesAdminList() {
    const list = $("activitiesAdminList");
    if (!siteContentCache.activities.length) {
      list.innerHTML = `<p class="status-text">${s.empty}</p>`;
      return;
    }
    list.innerHTML = siteContentCache.activities.map((a) => `
      <div class="activity-row" data-id="${a.id}">
        <div>
          <div class="activity-row-title">${a.title_ar}</div>
          <div class="activity-row-meta">${a.tag_ar || ""} · ${a.date_ar || ""} · ${STATUS_LABELS[a.status] || s.statusUpcoming}</div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="small-btn" data-action="edit" data-id="${a.id}">${s.editButton}</button>
          <button class="small-btn danger" data-action="delete" data-id="${a.id}">${s.deleteButton}</button>
        </div>
      </div>`).join("");

    list.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", () => startEditActivity(Number(btn.dataset.id)));
    });
    list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", () => deleteActivity(Number(btn.dataset.id)));
    });
  }

  function resetActivityForm() {
    editingActivityId = null;
    pendingActivityImageUrl = null;
    $("activityId").value = "";
    $("activityForm").reset();
    $("activityFormTitle").textContent = s.addActivity;
    $("cancelActivityBtn").classList.add("hidden");
    $("activityImagePreviewWrap").innerHTML = "";
  }

  function startEditActivity(id) {
    const a = siteContentCache.activities.find((x) => x.id === id);
    if (!a) return;
    editingActivityId = id;
    pendingActivityImageUrl = null;
    $("activityId").value = id;
    $("activityTitleAr").value = a.title_ar || "";
    $("activityTitleEn").value = a.title_en || "";
    $("activityTagAr").value = a.tag_ar || "";
    $("activityTagEn").value = a.tag_en || "";
    $("activityDateAr").value = a.date_ar || "";
    $("activityDateEn").value = a.date_en || "";
    $("activityDescAr").value = a.desc_ar || "";
    $("activityDescEn").value = a.desc_en || "";
    $("activityStatus").value = a.status || "upcoming";
    $("activityImagePreviewWrap").innerHTML = a.image_url
      ? `<img src="${a.image_url}" alt="" style="max-width:220px;border-radius:10px;display:block;">`
      : "";
    $("activityFormTitle").textContent = s.editActivity;
    $("cancelActivityBtn").classList.remove("hidden");
    $("activityForm").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function deleteActivity(id) {
    if (!confirm(s.confirmDelete)) return;
    await adminFetch(`/api/admin/activities/${id}`, { method: "DELETE" });
    siteContentCache.activities = siteContentCache.activities.filter((a) => a.id !== id);
    renderActivitiesAdminList();
  }

  $("activityImageFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const res = await adminFetch("/api/admin/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      pendingActivityImageUrl = data.url;
      $("activityImagePreviewWrap").innerHTML = `<img src="${data.url}" alt="" style="max-width:220px;border-radius:10px;display:block;">`;
    }
  });

  $("cancelActivityBtn").addEventListener("click", resetActivityForm);

  $("activityForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title_ar: $("activityTitleAr").value.trim(),
      title_en: $("activityTitleEn").value.trim(),
      tag_ar: $("activityTagAr").value.trim(),
      tag_en: $("activityTagEn").value.trim(),
      date_ar: $("activityDateAr").value.trim(),
      date_en: $("activityDateEn").value.trim(),
      desc_ar: $("activityDescAr").value.trim(),
      desc_en: $("activityDescEn").value.trim(),
      status: $("activityStatus").value,
    };
    if (pendingActivityImageUrl !== null) payload.image_url = pendingActivityImageUrl;

    if (editingActivityId) {
      await adminFetch(`/api/admin/activities/${editingActivityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await adminFetch("/api/admin/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    await loadSiteContentAdmin();
    resetActivityForm();
  });

  // ===== تحميل البيانات =====
  async function loadResponses() {
    const res = await adminFetch("/api/admin/responses");
    if (res.ok) responses = await res.json();
    renderResponsesTable();
  }

  async function loadMessages() {
    const res = await adminFetch("/api/admin/messages");
    if (res.ok) messages = await res.json();
    renderMessagesTable();
  }

  async function loadSiteContentAdmin() {
    const res = await fetch("/api/site-content");
    if (!res.ok) return;
    siteContentCache = await res.json();
    $("aboutTextAr").value = siteContentCache.content.about_text_ar || "";
    $("aboutTextEn").value = siteContentCache.content.about_text_en || "";
    $("contactEmailInput").value = siteContentCache.content.contact_email || "";
    $("contactPhoneInput").value = siteContentCache.content.contact_phone || "";
    SOCIAL_KEYS.forEach((key) => { $(`social_${key}`).value = siteContentCache.content[key] || ""; });
    renderAboutImagePreview();
    renderActivitiesAdminList();
    populateEventFilterDropdown();
  }

  Promise.all([loadResponses(), loadMessages(), loadSiteContentAdmin(), loadRegistrations()]).catch(() => {
    $("respStatusText").textContent = "تعذّر تحميل البيانات — تحقق من تسجيل الدخول";
  });
})();
