/* ==========================================================
   Diyarbakır Sinema Ofisi — kayıt formu ara sunucusu (Cloudflare Worker)
   Form Airtable'a doğrudan değil buraya gönderir; token tarayıcıya hiç inmez.

   POST /basvuru  { fields, turnstile }                  → { id, ticket }
   POST /dosya    { id, ticket, field, contentType, filename, file }  → { ok }

   Gizli ayarlar (wrangler secret put): AIRTABLE_TOKEN, TURNSTILE_SECRET, TICKET_SECRET
   Ayarlar (wrangler.toml): AIRTABLE_BASE, AIRTABLE_TABLE, ALLOWED_ORIGINS
   KV: RATE (IP sınırı ve tek seferlik yükleme kayıtları)
   ========================================================== */

const SAATLIK_BASVURU = 10;          // aynı IP'den saatte en fazla; mobil operatörlerde IP paylaşıldığı için geniş
const DOSYA_SURESI_DK = 15;          // kayıttan sonra fotoğrafların yüklenebileceği süre
const MAX_BASE64 = 7_000_000;        // ≈ 5 MB dosya (Airtable sınırı)

// Fotoğraf sütunları: yalnızca bunlara, yalnızca /dosya üzerinden yüklenir
const FOTO_SUTUNLARI = [
  "Portre fotografınızı ekleyiniz.",
  "Güncel yüz fotoğrafı",
  "Güncel boy fotoğrafı",
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
    if (!allowed.includes(origin)) return new Response("Forbidden", { status: 403 });

    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method !== "POST") return json({ error: "method" }, 405);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid" }, 400);
    }

    const { pathname } = new URL(request.url);
    try {
      if (pathname === "/basvuru") return await basvuru(body, request, env, json);
      if (pathname === "/dosya") return await dosya(body, env, json);
      return json({ error: "not_found" }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: "server" }, 500);
    }
  },
};

/* ---------- Yeni başvuru ---------- */
async function basvuru(body, request, env, json) {
  const ip = request.headers.get("CF-Connecting-IP") || "";

  if (!(await turnstileGecerli(body.turnstile, ip, env))) return json({ error: "turnstile" }, 403);

  // IP sınırı: saat dolunca anahtar kendiliğinden silinir
  const key = `ip:${ip}`;
  const count = Number(await env.RATE.get(key)) || 0;
  if (count >= SAATLIK_BASVURU) return json({ error: "rate" }, 429);
  await env.RATE.put(key, String(count + 1), { expirationTtl: 3600 });

  const fields = temizle(body.fields);
  if (!fields) return json({ error: "invalid" }, 400);

  const res = await fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE}/${encodeURIComponent(env.AIRTABLE_TABLE)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
      // typecast: tarih ve seçenek alanlarını Airtable kendisi tanısın
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    }
  );
  if (!res.ok) {
    console.error("Airtable kayıt hatası", res.status, await res.text());
    return json({ error: "airtable" }, 502);
  }
  const id = (await res.json()).records[0].id;
  return json({ id, ticket: await biletUret(id, env) });
}

// Yalnızca metin ve metin listesi kabul edilir; fotoğraf sütunları ve nesneler (örn. ek URL'si) reddedilir
function temizle(fields) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return null;
  const entries = Object.entries(fields);
  if (!entries.length || entries.length > 80) return null;
  for (const [name, value] of entries) {
    if (name.length > 200 || FOTO_SUTUNLARI.includes(name)) return null;
    const ok =
      (typeof value === "string" && value.length <= 5000) ||
      (Array.isArray(value) && value.length <= 30 && value.every((v) => typeof v === "string" && v.length <= 300));
    if (!ok) return null;
  }
  return fields;
}

async function turnstileGecerli(token, ip, env) {
  if (typeof token !== "string" || !token) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  return data.success === true;
}

/* ---------- Fotoğraf yükleme ---------- */
async function dosya(body, env, json) {
  const { id, ticket, field, contentType, filename, file } = body;
  if (!(await biletGecerli(id, ticket, env))) return json({ error: "ticket" }, 403);
  if (!FOTO_SUTUNLARI.includes(field)) return json({ error: "invalid" }, 400);
  if (typeof contentType !== "string" || !contentType.startsWith("image/")) return json({ error: "invalid" }, 400);
  if (typeof file !== "string" || file.length > MAX_BASE64) return json({ error: "too_big" }, 413);

  // her fotoğraf sütununa kayıt başına bir kez
  const key = `up:${id}:${field}`;
  if (await env.RATE.get(key)) return json({ error: "duplicate" }, 409);
  await env.RATE.put(key, "1", { expirationTtl: DOSYA_SURESI_DK * 60 });

  const res = await fetch(
    `https://content.airtable.com/v0/${env.AIRTABLE_BASE}/${id}/${encodeURIComponent(field)}/uploadAttachment`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, file, filename: String(filename || "foto.jpg").slice(0, 120) }),
    }
  );
  if (!res.ok) {
    await env.RATE.delete(key); // tekrar denenebilsin
    console.error("Airtable dosya hatası", res.status, await res.text());
    return json({ error: "airtable" }, 502);
  }
  return json({ ok: true });
}

/* ---------- Bilet: "bu kaydı az önce Turnstile'dan geçen biri oluşturdu" kanıtı ---------- */
async function imza(text, env) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(env.TICKET_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function biletUret(id, env) {
  const exp = Date.now() + DOSYA_SURESI_DK * 60_000;
  return `${exp}.${await imza(`${id}.${exp}`, env)}`;
}

async function biletGecerli(id, ticket, env) {
  if (typeof id !== "string" || !/^rec[A-Za-z0-9]{14}$/.test(id) || typeof ticket !== "string") return false;
  const [exp, sig] = ticket.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return sig === (await imza(`${id}.${exp}`, env));
}
