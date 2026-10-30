/* ==========================================================
   Diyarbakır Sinema Ofisi — Casting başvurusu → PDF → e-posta
   Google Apps Script (script.google.com)

   Her 5 dakikada Airtable'daki yeni başvurulara bakar, her biri için
   yazdırılabilir bir PDF hazırlar ve ALICI adresine e-postayla gönderir.

   Kurulum: AIRTABLE_TOKEN'ı doldur → Kaydet → "kurulum" fonksiyonunu
   bir kez çalıştır ve izin ver. Deneme için "sonBasvuruyuTestEt".
   ========================================================== */

// Sadece "data.records:read" yetkili, yalnızca bu base'e erişen token.
// Bu kod sadece senin Google hesabında durur; siteye konmaz.
const AIRTABLE_TOKEN = "BURAYA_OKUMA_TOKENI"; // data.records:read, sadece bu base
const BASE_ID = "appRiiEi3HD8LYRAq";
const TABLE_ID = "tblwSjdTU1NeiaUca";
const ALICI = "diyarbakirsinemaofisi@gmail.com";
// Site önce yazılı bilgileri, birkaç saniye sonra fotoğrafı kaydeder;
// bu kadar dakika eski olmayan başvurular bir sonraki kontrole bırakılır.
const BEKLEME_DAKIKA = 3;
// Adaya "Başvurunuz alındı" e-postası gönderilsin mi? (Gmail günde 100 e-posta sınırı: başvuru başına 2 gider)
const ADAYA_ONAY = true;

// PDF'teki sıra ve kısa başlıklar: [PDF'te görünen ad, Airtable sütun adı]
const BOLUMLER = [
  ["1. Kimlik ve İletişim Bilgileri", [
    ["Ad soyad", "Adınız ve soyadınız"],
    ["Doğum tarihi", "Doğum tarihiniz"],
    ["18 yaşından küçük", "18 yaşından küçük müsünüz?"],
    ["Cinsiyet", "Cinsiyet"],
    ["İl", "Yaşadığınız il"],
    ["İlçe", "Yaşadığınız ilçe"],
    ["Telefon", "Telefon numaranız"],
    ["E-posta", "E-posta adresiniz"],
    ["Instagram", "Instagram profil bağlantınız (isteğe bağlı)"],
    ["Hakkında", "Hakkınızda (kendinizi üç cümle ile ifade ediniz.)"],
  ]],
  ["2. Başvuru Türü ve Fiziksel Bilgiler", [
    ["Değerlendirilmek istediği alanlar", "Hangi alanlarda değerlendirilmek istersiniz?"],
    ["Boy (cm)", "Boyunuz (cm)"],
    ["Kilo (kg)", "Kilonuz (kg)"],
    ["Göz rengi", "Göz renginiz"],
    ["Saç rengi", "Saç renginiz"],
    ["Kıyafet bedeni", "Kıyafet bedeniniz"],
    ["Ayakkabı numarası", "Ayakkabı numaranız"],
  ]],
  ["3. Deneyim, Diller ve Yetenekler", [
    ["Oyunculuk / figüranlık deneyimi", "Daha önce oyunculuk veya figüranlık yaptınız mı?"],
    ["Projeler ve roller", "Yer aldığınız projeler ve roller (varsa)"],
    ["Oyunculuk eğitimi", "Oyunculuk eğitimi aldınız mı?"],
    ["Eğitimler", "Oyunculuk eğitimleriniz (varsa)"],
    ["Diller", "Konuşabildiğiniz diller"],
    ["Özel beceriler", "Özel becerileriniz (varsa)"],
    ["Beceri detayları", "Özel becerilerinizle ilgili detaylar (isteğe bağlı)"],
  ]],
  ["4. Fotoğraf, Video ve Portföy", [
    ["Profesyonel çekim istiyor", "Profesyonel Çekim İstiyorum"],
    ["Yüz fotoğrafı", "Güncel yüz fotoğrafı"],
    ["Boy fotoğrafı", "Güncel boy fotoğrafı"],
    ["Tanıtım videosu", "Tanıtım videosu bağlantısı (Youtube , Drive veya Vimeo)"],
    ["Portföy / showreel", "Oyunculuk portföyü / showreel bağlantısı"],
  ]],
  ["5. Çekimlere Katılım", [
    ["Şehir dışı çekimler", "Şehir dışındaki çekimlere katılabilir misiniz?"],
    ["Kısa süreli çekimler", "Kısa süreli çekimlere katılabilir misiniz?"],
    ["Uzun süreli projeler", "Uzun süreli projelerde yer alabilir misiniz?"],
    ["Ajansa kayıtlı", "Bir oyunculuk veya casting ajansına kayıtlı mısınız?"],
    ["Ek notlar", "Başvurunuza eklemek istedikleriniz"],
  ]],
  ["6. Veli / Yasal Temsilci", [
    ["Başvuruyu yapan", "Başvuruyu yapan kişi"],
    ["Veli adı soyadı", "Veli / yasal temsilcinin adı soyadı"],
    ["Veli telefonu", "Veli / yasal temsilcinin telefon numarası"],
  ]],
  ["7. Onaylar", [
    ["Bilgilerin doğruluğu ve başvuru koşulları", "Bilgilerinizi doğru verdiğinizi ve başvuru koşullarını okuduğunuzu onaylıyor musunuz?"],
    ["Profilin yapım şirketleriyle paylaşılması", "Aday profilimin, hukuken gerekli olduğu durumlarda, ayrı açıklanacak şartlarla ilgili yapım şirketleriyle paylaşılmasına onay veriyorum."],
  ]],
];

