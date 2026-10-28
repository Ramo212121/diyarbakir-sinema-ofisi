/* ==========================================================
   Film Diyarbakır — Sinema Ofisi
   Vanilla JS
   ========================================================== */

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
  const films = {
    gol: {
      meta: "2020 · Belgesel · 00:34:28",
      credit: "Yönetmen: Feyzi Baran, Kamil Kahraman",
      items: [
        "4. Bingöl Uluslararası Kısa Film Festivali, Kısa Film Yarışması, Üçüncülük Ödülü. 2022",
        "6. Türk Dünyası Belgesel Film Festivali, Öğrenci Belgesel Film Yarışması, Birincilik Ödülü. 2021",
        "71. Berlin Film Festivali, Avrupa Film Pazarı, Türkiye Kataloğu. 2021",
        "Avrupa Film Pazarı, 74. Cannes Film Festivali, Film Market, Türk Filmleri Kataloğu. 2021",
        "4. AFSAD Kısa Film Festivali, Belgesel Yarışması, Finalist. 2021",
        "9. Hak-İş Kısa Film Yarışması, Ulusal Kategori, Onunculuk Ödülü. 2020",
        "8. Antakya Altın Defne Film Festivali, Ulusal Belgesel Film Yarışması, Finalist. 2020",
        "2. Erzincan Uluslararası Kısa Film Festivali, Finalist. 2020",
        "8. Boğaziçi Film Festivali, Ulusal Kısa Belgesel Film Yarışması, Finalist. 2020",
        "10. Avrupa Birliği İnsan Hakları Kısa Film Yarışması, İnsan Hakları Dalı, Finalist. 2020",
        "11. TİHV İnsan Hakları Belgesel Film Günleri, Gösterim Seçkisi. 2020",
        "23. Randevu İstanbul Film Festivali, Geleceğin Sinemacılarından Kısalar Bölümü, Gösterim Seçkisi. 2020",
        "41. İFSAK Kısa Film ve Belgesel Yarışması, Belgesel Dalı, Finalist. 2021",
        "16. İşçi Filmleri Festivali, Gösterim Seçkisi. 2021",
        "1. Harput Kısa Film Festivali, Belgesel Film Yarışması, Finalist. 2021",
        "1. Kültür Sanat Belgeselleri Film Festivali, Belgesel Film Yarışması, Finalist. 2021",
        "32. Ankara Film Festivali, Ulusal Belgesel Film Yarışması, Finalist. 2021",
        "7. Contact Uluslararası Öğrenci Filmleri Festivali, Kısa Film Yarışması, Finalist. 2021",
        "9. Kayseri Film Festivali, Ulusal Belgesel Film Yarışması, Finalist. 2021",
        "22. İzmir Kısa Film Festivali, Panorama Bölümü, Gösterim Seçkisi. 2021",
        "1. İstanbul Nartugan Film Festivali, Finalist ve Gösterim Seçkisi. 2021",
        "12. Sinepark Kısa Film Festivali, Çarpışan Aramalar Dalı, Finalist. 2022",
        "13. TRT Belgesel Film Yarışması, Ulusal Öğrenci Belgesel Yarışması, Finalist. 2022",
        "22. Frankfurt Türk Film Festivali, Belgesel Film Yarışması, Finalist. 2022",
        "1. Ayancık Film Festivali, Belgesel Film Yarışması, Finalist. 2022",
        "13. Balkans Beyond Borders Kısa Film Festivali, Kısa Film Yarışması, Finalist. 2022",
        "Hacettepe Üniversitesi İletişim Fakültesi Belgesel Günleri, Gösterim Seçkisi. 2022",
        "4. Rotary 2420. Bölge Örsçelik Balkan Kısa Film Yarışması, Finalist. 2023",
        "Anahtar Film Günleri, Gösterim Seçkisi. 2023",
        "1. İstanbul Spor Film Festivali, Belgesel Film Dalı, Finalist. 2025",
        "7. Bingöl Uluslararası Kısa Film Festivali, Özel Gösterim Seçkisi. 2025",
      ],
    },
    baba: {
      meta: "2021 · Belgesel · 00:08:16",
      credit: "Yönetmen: Feyzi Baran",
      items: [
        "28. Adana Altın Koza Film Festivali, Ulusal Kısa Film Yarışması, Belgesel Dalı, Finalist. 2021",
        "32. Ankara Film Festivali, Ulusal Belgesel Film Yarışması, Finalist. 2021",
        "9. SETEM İpekyolu Film Ödülleri, Ulusal Belgesel Film Yarışması, Finalist. 2021",
        "1. Harput Kısa Film Festivali, Gösterim Seçkisi. 2021",
      ],
    },
    dilek: {
      meta: "2023 · Belgesel · 00:05:00",
      credit: "Yönetmen: Feyzi Baran, Büşra Baran",
      items: [
        "6. Bingöl Uluslararası Kısa Film Festivali, İkincilik Ödülü. 2024",
        "7. Siirt Kısa Film Festivali, Kısa Film Yarışması, İkincilik Ödülü. 2024",
        "2. Mardin Film Festivali, Kısa Film Yarışması, Birincilik Ödülü. 2024",
        "6. Esaretten Cesarete Kısa Film Yarışması, Belgesel Dalı, En İyi Film Ödülü. 2024",
        "2. Rotary Barış Filmleri Festivali, Öğrenci Belgesel Kategorisi, En İyi Film Ödülü. 2024",
        "19. Kar Film Festivali, Belgesel Dalı, Birincilik Ödülü. 2024",
        "10. EgeArt Sanat Günleri, Kısa Film Yarışması, Belgesel Dalı, İkincilik Ödülü. 2023",
        "1. Büyüt Hayallerini Kısa Film Yarışması, Birincilik Ödülü. 2023",
        "3. Yakın Doğu Üniversitesi Sinema Sempozyumu Kısa Film Yarışması, Belgesel Dalı, Jüri Özel Ödülü. 2023",
        "15. Rotary Kısa Film Festivali, Belgesel Dalı, Birincilik Ödülü. 2023",
        "3. Kültür Sanat Belgeselleri Film Festivali, Belgesel Film Yarışması, Özgün Yapım Tasarımı Ödülü. 2023",
        "4. Rotary 2420. Bölge Örsçelik Balkan Kısa Film Yarışması, Finalist. 2023",
        "13. Sinepark Kısa Film Festivali, Çarpışan Aramalar Dalı, Finalist. 2023",
        "4. Sinekültür Üniversitelerarası Kısa Film Yarışması, Belgesel Dalı, Finalist. 2023",
        "2. Gemlik Film Festivali, Kısa Film Yarışması, Finalist. 2023",
        "5. Directed By Women Turkey, Uluslararası Belgesel Film Yarışması, Finalist. 2023",
        "8. Filmamed Belgesel Film Festivali, Gösterim Seçkisi. 2023",
        "Anahtar Film Günleri, Gösterim Seçkisi. 2023",
        "30. Adana Altın Koza Film Festivali, Öğrenci Kısa Film Yarışması, Belgesel Dalı, Finalist. 2023",
        "5. Taste of Anatolia Films from Turkey, İngiltere, Gösterim Seçkisi. 2023",
        "6. Siirt Kısa Film Festivali, Kısa Film Yarışması, Finalist. 2023",
        "6. Esaretten Cesarete Kısa Film Yarışması, Yarışma Filmi. 2024",
        "12. Bursa Çocuk Hakları Film Festivali, Yetişkinler Gözünden Çocuk Hakları Bölümü, Gösterim Seçkisi. 2024",
        "3. Diyarbakır Kısa Film Festivali, Belgesel Dalı, Finalist. 2024",
        "6. Dostluk Kısa Film Festivali, Kırk Yıllık Hatır Gösterim Seçkisi. 2024",
        "Anahtar Film Günleri, Gösterim Seçkisi. 2024",
        "1. KASTOB Kısa Film Yarışması, Finalist. 2024",
        "5. Aizanoi Kısa Film Festivali, Kamera Eşitliğe Dönsün Yarışması, Finalist. 2025",
        "4. Büyük Taarruz Kısa Film Festivali, Kısa Film Yarışması, Finalist. 2025",
        "19. JCI İstanbul Crossroads Kısa Film Yarışması, Finalist. 2025",
        "Esaretten Cesarete Kısa Film Yarışması, Ödüllü Film Gösterim Seçkisi. 29 Mart 2026",
      ],
    },
    huzur: {
      meta: "2022 · Belgesel · 00:19:58",
      credit: "Yönetmen: Feyzi Baran",
      items: [
        "1. Dicle Belgesel ve Kısa Film Festivali, Dicle Üniversitesi Özel Ödülü. 2023",
        "2. İstanbul Nartugan Film Festivali, Ulusal Kısa Belgesel Film Yarışması, En İyi Film Ödülü. 2022",
        "18. Kar Film Festivali, Belgesel Film Yarışması, Üçüncülük Ödülü. 2022",
        "20. Kısa-ca Öğrenci Filmleri Festivali, Ulusal Belgesel Dalı, Kemal Öner Özel Ödülü. 2022",
        "2. Kültür Sanat Belgeselleri Film Festivali, Belgesel Film Yarışması, Finalist. 2022",
        "1. Luma Kısa Film Festivali, Kısa Film Yarışması, Finalist. 2022",
        "5. Siirt Kısa Film Festivali, Kısa Film Yarışması, Finalist. 2022",
        "23. İzmir Kısa Film Festivali, Panorama Bölümü, Gösterim Seçkisi. 2022",
        "12. Avrupa Birliği İnsan Hakları Kısa Film Yarışması, İklim Değişikliği Kategorisi, Finalist. 2022",
        "10. Kayseri Altın Çınar Film Festivali, Özel Gösterim Seçkisi. 2022",
        "13. TİHV İnsan Hakları Belgesel Film Günleri, Gösterim Seçkisi. 2022",
        "12. Hangi İnsan Hakları? Film Festivali, Ulusal Program, Gösterim Seçkisi. 2022",
        "15. Rotary Kısa Film Festivali, Belgesel Dalı, Finalist. 2023",
        "2. TAYF Uluslararası Kısa Film Festivali, Yarışma Dışı Gösterim Seçkisi. 2023",
        "13. Sinepark Kısa Film Festivali, Çarpışan Aramalar Dalı, Finalist. 2023",
        "18. İşçi Filmleri Festivali, Gösterim Seçkisi. 2023",
        "16. Documentarist İstanbul Belgesel Günleri, Başka Dünya Yok Bölümü, Gösterim Seçkisi. 2023",
        "16. Documentarist İstanbul Belgesel Günleri, Türkiye Panorama Bölümü, Gösterim Seçkisi. 2023",
        "Avrupa Film Pazarı, 72. Berlin Film Festivali, Film Market, Türk Sineması Kataloğu Seçkisi. 2023",
      ],
    },
    hatirla: {
      meta: "2023 · Kurmaca",
      credit: "Yönetmen: Cemre Tatar",
      items: [
        "1. Bursa Teknik Üniversitesi, Kısa Film Yarışması, Finalist. 2023",
        "7. Siirt Kısa Film Festivali, Kısa Film Yarışması, Finalist. 2024",
      ],
    },
    sabirsizlik: {
      meta: "2020 · Uzun Metraj Kurmaca · 01:30:00",
      credit: "Yönetmen: Aydın Orak · Feyzi Baran: Uygulayıcı ve Ortak Yapımcı",
      items: [],
    },
    maske: {
      meta: "2020 · Kurmaca · 00:04:00",
      credit: "Yönetmen: Feyzi Baran",
      items: [
        "1. Mutlu Kısa Film Günleri, Kısa Film Yarışması, Üçüncülük Ödülü. 2022",
        "1. İki Oda Bir Kısa - Evde Kısa Film Yarışması, 10. Film, Mansiyon Ödülü. 2020",
        "1. BEGEP Ulusal Kısa Film Yarışması, Yarışma Filmi. 2020",
      ],
    },
    iyigunler: {
      meta: "2025 · Belgesel · 00:36:00",
      credit: "Yönetmen: Feyzi Baran, Kamil Kahraman",
      items: [
        "1. Bütün Çocuklar Bizim Derneği, Belgesel Film Yarışması, Üçüncülük Ödülü. 2026",
        "9. Fethiye Belgesel Günleri, Gösterim Seçkisi. 2026",
        "33. Adana Altın Koza Film Festivali, Özel Gösterimler, Cüneyt Cebenoyan Kısa Film Yarışma Filmleri Bölümü, Gösterim Seçkisi. 2026",
        "1. Batman Film Festivali, Panorama Bölümü, Gösterim Seçkisi. 2026",
      ],
    },
    onlar: {
      meta: "2026 · Belgesel (Yapay Zeka) · 00:01:30",
      credit: "Yönetmen: Feyzi Baran",
      items: [
        "11. Türk Dünyası Belgesel Film Festivali, Yapay Zeka Belgesel Film Yarışması, Finalist. 2026",
        "1. Erenler Film Festivali, Kısa Film Yarışması, Finalist. 2026",
      ],
    },
    hayat: {
      meta: "Kısa Film",
      credit: "Yönetmen: Zeynel Hebun Güler",
      items: [],
    },
    dakika: {
      meta: "2026 · Belgesel",
      credit: "Yazan / Yöneten: Feyzi Baran",
      items: [
        "4. Mardin Film Festivali, Kısa Film Yarışması, Finalist. 2026",
      ],
    },
    solo: {
      meta: "2026 · Kurmaca",
      credit: "Yönetmen: Zeynel Hebun Güler",
      items: [
        "1. Parla Kısa Film Yarışması, İkincilik Ödülü. 2026",
      ],
    },
  };

  const modal = document.getElementById("filmModal");
  const modalBody = document.getElementById("filmModalBody");
  const awardPattern = /Ödül|Birincilik|İkincilik|Üçüncülük|Onunculuk|Mansiyon/;

  const renderList = (title, list) => {
    if (!list.length) return "";
    const items = list.map((text) => `<li>${text}</li>`).join("");
    return `<h4 class="film-modal__subtitle">${title} <span>${list.length}</span></h4><ul class="film-modal__list">${items}</ul>`;
  };

  const openFilm = (card) => {
    const film = films[card.dataset.film];
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


  /* ---------- Başvuru formu doğrulama ---------- */
  const form = document.getElementById("applyForm");
  const success = document.getElementById("formSuccess");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const messages = {
    name: "Lütfen adınızı ve soyadınızı yazın.",
    email: "Geçerli bir e-posta adresi girin.",
    type: "Lütfen bir yapım türü seçin.",
    message: "Lütfen projenizi kısaca anlatın (en az 20 karakter).",
  };

  const validateField = (input) => {
    const field = input.closest(".field");
    const errorEl = field.querySelector(".field__error");
    const value = input.value.trim();
    let valid = true;

    if (input.required && !value) valid = false;
    if (input.type === "email" && value && !emailPattern.test(value)) valid = false;
    if (input.name === "message" && value.length < 20) valid = false;

    field.classList.toggle("has-error", !valid);
    errorEl.textContent = valid ? "" : (messages[input.name] || "Bu alan zorunludur.");
    return valid;
  };

  const inputs = form.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    input.addEventListener("blur", () => { if (input.value) validateField(input); });
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("has-error")) validateField(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    success.textContent = "";

    let firstInvalid = null;
    inputs.forEach((input) => {
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Not: Burada gerçek bir sunucuya gönderim (fetch) yapılabilir.
    const data = Object.fromEntries(new FormData(form));
    console.log("Başvuru verisi:", data);

    success.textContent = `Teşekkürler ${data.name.split(" ")[0]}, başvurunuz alındı. En kısa sürede size döneceğiz.`;
    form.reset();
  });


  /* ---------- Footer yılı ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});
