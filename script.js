/* ==========================================================
   Diyarbakır Sinema Ofisi
   Vanilla JS
   ========================================================== */

/* ---------- Airtable bağlantısı ---------- */
// Bilgiler config.js'ten gelir; o dosya git'e girmez (.gitignore).
// Örnek için config.example.js'e bakın.
const { AIRTABLE_API_KEY = "", AIRTABLE_BASE_ID = "", AIRTABLE_TABLE_NAME = "" } = window.DSO_CONFIG || {};

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
  // "Birincilik Ödülü", "Mansiyon Ödülü" vb.; festival adındaki "Ödülleri" sayılmaz
  const awardPattern = /Ödülü/;

  const renderList = (title, list) => {
    if (!list.length) return "";
    const items = list.map((text) => `<li>${text}</li>`).join("");
    return `<h4 class="film-modal__subtitle">${title}</h4><ul class="film-modal__list">${items}</ul>`;
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
        note: "Size ulaşabilmemiz için temel bilgileriniz.",
        fields: [
          { name: "Adınız ve soyadınız", type: "text", required: true, autocomplete: "name" },
          { name: "Doğum tarihiniz", type: "date", required: true },
          { name: "18 yaşından küçük müsünüz?", type: "radio", required: true, options: ["Evet", "Hayır"] },
          { name: "Cinsiyet", type: "radio", required: true, options: ["Kadın", "Erkek"] },
          { name: "Yaşadığınız il", type: "select", required: true, options: ILLER },
          { name: "Yaşadığınız ilçe", type: "text", required: true },
          { name: "Telefon numaranız", type: "tel", required: true, autocomplete: "tel", full: true, help: "Örnek: 0532 123 45 67", placeholder: "05XX XXX XX XX" },
          { name: "E-posta adresiniz", type: "email", required: true, full: true },
          { name: "Instagram profil bağlantınız (isteğe bağlı)", type: "text", placeholder: "instagram.com/kullaniciadi", full: true },
          { name: "Hakkınızda (kendinizi üç cümle ile ifade ediniz.)", type: "textarea", required: true, full: true },
          { name: "Portre fotografınızı ekleyiniz.", type: "file", required: true, accept: "image/*", hint: "JPG, PNG · büyük fotoğraflar otomatik küçültülür", full: true },
        ],
      },
      {
        title: "2. Başvuru Türü ve Fiziksel Bilgiler",
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
        title: "7. KVKK Bilgilendirmesi ve Başvuru Beyanı",
        note: "Kişisel verileriniz yalnızca casting değerlendirmesi amacıyla işlenir. Profilinizin yapım şirketleriyle paylaşılmasına izin vermemeniz başvurunuzu engellemez.",
        fields: [
          { name: "Bilgilerinizi doğru verdiğinizi ve başvuru koşullarını okuduğunuzu onaylıyor musunuz?", type: "radio", required: true, mustBe: "Evet, onaylıyorum",
            options: ["Evet, onaylıyorum", "Hayır"], full: true },
          { name: "Aday profilimin, hukuken gerekli olduğu durumlarda, ayrı açıklanacak şartlarla ilgili yapım şirketleriyle paylaşılmasına onay veriyorum.", type: "radio",
            options: ["Evet, izin veriyorum", "Hayır, izin vermiyorum"], full: true },
        ],
      },
      {
        title: "8. Özet ve Gönder",
        note: "Bilgilerinizi kontrol edin. Değiştirmek istediğiniz bölümde “Düzenle”ye basın.",
        summary: true,
        fields: [],
      },
    ];

    const form = document.getElementById("castingForm");
    const stepsEl = document.getElementById("castingSteps");
    const dotsEl = document.getElementById("castingDots");
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
        step.insertAdjacentHTML("beforeend", `<div class="summary" id="castingSummary"></div>`);
      } else {
        const grid = document.createElement("div");
        grid.className = "fields";
        section.fields.forEach((f) => {
          const id = `f${++uid}`;
          const group = f.type === "radio" || f.type === "check";
          const star = f.required ? ` <span class="req" aria-hidden="true">*</span>` : "";
          const wrap = document.createElement(group ? "fieldset" : "div");
          wrap.className = `field${f.full || group || f.type === "textarea" ? " field--full" : ""}`;
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
    });

    const steps = [...stepsEl.children];
    const dots = [...dotsEl.querySelectorAll(".dot")];
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
      dots.forEach((d, n) => {
        d.classList.toggle("is-current", n === i);
        d.classList.toggle("is-done", n < i || (n <= reached && n !== i));
        d.classList.toggle("is-skipped", isSkipped(n));
      });

      prevBtn.hidden = i === 0;
      nextBtn.hidden = i === LAST;
      submitBtn.hidden = i !== LAST;
      document.getElementById("castingStepNow").textContent = i + 1;
      document.getElementById("castingStepTotal").textContent = steps.length;
      document.getElementById("castingStepName").textContent = SECTIONS[i].title.replace(/^\d+\.\s*/, "");
      document.getElementById("castingProgress").style.width = `${((i + 1) / steps.length) * 100}%`;

      if (i === LAST) renderSummary();
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
    dots.forEach((d, n) => d.addEventListener("click", () => {
      if (n <= reached && !isSkipped(n) && n !== current) showStep(n);
    }));

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
      dots[MINOR_STEP].classList.toggle("is-skipped", isSkipped(MINOR_STEP));
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

    const airtableError = async (res, fallback) => {
      const data = await res.json().catch(() => ({}));
      return new Error(data.error?.message || data.error?.type || `${fallback} (${res.status})`);
    };

    const createRecord = async (data) => {
      const res = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
          // typecast: tarih ve seçenek alanlarını Airtable kendisi tanısın
          body: JSON.stringify({ records: [{ fields: data }], typecast: true }),
        }
      );
      if (!res.ok) throw await airtableError(res, "Kayıt oluşturulamadı");
      return (await res.json()).records[0].id;
    };

    const uploadFile = async (recordId, column, file) => {
      const res = await fetch(
        `https://content.airtable.com/v0/${AIRTABLE_BASE_ID}/${recordId}/${encodeURIComponent(column)}/uploadAttachment`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: file.type, file: await toBase64(file), filename: file.name }),
        }
      );
      if (!res.ok) throw await airtableError(res, "Dosya yüklenemedi");
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
      updateConditional();
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (current !== LAST) return;
      setStatus("");

      const invalid = fields.filter((f) => !isSkipped(f.step) && !isHidden(f) && !validate(f));
      if (invalid.length) {
        showStep(invalid[0].step, { scroll: false });
        invalid[0].el.scrollIntoView({ behavior: "smooth", block: "center" });
        setStatus("Lütfen işaretli alanları kontrol edin.", "error");
        return;
      }

      if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || AIRTABLE_API_KEY.startsWith("BURAYA")) {
        setStatus("Form şu an bakımda, lütfen daha sonra tekrar deneyin.", "error");
        console.warn("Airtable bilgileri girilmedi: AIRTABLE_API_KEY, AIRTABLE_BASE_ID ve AIRTABLE_TABLE_NAME doldurulmalı.");
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

      let recordId = null;
      setBusy(true);
      try {
        recordId = await createRecord(data);
        for (const [i, { column, file }] of files.entries()) {
          setBusy(true, `Dosyalar yükleniyor (${i + 1}/${files.length})...`);
          await uploadFile(recordId, column, file);
        }
        resetForm();
        showStep(0, { keepStatus: true });
        setStatus("Başvurunuz başarıyla alındı. İlginiz için teşekkür ederiz; uygun projelerde sizinle iletişime geçilecektir.", "success");
      } catch (err) {
        console.error("Airtable gönderim hatası:", err);
        if (recordId) {
          // Kayıt oluştu ama dosya yüklenemedi: tekrar gönderilirse aynı başvuru iki kez kaydedilir.
          resetForm();
          showStep(0, { keepStatus: true });
          setStatus("Başvurunuz alındı ancak dosyalarınız yüklenemedi. Lütfen dosyalarınızı diyarbakirsinemaofisi@gmail.com adresine e-posta ile gönderin.", "error");
        } else {
          setStatus("Başvurunuz gönderilemedi. Lütfen bağlantınızı kontrol edip tekrar deneyin.", "error");
        }
      } finally {
        setBusy(false);
      }
    });
    showStep(0, { scroll: false });
  }


  /* ---------- Footer yılı ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});