const PORTRE = "Portre fotografınızı ekleyiniz.";
// 4. bölümde küçük resim olarak basılan fotoğraflar
const FOTOLAR = ["Güncel yüz fotoğrafı", "Güncel boy fotoğrafı"];
const LOGO = "data:image/jpeg;base64,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";


/* ---------- Kurulum ve zamanlayıcı ---------- */

// Bir kez çalıştır: bundan sonraki başvurular gönderilir, eskiler gönderilmez.
function kurulum() {
  PropertiesService.getScriptProperties().setProperty("SON_KAYIT", new Date().toISOString());
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("yeniBasvurulariGonder").timeBased().everyMinutes(5).create();
  Logger.log("Kurulum tamam: yeni başvurular her 5 dakikada " + ALICI + " adresine gönderilecek.");
}

function yeniBasvurulariGonder() {
  const kilit = LockService.getScriptLock();
  if (!kilit.tryLock(1000)) return; // önceki çalışma sürüyorsa bekleme
  try {
    const ayarlar = PropertiesService.getScriptProperties();
    const son = ayarlar.getProperty("SON_KAYIT") || new Date().toISOString();
    const sinir = Date.now() - BEKLEME_DAKIKA * 60 * 1000;
    // formül biraz geniş tutulur, kesin ayrım aşağıda createdTime ile yapılır
    const formul = `IS_AFTER(CREATED_TIME(), DATEADD(DATETIME_PARSE("${son}"), -1, 'minutes'))`;
    const yeniler = kayitlariGetir(formul)
      .filter((r) => r.createdTime > son && new Date(r.createdTime).getTime() <= sinir)
      .sort((a, b) => (a.createdTime < b.createdTime ? -1 : 1));

    // hata olursa SON_KAYIT ilerlemez; o başvuru bir sonraki kontrolde tekrar denenir
    yeniler.forEach((r) => {
      basvuruGonder(r);
      ayarlar.setProperty("SON_KAYIT", r.createdTime);
    });
  } finally {
    kilit.releaseLock();
  }
}

// Deneme: en son başvurunun PDF'ini hemen gönderir (tarih kaydını değiştirmez).
function sonBasvuruyuTestEt() {
  const hepsi = kayitlariGetir("");
  if (!hepsi.length) { Logger.log("Tabloda başvuru yok."); return; }
  const son = hepsi.sort((a, b) => (a.createdTime < b.createdTime ? 1 : -1))[0];
  basvuruGonder(son, false); // denemede adaya e-posta gitmez
  Logger.log("Gönderildi: " + (son.fields["Adınız ve soyadınız"] || son.id));
}


/* ---------- Airtable ---------- */

