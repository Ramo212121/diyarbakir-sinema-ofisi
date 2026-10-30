/* ==========================================================
   Diyarbakır Sinema Ofisi
   Vanilla JS
   ========================================================== */

/* ---------- Kayıt formu sunucusu ---------- */
// Form Airtable'a doğrudan değil, Cloudflare Worker'a gönderir (worker/ klasörü).
// Bu iki değer gizli değildir; Airtable token'ı yalnızca Worker'da durur.
// Bilgisayarda (localhost) "npm run dev" ile açılan Worker ve Turnstile'ın test anahtarı kullanılır.
const YEREL = ["localhost", "127.0.0.1"].includes(location.hostname);
const KAYIT_API = YEREL ? "http://localhost:8787" : "https://api.diyarbakirsinemaofisi.com";
const TURNSTILE_SITE_KEY = YEREL ? "1x00000000000000000000AA" : "0x4AAAAAAFsVf1scQcPrbdmm";

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Header: kaydırınca arka plan ---------- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });


  /* ---------- Mobil menü ---------- */
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    document.body.classList.toggle("no-scroll", open);
  };

  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });


  /* ---------- Kaydırınca beliren öğeler ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }


  /* ---------- Sayaç animasyonu ---------- */
  const counters = document.querySelectorAll("[data-count]");

  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => countObserver.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count));
  }


  /* ---------- Film detay penceresi ---------- */
  // Filmlerin bilgileri index.html'de her kartın içindeki gizli .project__info bloğunda durur
  // (arama motorları da okuyabilsin diye). Ödül eklemek için oradaki listeye <li> eklemek yeter.

  const modal = document.getElementById("filmModal");
  const modalBody = document.getElementById("filmModalBody");
  // "Birincilik Ödülü", "Mansiyon Ödülü" vb.; festival adındaki "Ödülleri" sayılmaz
  const awardPattern = /Ödülü/;

  const renderList = (title, list) => {
    if (!list.length) return "";
    const items = list.map((text) => `<li>${esc(text)}</li>`).join("");
    return `<h4 class="film-modal__subtitle">${title}</h4><ul class="film-modal__list">${items}</ul>`;
  };

  const filmOf = (card) => {
    const info = card.querySelector(".project__info");
    return {
      meta: info.dataset.meta,
      credit: info.dataset.credit,
      items: [...info.querySelectorAll("li")].map((li) => li.textContent.trim()),
    };
  };

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

  const openFilm = (card) => {
    const film = filmOf(card);
    const poster = card.querySelector(".project__img img");

    document.getElementById("filmModalPoster").src = poster.src;
    document.getElementById("filmModalTitle").textContent = card.querySelector("h3").textContent;
    document.getElementById("filmModalMeta").textContent = film.meta;
    document.getElementById("filmModalCredit").textContent = film.credit;

    const awards = film.items.filter((t) => awardPattern.test(t));
    const others = film.items.filter((t) => !awardPattern.test(t));
    modalBody.innerHTML = film.items.length
      ? renderList("Ödüller", awards) + renderList("Festivaller ve Seçkiler", others)
      : `<p class="film-modal__empty">Bu film için festival bilgisi henüz eklenmedi.</p>`;

    modal.showModal();
    modalBody.scrollTop = 0;
    document.body.classList.add("no-scroll");
  };

  document.querySelectorAll(".project").forEach((card) => {
    card.querySelector(".project__open").addEventListener("click", () => openFilm(card));
  });

  document.getElementById("filmModalClose").addEventListener("click", () => modal.close());
  // pencerenin dışına (arka plana) tıklayınca kapat
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  modal.addEventListener("close", () => document.body.classList.remove("no-scroll"));


  /* ---------- Galeri büyük görünüm ---------- */
  const galleryItems = [...document.querySelectorAll(".gallery__item")];
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCount = document.getElementById("lightboxCount");
  let current = 0;

  const showPhoto = (index) => {
    current = (index + galleryItems.length) % galleryItems.length;
    const img = galleryItems[current].querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCount.textContent = `${current + 1} / ${galleryItems.length}`;
  };

  galleryItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      showPhoto(i);
      lightbox.showModal();
      document.body.classList.add("no-scroll");
    });
  });

  document.getElementById("lightboxPrev").addEventListener("click", () => showPhoto(current - 1));
  document.getElementById("lightboxNext").addEventListener("click", () => showPhoto(current + 1));
  document.getElementById("lightboxClose").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener("close", () => document.body.classList.remove("no-scroll"));
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") showPhoto(current - 1);
    if (e.key === "ArrowRight") showPhoto(current + 1);
  });

  // telefonda sağa/sola kaydırarak geçiş
  let touchX = null;
  lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showPhoto(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });


  /* ---------- Casting başvuru formu → Airtable ---------- */
  // Form, aşağıdaki SECTIONS listesinden oluşturulur; her alanın "name"i Airtable'daki sütun adıdır.
  // Kendi süslü parantezi içinde: değişken adları sayfanın geri kalanıyla çakışmasın.
  {
    // Airtable'ın uploadAttachment ucu dosya başına en fazla 5 MB kabul eder
    const MAX_FILE_BYTES = 5 * 1024 * 1024;
    // Seçilen fotoğraf göndermeden önce küçültüldüğü için daha büyüğü de kabul edilir
    const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;
    // Uzun kenar en fazla bu kadar piksel; Airtable'ın ücretsiz 1 GB alanı daha çok başvuruya yeter
    const FOTO_UZUN_KENAR = 1600;

    const ILLER = ["Diyarbakır", "Mardin", "Batman", "Siirt", "Şanlıurfa", "Gaziantep", "Malatya", "Bingöl", "Elazığ", "Diğer"];
    // Profesyonel çekim isteyen adayın kendi materyali yoktur; bağlantılar yalnızca "Hayır" diyene sorulur
    const PRO_CEKIM = ["Profesyonel Çekim İstiyorum", "Hayır"];
    const KATILIM = ["Evet", "Hayır"];
    const EMAIL_DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "icloud.com", "yahoo.com", "yandex.com"];

    // "name" Airtable'daki sütun adıdır: birebir aynı olmalı.
    // minor: true → 18 yaş altı seçilirse zorunlu
    const SECTIONS = [
      {
        title: "1. Kimlik ve İletişim Bilgileri",
        short: "Kimlik ve iletişim",
        note: "Size ulaşabilmemiz için temel bilgileriniz.",
        fields: [
          { name: "Adınız ve soyadınız", type: "text", required: true, autocomplete: "name" },
          { name: "Doğum tarihiniz", type: "date", required: true },
          { name: "18 yaşından küçük müsünüz?", type: "radio", required: true, half: true, options: ["Evet", "Hayır"] },
          { name: "Cinsiyet", type: "radio", required: true, half: true, options: ["Kadın", "Erkek"] },
          { name: "Yaşadığınız il", type: "select", required: true, options: ILLER },
          { name: "Yaşadığınız ilçe", type: "text", required: true },
          { name: "E-posta adresiniz", type: "email", required: true, full: true },
          { name: "Telefon numaranız", type: "tel", required: true, autocomplete: "tel", help: "Örnek: 0532 123 45 67", placeholder: "05XX XXX XX XX" },
          { name: "Instagram profil bağlantınız (isteğe bağlı)", type: "text", placeholder: "instagram.com/kullaniciadi" },
          { name: "Hakkınızda (kendinizi üç cümle ile ifade ediniz.)", type: "textarea", required: true, full: true },
          { name: "Portre fotografınızı ekleyiniz.", type: "file", required: true, accept: "image/*", hint: "JPG, PNG · büyük fotoğraflar otomatik küçültülür", full: true },
        ],
      },
      {
        title: "2. Başvuru Türü ve Fiziksel Bilgiler",
        short: "Fiziksel bilgiler",
        note: "Rol eşleştirmesi için kullanılır.",
        fields: [
          { name: "Hangi alanlarda değerlendirilmek istersiniz?", type: "check", required: true, full: true, help: "Birden fazla seçenek seçebilirsiniz.",
            options: ["Oyuncu", "Yardımcı oyuncu", "Figüran", "Reklam oyuncusu", "Çocuk oyuncu (veli/yasal temsilci üzerinden)", "Diğer"] },
          { name: "Boyunuz (cm)", type: "text", required: true, inputmode: "numeric", help: "Örnek: 174", numeric: [50, 250] },
          { name: "Kilonuz (kg)", type: "text", required: true, help: "Örnek: 68", inputmode: "numeric", numeric: [10, 250] },
          { name: "Göz renginiz", type: "select", required: true, options: ["Kahverengi", "Ela", "Mavi", "Yeşil", "Siyah", "Diğer", "Belirtmek istemiyorum"] },
          { name: "Saç renginiz", type: "select", required: true, options: ["Siyah", "Kahverengi", "Kumral", "Sarı", "Kızıl", "Beyaz / gri", "Diğer", "Belirtmek istemiyorum"] },
          { name: "Kıyafet bedeniniz", type: "text", required: true, help: "Örnek: M veya 38" },
          { name: "Ayakkabı numaranız", type: "text", required: true, help: "Örnek: 42", inputmode: "numeric" },
        ],
      },
      {
        title: "3. Deneyim, Diller ve Yetenekler",
        short: "Deneyim ve yetenekler",
        note: "Deneyiminiz yoksa sorun değil, deneyimsiz adaylar da başvurabilir.",
        fields: [
          { name: "Daha önce oyunculuk veya figüranlık yaptınız mı?", type: "radio", required: true, options: ["Evet", "Hayır"], full: true },
          { name: "Yer aldığınız projeler ve roller (varsa)", type: "textarea", required: true, help: "Yoksa “Yok” yazın.", full: true },
          { name: "Oyunculuk eğitimi aldınız mı?", type: "radio", options: ["Evet", "Hayır"], full: true },
          { name: "Oyunculuk eğitimleriniz (varsa)", type: "textarea", required: true, help: "Yoksa “Yok” yazın.", full: true },
          { name: "Konuşabildiğiniz diller", type: "check", required: true, full: true,
            options: ["Türkçe", "Kürtçe (Kurmancî)", "Zazaca (Kırmanckî)", "Arapça", "İngilizce", "Diğer"] },
          { name: "Özel becerileriniz (varsa)", type: "check", full: true,
            options: ["Araç kullanma", "At binme", "Yüzme", "Dans", "Müzik aleti çalma", "Şarkı söyleme", "Spor", "Dövüş sanatları", "Diğer", "Belirtmek istemiyorum"] },
          { name: "Özel becerilerinizle ilgili detaylar (isteğe bağlı)", type: "textarea", full: true },
        ],
      },
      {
        title: "4. Fotoğraf, Portföy ve Video",
        short: "Fotoğraf ve video",
        note: "Profesyonel fotoğraf / portföy çekimine ihtiyacınız varsa “Evet”i seçin, sizinle iletişime geçelim. Kendi fotoğraflarınız varsa “Hayır”ı seçip yükleyin; videolar için herkese açık bir bağlantı paylaşın.",
        fields: [
          { name: "Profesyonel Çekim İstiyorum", type: "radio", required: true, options: ["Evet", "Hayır"], full: true },
          { name: "Güncel yüz fotoğrafı", type: "file", showIf: PRO_CEKIM, required: true, accept: "image/*", hint: "JPG, PNG · büyük fotoğraflar otomatik küçültülür" },
          { name: "Güncel boy fotoğrafı", type: "file", showIf: PRO_CEKIM, required: true, accept: "image/*", hint: "JPG, PNG · büyük fotoğraflar otomatik küçültülür" },
          { name: "Tanıtım videosu bağlantısı (Youtube , Drive veya Vimeo)", type: "url", showIf: PRO_CEKIM, placeholder: "https://", full: true },
          { name: "Oyunculuk portföyü / showreel bağlantısı", type: "url", showIf: PRO_CEKIM, placeholder: "https://", full: true },
        ],
      },
      {
        title: "5. Çekimlere Katılım",
        short: "Çekimlere katılım",
        note: "Uygunluk durumunuz.",
        fields: [
          { name: "Şehir dışındaki çekimlere katılabilir misiniz?", type: "radio", required: true, options: KATILIM, full: true },
          { name: "Kısa süreli çekimlere katılabilir misiniz?", type: "radio", required: true, options: KATILIM, full: true },
          { name: "Uzun süreli projelerde yer alabilir misiniz?", type: "radio", required: true, options: KATILIM, full: true },
          { name: "Bir oyunculuk veya casting ajansına kayıtlı mısınız?", type: "radio", required: true, options: ["Evet", "Hayır"], full: true },
          { name: "Başvurunuza eklemek istedikleriniz", type: "textarea", full: true },
        ],
      },
      {
        title: "6. Çocuk Oyuncu Başvuruları (yalnızca 18 yaş altı için)",
        short: "Veli / yasal temsilci",
        note: "Yalnızca 18 yaşından küçük adayların velisi veya yasal temsilcisi doldurmalıdır.",
        minorStep: true,
        fields: [
          { name: "Veli / yasal temsilcinin adı soyadı", type: "text", minor: true },
          { name: "Veli / yasal temsilcinin telefon numarası", type: "tel", minor: true, help: "Örnek: 0532 123 45 67", placeholder: "05XX XXX XX XX" },
          { name: "Başvuruyu yapan kişi", type: "radio", minor: true, full: true,
            options: ["Adayın kendisi (18 yaş ve üzeri)", "Veli / yasal temsilci", "Diğer"] },
        ],
      },
      {
        title: "7. Başvuru Beyanı ve Onay",
        short: "Beyan ve onay",
        note: "Bilgileriniz yalnızca casting değerlendirmesi için kullanılır ve izniniz olmadan üçüncü kişilerle paylaşılmaz. Profilinizin yapım şirketleriyle paylaşılmasına izin vermemeniz başvurunuzu engellemez.",
        fields: [
          { name: "Bilgilerinizi doğru verdiğinizi ve başvuru koşullarını okuduğunuzu onaylıyor musunuz?", type: "radio", required: true, mustBe: "Evet, onaylıyorum",
            options: ["Evet, onaylıyorum", "Hayır"], full: true },
          { name: "Aday profilimin, hukuken gerekli olduğu durumlarda, ayrı açıklanacak şartlarla ilgili yapım şirketleriyle paylaşılmasına onay veriyorum.", type: "radio",
            options: ["Evet, izin veriyorum", "Hayır, izin vermiyorum"], full: true },
        ],
      },
      {
        title: "8. Özet ve Gönder",
        short: "Özet ve gönder",
        note: "Bilgilerinizi kontrol edin. Değiştirmek istediğiniz bölümde “Düzenle”ye basın.",
        summary: true,
        fields: [],
      },
    ];

    const form = document.getElementById("castingForm");
    const stepsEl = document.getElementById("castingSteps");
    const dotsEl = document.getElementById("castingDots");
    const vstepsEl = document.getElementById("castingVsteps");
    const statusEl = document.getElementById("castingStatus");
    const prevBtn = document.getElementById("castingPrev");
    const nextBtn = document.getElementById("castingNext");
    const submitBtn = document.getElementById("castingSubmit");
    const submitLabel = document.getElementById("castingSubmitLabel");
    const spinner = document.getElementById("castingSpinner");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const formatSize = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

    /* ---------- Formu oluştur ---------- */
    const fields = [];
    let uid = 0;

    const controlHTML = (f, id) => {
      const attrs = [
        f.placeholder && `placeholder="${esc(f.placeholder)}"`,
        f.autocomplete && `autocomplete="${f.autocomplete}"`,
        f.inputmode && `inputmode="${f.inputmode}"`,
      ].filter(Boolean).join(" ");

      switch (f.type) {
        case "radio":
        case "check":
          return `<div class="choices">${f.options.map((o) =>
            `<label class="choice"><input type="${f.type === "radio" ? "radio" : "checkbox"}" name="${id}" value="${esc(o)}"><span>${esc(o)}</span></label>`
          ).join("")}</div>`;
        case "select":
          return `<select id="${id}"><option value="">Seçiniz</option>${f.options.map((o) => `<option>${esc(o)}</option>`).join("")}</select>`;
        case "textarea":
          return `<textarea id="${id}" rows="4" ${attrs}></textarea>`;
        case "file":
          return `<div class="drop">
              <input type="file" id="${id}" accept="${f.accept}">
              <span class="drop__icon">+</span>
              <span class="drop__text"><strong>Dosya seçin veya sürükleyin</strong><small>${esc(f.hint)}</small></span>
              <button type="button" class="drop__clear" hidden>Kaldır</button>
            </div>`;
        case "email":
          // kullanıcı adı + @ + listeden alan adı; listede yoksa "Diğer" ile elle yazılır
          return `<div class="email">
              <input type="text" id="${id}" class="email__local" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" placeholder="kullaniciadi">
              <span class="email__at">@</span>
              <select class="email__domain" aria-label="E-posta alan adı">${EMAIL_DOMAINS.map((d) => `<option>${d}</option>`).join("")}<option value="">Diğer…</option></select>
              <input type="text" class="email__other" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="alanadi.com" aria-label="E-posta alan adı" hidden>
            </div>`;
        case "tel":
          return `<input type="tel" id="${id}" maxlength="14" ${attrs}>`;
        default:
          return `<input type="${f.type}" id="${id}" ${attrs}>`;
      }
    };

    SECTIONS.forEach((section, s) => {
      const step = document.createElement("fieldset");
      step.className = "step";
      step.hidden = true;
      step.innerHTML = `<legend class="step__title">${esc(section.title)}</legend><p class="step__note">${esc(section.note)}</p>`;

      if (section.summary) {
        step.insertAdjacentHTML("beforeend", `<div class="summary" id="castingSummary"></div><div class="cf__turnstile" id="castingTurnstile"></div>`);
      } else {
        const grid = document.createElement("div");
        grid.className = "fields";
        section.fields.forEach((f) => {
          const id = `f${++uid}`;
          const group = f.type === "radio" || f.type === "check";
          const star = f.required ? ` <span class="req" aria-hidden="true">*</span>` : "";
          const wrap = document.createElement(group ? "fieldset" : "div");
          // seçenekli sorular tam genişlik; half: true olanlar yan yana durur
          wrap.className = `field${f.full || (group && !f.half) || f.type === "textarea" ? " field--full" : ""}`;
          wrap.innerHTML =
            (group ? `<legend>${esc(f.name)}${star}</legend>` : `<label for="${id}">${esc(f.name)}${star}</label>`) +
            controlHTML(f, id) +
            (f.help ? `<span class="field__help">${esc(f.help)}</span>` : "") +
            `<span class="field__error"></span>`;
          grid.appendChild(wrap);
          fields.push({ ...f, el: wrap, step: s });
        });
        step.appendChild(grid);
      }
      stepsEl.appendChild(step);
      dotsEl.insertAdjacentHTML("beforeend", `<li><button type="button" class="dot" data-step="${s}" aria-label="${esc(section.title)}">${s + 1}</button></li>`);
      vstepsEl.insertAdjacentHTML("beforeend", `<li><button type="button" class="vstep" data-step="${s}"><b>${s + 1}</b><span>${esc(section.short)}</span></button></li>`);
    });

    const steps = [...stepsEl.children];
    // üstteki numaralı adımlar (telefon) ve soldaki adım listesi (bilgisayar) aynı şekilde güncellenir
    const dots = [...dotsEl.querySelectorAll(".dot")];
    const vsteps = [...vstepsEl.querySelectorAll(".vstep")];
    const stepNavs = [dots, vsteps];
    const LAST = steps.length - 1;
    const MINOR_STEP = SECTIONS.findIndex((s) => s.minorStep);

    /* ---------- Değer okuma ve doğrulama ---------- */
    const fileOf = (f) => f.el.querySelector('input[type="file"]').files[0];

    const valuesOf = (f) => {
      if (f.type === "radio" || f.type === "check") {
        return [...f.el.querySelectorAll("input:checked")].map((i) => i.value);
      }
      if (f.type === "file") {
        const file = fileOf(f);
        return file ? [file.name] : [];
      }
      if (f.type === "email") {
        const local = f.el.querySelector(".email__local").value.trim();
        const select = f.el.querySelector(".email__domain");
        const domain = (select.value || f.el.querySelector(".email__other").value).trim().replace(/^@/, "");
        return local ? [`${local}@${domain}`] : [];
      }
      const v = f.el.querySelector("input, select, textarea").value.trim();
      return v ? [v] : [];
    };

    const field = (name) => fields.find((f) => f.name === name);
    const isMinor = () => valuesOf(field("18 yaşından küçük müsünüz?"))[0] === "Evet";
    const isRequired = (f) => f.required || (f.minor && isMinor());
    // showIf: [soru, cevap] → alan yalnızca o soruya bu cevap verilince görünür
    const isHidden = (f) => !!f.showIf && valuesOf(field(f.showIf[0]))[0] !== f.showIf[1];
    const updateConditional = () => fields.forEach((f) => {
      f.el.hidden = isHidden(f);
      if (f.el.hidden) {
        f.el.classList.remove("has-error");
        f.el.querySelector(".field__error").textContent = "";
      }
    });

    const validate = (f) => {
      const values = valuesOf(f);
      const v = values[0];
      let error = "";

      if (isRequired(f) && !values.length) error = "Bu alan zorunludur.";
      else if (!values.length) error = "";
      else if (f.type === "email" && !emailRe.test(v)) error = "Geçerli bir e-posta adresi girin.";
      else if (f.type === "tel" && !/^0\d{10}$/.test(v.replace(/\D/g, ""))) error = "Numarayı başında 0 ile 11 hane yazın (örn. 0532 123 45 67).";
      else if (f.type === "url" && !/^(https?:\/\/)?[^\s.]+\.\S+$/i.test(v)) error = "Geçerli bir bağlantı girin.";
      else if (f.type === "date" && new Date(v) > new Date()) error = "Doğum tarihi bugünden sonra olamaz.";
      else if (f.numeric && !(Number(v.replace(",", ".")) >= f.numeric[0] && Number(v.replace(",", ".")) <= f.numeric[1])) error = "Lütfen geçerli bir sayı girin.";
      else if (f.mustBe && v !== f.mustBe) error = "Başvurunun alınabilmesi için onay gereklidir.";
      else if (f.type === "file") {
        const file = fileOf(f);
        const okType = f.accept.split(",").some((a) => (a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : file.type === a));
        if (!okType) error = "Bu dosya türü desteklenmiyor.";
        else if (file.size > MAX_ORIGINAL_BYTES) error = `Fotoğraf en fazla 25 MB olabilir (seçilen: ${formatSize(file.size)}).`;
      }

      f.el.classList.toggle("has-error", !!error);
      f.el.querySelector(".field__error").textContent = error;
      return !error;
    };

    /* ---------- Telefon ve e-posta alanları ---------- */
    // 05321234567 → "0532 123 45 67"; imleç yazılan rakamın yanında kalır
    const formatPhone = (digits) =>
      [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 9), digits.slice(9, 11)].filter(Boolean).join(" ");

    fields.filter((f) => f.type === "tel").forEach((f) => {
      const input = f.el.querySelector("input");
      input.addEventListener("input", () => {
        const before = input.value.slice(0, input.selectionStart).replace(/\D/g, "").length;
        input.value = formatPhone(input.value.replace(/\D/g, "").slice(0, 11));
        let pos = 0;
        for (let n = 0; pos < input.value.length && n < before; pos++) if (/\d/.test(input.value[pos])) n++;
        input.setSelectionRange(pos, pos);
      });
    });

    const refreshEmail = (f) => {
      const other = f.el.querySelector(".email__other");
      other.hidden = f.el.querySelector(".email__domain").value !== "";
    };

    fields.filter((f) => f.type === "email").forEach((f) => {
      const local = f.el.querySelector(".email__local");
      const select = f.el.querySelector(".email__domain");
      const other = f.el.querySelector(".email__other");
      // "@" yazılırsa ya da tam adres yapıştırılırsa alan adı kısmı listeye taşınır
      local.addEventListener("input", () => {
        if (!local.value.includes("@")) return;
        const [name, domain = ""] = local.value.split("@");
        local.value = name;
        if (!domain) { select.focus(); return; }
        const known = EMAIL_DOMAINS.find((d) => d === domain.toLowerCase());
        select.value = known || "";
        if (!known) other.value = domain;
        refreshEmail(f);
      });
      select.addEventListener("change", () => {
        refreshEmail(f);
        if (!other.hidden) other.focus();
      });
    });

    fields.forEach((f) => {
      const recheck = () => { if (f.el.classList.contains("has-error")) validate(f); };
      f.el.addEventListener("input", recheck);
      f.el.addEventListener("change", recheck);
    });

    /* ---------- Dosya alanları ---------- */
    const refreshFile = (f) => {
      const file = fileOf(f);
      const icon = f.el.querySelector(".drop__icon");
      const title = f.el.querySelector(".drop__text strong");
      const small = f.el.querySelector(".drop__text small");
      const clear = f.el.querySelector(".drop__clear");
      if (icon.dataset.url) URL.revokeObjectURL(icon.dataset.url);
      delete icon.dataset.url;

      if (!file) {
        icon.textContent = "+";
        title.textContent = "Dosya seçin veya sürükleyin";
        small.textContent = f.hint;
        clear.hidden = true;
        return;
      }
      title.textContent = file.name;
      small.textContent = formatSize(file.size);
      clear.hidden = false;
      if (file.type.startsWith("image/")) {
        icon.dataset.url = URL.createObjectURL(file);
        icon.innerHTML = `<img src="${icon.dataset.url}" alt="">`;
      } else {
        icon.textContent = file.type.startsWith("video/") ? "▶" : "✓";
      }
    };

    fields.filter((f) => f.type === "file").forEach((f) => {
      const input = f.el.querySelector('input[type="file"]');
      const drop = f.el.querySelector(".drop");
      input.addEventListener("change", () => { refreshFile(f); validate(f); });
      f.el.querySelector(".drop__clear").addEventListener("click", () => {
        input.value = "";
        refreshFile(f);
        validate(f);
      });
      ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.add("is-over")));
      ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove("is-over")));
    });

    /* ---------- Adımlar ---------- */
    let current = 0;
    let reached = 0;
    let baslangic = null; // spam koruması: formla ilk etkileşim zamanı

    // 18 yaş altı değilse 6. bölüm atlanır
    const isSkipped = (i) => i === MINOR_STEP && !isMinor();
    const nextIndex = (i, dir) => {
      let n = i + dir;
      while (isSkipped(n)) n += dir;
      return n;
    };

    const setStatus = (text, type) => {
      statusEl.textContent = text;
      statusEl.className = `status${type ? ` is-${type}` : ""}`;
      statusEl.hidden = !text;
    };

    const showStep = (i, { scroll = true, keepStatus = false } = {}) => {
      current = i;
      reached = Math.max(reached, i);
      steps.forEach((s, n) => {
        s.hidden = n !== i;
        s.classList.toggle("is-entering", n === i);
      });
      stepNavs.forEach((list) => list.forEach((d, n) => {
        d.classList.toggle("is-current", n === i);
        d.classList.toggle("is-done", n < i || (n <= reached && n !== i));
        d.classList.toggle("is-skipped", isSkipped(n));
      }));

      prevBtn.hidden = i === 0;
      nextBtn.hidden = i === LAST;
      submitBtn.hidden = i !== LAST;
      document.getElementById("castingStepNow").textContent = i + 1;
      document.getElementById("castingStepTotal").textContent = steps.length;
      document.getElementById("castingStepName").textContent = SECTIONS[i].title.replace(/^\d+\.\s*/, "");
      document.getElementById("castingProgress").style.width = `${((i + 1) / steps.length) * 100}%`;

      if (i === LAST) { renderSummary(); turnstileYukle(); }
      if (!keepStatus) setStatus("");
      if (scroll) form.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const stepIsValid = (i) => {
      const invalid = fields.filter((f) => f.step === i && !isHidden(f)).filter((f) => !validate(f));
      if (invalid.length) invalid[0].el.scrollIntoView({ behavior: "smooth", block: "center" });
      return !invalid.length;
    };

    nextBtn.addEventListener("click", () => { if (stepIsValid(current)) showStep(nextIndex(current, 1)); });
    prevBtn.addEventListener("click", () => showStep(nextIndex(current, -1)));
    stepNavs.forEach((list) => list.forEach((d, n) => d.addEventListener("click", () => {
      if (n <= reached && !isSkipped(n) && n !== current) showStep(n);
    })));

    // son adımdan önce Enter formu göndermesin, bir sonraki adıma geçsin
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && current < LAST) {
        e.preventDefault();
        nextBtn.click();
      }
    });

    // cevaplar değişince koşullu alanları ve adım çubuğunu güncelle
    form.addEventListener("change", () => {
      updateConditional();
      stepNavs.forEach((list) => list[MINOR_STEP].classList.toggle("is-skipped", isSkipped(MINOR_STEP)));
    });
    updateConditional();

    /* ---------- Özet ---------- */
    const renderSummary = () => {
      document.getElementById("castingSummary").innerHTML = SECTIONS.slice(0, LAST).map((section, s) => {
        if (isSkipped(s)) return "";
        const rows = fields
          .filter((f) => f.step === s && !isHidden(f))
          .map((f) => {
            const values = valuesOf(f);
            if (!values.length) return "";
            if (f.type === "file") {
              const url = f.el.querySelector(".drop__icon").dataset.url;
              return `<dt>${esc(f.name)}</dt><dd>${url ? `<img class="summary__photo" src="${url}" alt="">` : ""}${esc(values[0])}</dd>`;
            }
            const shown = f.type === "date" ? values[0].split("-").reverse().join(".") : values.join(", ");
            return `<dt>${esc(f.name)}</dt><dd>${esc(shown)}</dd>`;
          })
          .join("");
        return `<div class="summary__group">
            <div class="summary__head"><h3>${esc(section.title)}</h3><button type="button" class="summary__edit" data-step="${s}">Düzenle</button></div>
            ${rows ? `<dl>${rows}</dl>` : `<p class="summary__empty">Bu bölümde bilgi girilmedi.</p>`}
          </div>`;
      }).join("");
    };

    document.getElementById("castingSummary").addEventListener("click", (e) => {
      const btn = e.target.closest(".summary__edit");
      if (btn) showStep(Number(btn.dataset.step));
    });

    /* ---------- Airtable'a gönderim ---------- */
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

    // Fotoğraf tarayıcıda küçültülüp JPEG yapılır; açılamazsa (örn. bazı HEIC'ler) orijinali gider
    const compressImage = async (file) => {
      try {
        const bmp = await createImageBitmap(file);
        const scale = Math.min(1, FOTO_UZUN_KENAR / Math.max(bmp.width, bmp.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bmp.width * scale);
        canvas.height = Math.round(bmp.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff"; // saydam PNG'ler siyah çıkmasın
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
        if (!blob || blob.size >= file.size) return file;
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
      } catch {
        return file;
      }
    };

    // Worker'ın hata kodu (turnstile, rate, airtable…) err.code olarak taşınır
    const post = async (path, body) => {
      const res = await fetch(KAYIT_API + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(`${path} (${res.status})`), { code: data.error });
      return data;
    };

    // Kayıt { id, ticket } döner; bilet, fotoğrafların yalnızca bu kayda yüklenebilmesini sağlar
    const createRecord = (data) => post("/basvuru", { fields: data, turnstile: turnstileToken });

    const uploadFile = async (record, column, file) =>
      post("/dosya", { ...record, field: column, contentType: file.type, filename: file.name, file: await toBase64(file) });

    /* ---------- Turnstile: robot kontrolü (Worker sunucuda doğrular) ---------- */
    // Betik formla ilk etkileşimde arka planda iner; kontrol son adımda başlar
    let turnstileId = null;
    let turnstileToken = "";
    let turnstileBetik = null;
    const turnstileBetikYukle = () =>
      (turnstileBetik ||= new Promise((resolve) => {
        window.onTurnstileLoad = resolve;
        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit";
        s.async = true;
        document.head.appendChild(s);
      }));
    const turnstileYukle = async () => {
      await turnstileBetikYukle();
      if (turnstileId !== null) return;
      turnstileId = window.turnstile.render("#castingTurnstile", {
        sitekey: TURNSTILE_SITE_KEY,
        language: "tr",
        appearance: "interaction-only", // çoğu kişi hiçbir şey görmez; şüphelide kutucuk çıkar
        callback: (t) => { turnstileToken = t; },
        "expired-callback": () => { turnstileToken = ""; },
        "error-callback": () => { turnstileToken = ""; },
      });
    };
    // Gönder'e kontrol bitmeden basılırsa hata yerine biraz beklenir
    const turnstileBekle = (ms = 15000) =>
      new Promise((resolve) => {
        const bitis = Date.now() + ms;
        const kontrol = () => (turnstileToken || Date.now() > bitis ? resolve(turnstileToken) : setTimeout(kontrol, 250));
        kontrol();
      });
    // jeton tek kullanımlık: her gönderim denemesinden sonra yenilenir
    const turnstileSifirla = () => {
      turnstileToken = "";
      if (turnstileId !== null) window.turnstile.reset(turnstileId);
    };

    const setBusy = (busy, label = "Gönderiliyor...") => {
      form.classList.toggle("is-loading", busy);
      form.setAttribute("aria-busy", String(busy));
      submitBtn.disabled = busy;
      prevBtn.disabled = busy;
      spinner.hidden = !busy;
      submitLabel.textContent = busy ? label : "Gönder";
    };

    const resetForm = () => {
      form.reset();
      fields.filter((f) => f.type === "file").forEach(refreshFile);
      fields.filter((f) => f.type === "email").forEach(refreshEmail);
      fields.forEach((f) => {
        f.el.classList.remove("has-error");
        f.el.querySelector(".field__error").textContent = "";
      });
      reached = 0;
      baslangic = null; // süre bir sonraki doldurmada yeniden başlar
      updateConditional();
    };

    /* ---------- Spam koruması: tarayıcı tarafı (asıl koruma Worker'da: Turnstile + IP sınırı) ---------- */
    const MIN_DOLDURMA_SN = 15;        // 8 adımı bundan kısa sürede bitiren insan olmaz
    const TEKRAR_BEKLEME_DK = 10;      // aynı tarayıcıdan art arda başvuru arası
    const SON_GONDERIM = "dso_son_basvuru";
    const honeypot = form.querySelector('input[name="website"]');
    // süre, sayfanın açılışından değil formla ilk etkileşimden sayılır (başlangıç: resetForm'un üstünde)
    form.addEventListener("focusin", () => {
      if (!baslangic) baslangic = Date.now();
      turnstileBetikYukle();
    });

    const sonGonderim = () => { try { return Number(localStorage.getItem(SON_GONDERIM)) || 0; } catch { return 0; } };
    const gonderimiKaydet = () => { try { localStorage.setItem(SON_GONDERIM, String(Date.now())); } catch {} };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (current !== LAST) return;
      setStatus("");

      // gizli alanı yalnızca botlar doldurur: başarılı görünür ama hiçbir yere gönderilmez
      if (honeypot.value) {
        resetForm();
        showStep(0, { keepStatus: true });
        setStatus("Başvurunuz başarıyla alındı.", "success");
        return;
      }
      const gecenDk = (Date.now() - sonGonderim()) / 60000;
      if (gecenDk < TEKRAR_BEKLEME_DK) {
        setStatus(`Kısa süre önce bu cihazdan bir başvuru gönderildi. Yeni başvuru için lütfen ${Math.ceil(TEKRAR_BEKLEME_DK - gecenDk)} dakika sonra tekrar deneyin.`, "error");
        return;
      }
      if (!baslangic || (Date.now() - baslangic) / 1000 < MIN_DOLDURMA_SN) {
        setStatus("Form çok hızlı gönderildi. Lütfen bilgilerinizi kontrol edip birkaç saniye sonra tekrar deneyin.", "error");
        return;
      }

      const invalid = fields.filter((f) => !isSkipped(f.step) && !isHidden(f) && !validate(f));
      if (invalid.length) {
        showStep(invalid[0].step, { scroll: false });
        invalid[0].el.scrollIntoView({ behavior: "smooth", block: "center" });
        setStatus("Lütfen işaretli alanları kontrol edin.", "error");
        return;
      }

      if (TURNSTILE_SITE_KEY.startsWith("BURAYA")) {
        setStatus("Form şu an bakımda, lütfen daha sonra tekrar deneyin.", "error");
        console.warn("TURNSTILE_SITE_KEY doldurulmalı (script.js başı).");
        return;
      }
      if (!turnstileToken) {
        setBusy(true, "Güvenlik kontrolü yapılıyor...");
        turnstileYukle();
        await turnstileBekle();
        setBusy(false);
      }
      if (!turnstileToken) {
        setStatus("Robot kontrolü henüz tamamlanmadı. Lütfen birkaç saniye bekleyip tekrar deneyin; reklam engelleyici kullanıyorsanız bu sayfa için kapatın.", "error");
        return;
      }

      // Çoklu seçim (checkbox) dizi, diğerleri metin olarak gider; boş alanlar atlanır. Dosyalar ayrıca yüklenir.
      const data = {};
      const files = [];
      fields.forEach((f) => {
        if (isSkipped(f.step) || isHidden(f)) return;
        if (f.type === "file") {
          const file = fileOf(f);
          if (file) files.push({ column: f.name, file });
          return;
        }
        const values = valuesOf(f);
        if (values.length) data[f.name] = f.type === "check" ? values : values[0];
      });
      if (!isMinor()) data["Başvuruyu yapan kişi"] = "Adayın kendisi (18 yaş ve üzeri)";

      // Fotoğraflar kayıttan önce hazırlanır: sığmayan varsa boşuna kayıt oluşturulmaz
      setBusy(true, "Fotoğraflar hazırlanıyor...");
      for (const item of files) item.file = await compressImage(item.file);
      const tooBig = files.find(({ file }) => file.size > MAX_FILE_BYTES);
      if (tooBig) {
        setBusy(false);
        const f = field(tooBig.column);
        showStep(f.step, { scroll: false });
        f.el.classList.add("has-error");
        f.el.querySelector(".field__error").textContent = "Bu fotoğraf küçültülemedi ve 5 MB'tan büyük. Lütfen başka bir fotoğraf seçin.";
        f.el.scrollIntoView({ behavior: "smooth", block: "center" });
        setStatus("Lütfen işaretli fotoğrafı değiştirin.", "error");
        return;
      }

      let record = null;
      setBusy(true);
      try {
        record = await createRecord(data);
        for (const [i, { column, file }] of files.entries()) {
          setBusy(true, `Dosyalar yükleniyor (${i + 1}/${files.length})...`);
          await uploadFile(record, column, file);
        }
        gonderimiKaydet();
        resetForm();
        showStep(0, { keepStatus: true });
        setStatus("Başvurunuz başarıyla alındı. İlginiz için teşekkür ederiz; uygun projelerde sizinle iletişime geçilecektir.", "success");
      } catch (err) {
        console.error("Gönderim hatası:", err.code || "", err);
        if (record) {
          // Kayıt oluştu ama dosya yüklenemedi: tekrar gönderilirse aynı başvuru iki kez kaydedilir.
          resetForm();
          showStep(0, { keepStatus: true });
          setStatus("Başvurunuz alındı ancak dosyalarınız yüklenemedi. Lütfen dosyalarınızı diyarbakirsinemaofisi@gmail.com adresine e-posta ile gönderin.", "error");
        } else if (err.code === "rate") {
          setStatus("Bu bağlantıdan son bir saatte çok sayıda başvuru gönderildi. Lütfen daha sonra tekrar deneyin.", "error");
        } else if (err.code === "turnstile") {
          setStatus("Robot kontrolü doğrulanamadı. Lütfen birkaç saniye bekleyip tekrar gönderin.", "error");
        } else {
          setStatus("Başvurunuz gönderilemedi. Lütfen bağlantınızı kontrol edip tekrar deneyin.", "error");
        }
      } finally {
        setBusy(false);
        turnstileSifirla();
      }
    });
    showStep(0, { scroll: false });
  }


  /* ---------- Footer yılı ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});