function kayitlariGetir(formul) {
  let kayitlar = [];
  let offset = "";
  do {
    const q = { pageSize: 100 };
    if (formul) q.filterByFormula = formul;
    if (offset) q.offset = offset;
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?` +
      Object.keys(q).map((k) => `${k}=${encodeURIComponent(q[k])}`).join("&");
    const res = UrlFetchApp.fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() !== 200) {
      throw new Error(`Airtable ${res.getResponseCode()}: ${res.getContentText()}`);
    }
    const veri = JSON.parse(res.getContentText());
    kayitlar = kayitlar.concat(veri.records);
    offset = veri.offset || "";
  } while (offset);
  return kayitlar;
}


/* ---------- PDF ve e-posta ---------- */

function basvuruGonder(kayit, adayaGonder = ADAYA_ONAY) {
  const f = kayit.fields;
  const ad = f["Adınız ve soyadınız"] || "İsimsiz başvuru";
  const zaman = new Date(kayit.createdTime);
  const tarih = Utilities.formatDate(zaman, "Europe/Istanbul", "dd.MM.yyyy HH:mm");
  const gun = Utilities.formatDate(zaman, "Europe/Istanbul", "yyyy-MM-dd");

  const fotolar = {};
  FOTOLAR.forEach((sutun) => {
    const veri = portreGetir(f[sutun]);
    if (veri) fotolar[sutun] = veri;
  });
  const html = pdfHtml(f, tarih, portreGetir(f[PORTRE]), fotolar);
  const pdf = Utilities.newBlob(html, MimeType.HTML, "basvuru.html")
    .getAs(MimeType.PDF)
    .setName(`Basvuru - ${ad} - ${gun}.pdf`);

  const ozet = [
    ["Telefon", f["Telefon numaranız"]],
    ["E-posta", f["E-posta adresiniz"]],
    ["İl / İlçe", [f["Yaşadığınız il"], f["Yaşadığınız ilçe"]].filter(Boolean).join(" / ")],
    ["Başvuru tarihi", tarih],
  ];
  GmailApp.sendEmail(
    ALICI,
    `Yeni Casting Başvurusu – ${ad}`,
    `${ad} adlı adaydan yeni başvuru. Başvuru formu ekteki PDF'tedir.\n\n` +
      ozet.map(([k, v]) => `${k}: ${v || "—"}`).join("\n"),
    {
      name: "DSO Casting Başvuruları",
      attachments: [pdf],
      htmlBody:
        `<p><strong>${esc(ad)}</strong> adlı adaydan yeni başvuru geldi. Yazdırılabilir başvuru formu ekteki PDF'tedir.</p>` +
        `<table cellpadding="4">${ozet.map(([k, v]) => `<tr><td style="color:#666">${k}</td><td>${esc(v || "—")}</td></tr>`).join("")}</table>`,
    }
  );

  if (adayaGonder) adayaOnayGonder(f["E-posta adresiniz"], ad);
}

// Adaya kısa onay; gönderilemezse ajansa giden e-postayı etkilemez
function adayaOnayGonder(eposta, ad) {
  if (!eposta || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta)) return;
  const metin = [
    `Merhaba ${ad},`,
    "Diyarbakır Sinema Ofisi Oyuncu & Cast Kayıt Formu'na yaptığınız başvuru alınmıştır. İlginiz için teşekkür ederiz.",
    "Uygun projelerde değerlendirme yapılması hâlinde sizinle iletişime geçilecektir. Başvurunuz herhangi bir rol veya iş garantisi oluşturmaz.",
    "Sorularınız için bu e-postayı yanıtlayabilirsiniz.",
    "Diyarbakır Sinema Ofisi",
  ];
  try {
    GmailApp.sendEmail(eposta, "Başvurunuz alındı – Diyarbakır Sinema Ofisi", metin.join("\n\n"), {
      name: "Diyarbakır Sinema Ofisi",
      replyTo: ALICI,
      htmlBody: metin.map((p, i) => (i === metin.length - 1 ? `<p><strong>${esc(p)}</strong></p>` : `<p>${esc(p)}</p>`)).join(""),
    });
  } catch (e) {
    Logger.log("Adaya onay e-postası gönderilemedi (" + eposta + "): " + e);
  }
}

// Airtable küçük önizlemeyi JPG/PNG verir (iPhone HEIC dahil); PDF hafif kalır
function portreGetir(ekler) {
  if (!ekler || !ekler.length) return "";
  const ek = ekler[0];
  const url = (ek.thumbnails && ek.thumbnails.large && ek.thumbnails.large.url) || ek.url;
  try {
    const blob = UrlFetchApp.fetch(url).getBlob();
    return `data:${blob.getContentType()};base64,${Utilities.base64Encode(blob.getBytes())}`;
  } catch (e) {
    Logger.log("Portre indirilemedi: " + e);
    return "";
  }
}


/* ---------- PDF sayfası (HTML) ---------- */

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function deger(v) {
  if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return "—";
  // ek dosyalar (fotoğraflar) dosya adıyla yazılır
  if (Array.isArray(v)) return esc(v.map((x) => (typeof x === "object" ? x.filename : x)).join(", "));
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v.split("-").reverse().join(".");
  return esc(v).replace(/\n/g, "<br>");
}

// CSS'in büyük harfi Türkçe "i"yi "I" yapar; başlıklar burada çevrilir
function buyukHarf(s) {
  return s.replace(/i/g, "İ").replace(/ı/g, "I").toUpperCase();
}

function pdfHtml(f, tarih, portre, fotolar = {}) {
  const satir = ([etiket, sutun]) => `<tr><td class="k">${etiket}</td><td>${deger(f[sutun])}</td></tr>`;
  // yüz ve boy fotoğrafı tek satırda yan yana; indirilemeyen fotoğrafın adı yazılır
  const fotoSatiri = () => {
    const parcalar = FOTOLAR
      .map((s) => (fotolar[s] ? `<img class="thumb" src="${fotolar[s]}" alt="">` : f[s] ? deger(f[s]) : ""))
      .filter(Boolean);
    return parcalar.length ? `<tr><td class="k">Yüz / boy fotoğrafı</td><td>${parcalar.join(" ")}</td></tr>` : "";
  };
  const tablo = (alanlar) => `<table class="f">${alanlar
    .map((a) => (FOTOLAR.includes(a[1]) ? (a[1] === FOTOLAR[0] ? fotoSatiri() : "") : satir(a)))
    .join("")}</table>`;
  const veliVar = ["Veli / yasal temsilcinin adı soyadı", "Veli / yasal temsilcinin telefon numarası"].some((s) => f[s]);
  const [kimlik, ...digerleri] = BOLUMLER;
  // 1. bölüm fotoğrafın yanında; ad zaten büyük başlıkta yazdığı için tabloda tekrarlanmaz
  const kunye = tablo(kimlik[1].filter(([, sutun]) => sutun !== "Adınız ve soyadınız"));
  const bolumler = digerleri
    .filter(([baslik]) => !baslik.startsWith("6.") || veliVar)
    .map(([baslik, alanlar]) => `<h2>${buyukHarf(baslik)}</h2>${tablo(alanlar)}`)
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 10mm 13mm 9mm; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #111; margin: 0; }
    table { border-collapse: collapse; }
    .head { width: 100%; border-bottom: 2.5pt solid #111; }
    .head td { vertical-align: bottom; padding-bottom: 6pt; }
    .head img { width: 44mm; }
    .title { text-align: right; }
    .title h1 { margin: 0; font-size: 14pt; letter-spacing: 1pt; }
    .title p { margin: 2pt 0 0; font-size: 8.5pt; color: #555; }
    .top { width: 100%; margin-top: 8pt; }
    .top > tbody > tr > td { vertical-align: top; }
    .name { margin: 0 0 4pt; font-size: 18pt; }
    .photo { width: 42mm; border: 0.75pt solid #888; }
    .thumb { height: 27mm; margin-right: 3mm; border: 0.75pt solid #888; }
    .nophoto { width: 42mm; height: 56mm; border: 0.75pt dashed #888; color: #888; font-size: 8.5pt; text-align: center; vertical-align: middle; }
    h2 { margin: 6pt 0 2pt; padding-bottom: 2pt; border-bottom: 1.5pt solid #111; font-size: 9.5pt; letter-spacing: .5pt; }
    table.f { width: 100%; }
    table.f td { padding: 1.6pt 4pt; border-bottom: 0.5pt solid #ccc; vertical-align: top; }
    td.k { width: 36%; color: #555; }
    .top table.f td.k { width: 30%; }
    .foot { margin-top: 7pt; font-size: 7.5pt; color: #777; text-align: center; }
  </style></head><body>
    <table class="head"><tr>
      <td><img src="${LOGO}" alt=""></td>
      <td class="title"><h1>CASTING BAŞVURU FORMU</h1><p>Başvuru tarihi: ${esc(tarih)}</p></td>
    </tr></table>
    <table class="top"><tr>
      <td style="padding-right:10pt">
        <h1 class="name">${deger(f["Adınız ve soyadınız"])}</h1>
        ${kunye}
      </td>
      <td style="width:44mm">${portre ? `<img class="photo" src="${portre}" alt="">` : `<table><tr><td class="nophoto">Portre fotoğrafı yok</td></tr></table>`}</td>
    </tr></table>
    ${bolumler}
    <p class="foot">Diyarbakır Sinema Ofisi · diyarbakirsinemaofisi@gmail.com · Bu belge başvuru formundan otomatik oluşturulmuştur.</p>
  </body></html>`;
}
