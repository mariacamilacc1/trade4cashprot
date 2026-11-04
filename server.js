// Trade4Cash · servidor pequeño (sin dependencias, Node 18+)
// - Sirve la página (carpeta public/)
// - POST /api/chat       → Zeta y la contraparte contestan con Gemini (la clave vive solo aquí)
// - POST /api/rate-check → valida en el servidor que una tasa esté dentro de ±15 % de la referencia
// - GET  /api/health     → estado
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const KEY = process.env.GEMINI_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const LIMIT = Number(process.env.RATE_LIMIT_PCT) || 15;
const PUBLIC = path.join(__dirname, "public");

// ---------- Referencias oficiales (TRM + divisas), en caché 15 min ----------
const TRM_URL = "https://www.datos.gov.co/resource/ceyp-9c7c.json?$select=valor,vigenciadesde&$order=vigenciadesde%20DESC&$limit=1";
const FX_URL = "https://open.er-api.com/v6/latest/USD";
const CODES = { "Dólar USA":"USD", "Euro":"EUR", "Libra Esterlina":"GBP", "Peso Mexicano":"MXN", "Dólar Canadiense":"CAD", "Real Brasileño":"BRL", "Yen Japonés":"JPY", "Franco Suizo":"CHF" };
let refCache = { at: 0, trm: 3985, fx: { USD:1 } };
async function getRefs(){
  if(Date.now() - refCache.at < 15 * 60000) return refCache;
  try{
    const t = await (await fetch(TRM_URL, { signal: AbortSignal.timeout(8000) })).json();
    const v = Number(t && t[0] && t[0].valor); if(v > 0) refCache.trm = v;
  }catch(e){}
  try{
    const f = await (await fetch(FX_URL, { signal: AbortSignal.timeout(8000) })).json();
    if(f && f.rates) refCache.fx = f.rates;
  }catch(e){}
  refCache.at = Date.now(); return refCache;
}
// Valores de respaldo (COP por unidad) por si las fuentes oficiales no responden
const FALLBACK = { EUR:4790, MXN:226, CAD:2965, BRL:752, GBP:5240, JPY:26.8, CHF:4620 };
async function refFor(currency){
  const r = await getRefs(), code = CODES[currency] || currency;
  if(code === "USD") return r.trm;
  const per = r.fx[code]; if(per > 0) return r.trm / per;
  return FALLBACK[code] || null;
}
function band(ref){ return { ref, lower: ref * (1 - LIMIT / 100), upper: ref * (1 + LIMIT / 100) }; }

// ---------- Límite de uso sencillo: 30 mensajes por minuto por IP ----------
const hits = new Map();
function limited(ip){
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  arr.push(now); hits.set(ip, arr);
  if(hits.size > 5000) hits.clear();
  return arr.length > 30;
}

// ---------- Prompts ----------
const ZETA = `Eres Zeta, el asistente de inteligencia artificial de Trade4Cash (Trade4Cash S.A.S., Bogotá D.C., Colombia). Eres amable, clara, pedagógica y cuidas la seguridad de las personas.
Puedes responder CUALQUIER pregunta (viajes, estudio, ahorro, cultura general, tecnología, etc.). Si la pregunta no es de Trade4Cash, respóndela con gusto y brevedad, y solo menciona Trade4Cash si de verdad ayuda.
No inventes datos: si no sabes algo o puede haber cambiado, dilo. En temas legales, tributarios o de inversión da información general y recuerda que no eres abogada ni asesora financiera. Nunca pidas ni aceptes claves, contraseñas, números de tarjeta ni documentos.

SOBRE TRADE4CASH (versión 5):
- Es un mercado digital entre personas (P2P) para cambiar divisas en Bogotá. Trade4Cash NO recibe, custodia ni transfiere dinero. Los pagos digitales de esta versión son simulados. Solo mayores de 18 años.
- Comprar: ofertas con filtros de divisa, zona y distancia; medios de pago y condición de los billetes (los billetes con sellos son normales y en muchos países se aceptan; conviene confirmarlo en el destino).
- Mis publicaciones: se publica divisa, cantidad, tasa en COP, punto público de encuentro y radio de visibilidad.
- REGLA DE TASA: toda oferta debe estar dentro de ±${LIMIT} % de la tasa oficial de referencia (la TRM para el dólar). Fuera de ese rango no se puede publicar, aceptar ni confirmar. No hay zona intermedia.
- Cantidad parcial: en el chat se puede acordar cambiar solo una parte de la oferta; vale solo si ambas personas confirman, y el resto sigue publicado.
- Reserva: al contactar una oferta queda reservada unos 15 minutos mientras se negocia.
- Índice de confianza: Nuevo, Confiable o Muy confiable, según verificación de identidad, intercambios confirmados, rapidez de respuesta y reportes. No depende del monto.
- Cada oferta muestra su diferencia frente a la referencia oficial.
- Encuentro presencial: código de encuentro verificado por ambas personas, revisión de billetes y confirmación; luego calificación de 1 a 5 estrellas y comprobante en PDF.
- Trade Points: pestaña que se desbloquea con el primer intercambio confirmado. Se ganan por confianza (verificación, intercambio presencial, calificar, módulos de la Academy, invitar amigos), 1 punto = $10 COP en beneficios, vencen al año. Se canjean por Premium, agencias aliadas (agencia de viaje, SIM, transferencias, hostales) y visibilidad. No se compran ni se transfieren.
- Academy: módulos interactivos y uno exclusivo según el uso principal que la persona elija (estudio, viaje, negocio, familia), enfocados en ahorro.
- Datos personales (Ley 1581 de 2012): responsable Trade4Cash S.A.S., trade4cash.atencioncliente@gmail.com, tel. 3184641985.
Responde siempre en español colombiano, claro y cercano, con formato sencillo (negritas y viñetas cortas cuando ayuden).`;

function counterpartPrompt(o, b){
  return `Eres ${o.name}, una persona real en Bogotá que ofrece cambiar ${o.amount} ${o.currency} a ${o.rate}, en ${o.place}. Condición de los billetes: ${o.condition || "sin sellos ni anotaciones"}. Hablas por el chat de Trade4Cash con alguien interesado.
Habla natural, corto (máximo 3 frases), amable, en español colombiano. Puedes responder cualquier cosa que te pregunten, como lo haría una persona.
REGLAS: ${b ? `La tasa de referencia oficial hoy es $${Math.round(b.ref)} y el rango permitido es entre $${Math.ceil(b.lower)} y $${Math.floor(b.upper)} (±${LIMIT} %). Nunca aceptes ni propongas una tasa fuera de ese rango; si te piden una fuera, explica amablemente el rango.` : `Toda tasa debe estar dentro de ±${LIMIT} % de la referencia oficial.`}
No pidas dinero por adelantado, no cambies el lugar a sitios no públicos, no pidas datos personales ni bancarios. Si hablan de cerrar, propón presencial en un punto público o pago digital. No digas que eres una IA salvo que te lo pregunten directamente.`;
}

async function gemini(system, history, message){
  if(!KEY) throw new Error("falta GEMINI_API_KEY");
  const contents = (Array.isArray(history) ? history : []).slice(-8)
    .filter(m => m && typeof m.text === "string")
    .map(m => ({ role: m.role === "model" || m.mine === false ? "model" : "user", parts: [{ text: String(m.text).slice(0, 2000) }] }));
  contents.push({ role: "user", parts: [{ text: message }] });
  const r = await fetch(`${process.env.GEMINI_BASE || "https://generativelanguage.googleapis.com"}/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
    method: "POST", signal: AbortSignal.timeout(25000),
    headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
    body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 900 } })
  });
  if(!r.ok) throw new Error("gemini " + r.status);
  const j = await r.json();
  const txt = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts.map(p => p.text || "").join("").trim();
  if(!txt) throw new Error("respuesta vacía");
  return txt;
}

// Revisa que la contraparte no haya mencionado una tasa fuera del rango
function ratesOk(text, b){
  if(!b) return true;
  const re = /(?:\$\s?(\d{1,3}(?:[.,]\d{3})+|\d{3,6})|(\d{1,3}(?:[.,]\d{3})+|\d{3,6})\s?COP)/gi; let m;
  while((m = re.exec(text))){
    const n = Number((m[1] || m[2]).replace(/[.,]/g, ""));
    if(n > b.ref * 0.4 && n < b.ref * 2.5 && (n < b.lower - 1 || n > b.upper + 1)) return false;
  }
  return true;
}

// ---------- HTTP ----------
const MIME = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".css":"text/css", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".ico":"image/x-icon", ".json":"application/json", ".txt":"text/plain; charset=utf-8" };
function send(res, code, obj){ res.writeHead(code, { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store" }); res.end(JSON.stringify(obj)); }
function body(req){
  return new Promise((ok, bad) => {
    let s = ""; req.on("data", c => { s += c; if(s.length > 40000){ bad(new Error("grande")); req.destroy(); } });
    req.on("end", () => { try{ ok(JSON.parse(s || "{}")); }catch(e){ bad(e); } });
  });
}

const server = http.createServer(async (req, res) => {
  try{
    const url = new URL(req.url, "http://x");
    if(req.method === "GET" && url.pathname === "/api/health") return send(res, 200, { ok:true, ai: Boolean(KEY), model: MODEL, limitPct: LIMIT });
    if(req.method === "POST" && url.pathname === "/api/chat"){
      const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
      if(limited(ip)) return send(res, 429, { error:"Demasiados mensajes. Espera un momento." });
      const b = await body(req), msg = String(b.message || "").trim().slice(0, 1500);
      if(!msg) return send(res, 400, { error:"Mensaje vacío" });
      if(b.role === "counterpart" && b.offer){
        const o = { name: String(b.offer.name || "Contraparte").slice(0, 60), currency: String(b.offer.currency || ""), amount: String(b.offer.amount || ""), rate: String(b.offer.rate || ""), place: String(b.offer.place || ""), condition: String(b.offer.condition || "") };
        const cur = o.currency === "Pesos Colombianos" ? String(b.offer.wantCur || "Dólar USA") : o.currency;
        const bd = await refFor(cur).then(r => r ? band(r) : null).catch(() => null);
        let reply = await gemini(counterpartPrompt(o, bd), b.history, msg);
        if(!ratesOk(reply, bd)) reply = `Esa tasa se sale del rango permitido (±${LIMIT} % de la referencia). Aquí solo se puede entre $${Math.ceil(bd.lower).toLocaleString("es-CO")} y $${Math.floor(bd.upper).toLocaleString("es-CO")}. ¿Te sirve algo dentro de ese rango?`;
        return send(res, 200, { reply });
      }
      return send(res, 200, { reply: await gemini(ZETA, b.history, msg) });
    }
    if(req.method === "POST" && url.pathname === "/api/rate-check"){
      const b = await body(req), cur = String(b.currency || ""), rate = Number(b.rate);
      const ref = await refFor(cur);
      if(!ref || !(rate > 0)) return send(res, 400, { error:"Divisa o tasa no válida" });
      const bd = band(ref), pct = (rate - ref) / ref * 100;
      return send(res, 200, { ok: rate >= bd.lower - 1e-9 && rate <= bd.upper + 1e-9, ref: Math.round(ref * 100) / 100, lower: Math.ceil(bd.lower), upper: Math.floor(bd.upper), pct: Math.round(pct * 10) / 10, limitPct: LIMIT });
    }
    if(req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error:"Método no permitido" });
    let p = decodeURIComponent(url.pathname); if(p.endsWith("/")) p += "index.html";
    const file = path.normalize(path.join(PUBLIC, p));
    if(!file.startsWith(PUBLIC)) return send(res, 403, { error:"No permitido" });
    fs.readFile(file, (e, data) => {
      if(e){ res.writeHead(404, { "Content-Type":"text/plain; charset=utf-8" }); return res.end("No encontrado"); }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": path.extname(file) === ".html" ? "no-cache" : "public, max-age=3600" });
      res.end(data);
    });
  }catch(e){
    console.error("error:", e.message);
    if(!res.headersSent) send(res, 502, { error:"No pude responder ahora. Intenta de nuevo." });
  }
});
server.listen(PORT, () => console.log(`Trade4Cash en el puerto ${PORT} · IA ${KEY ? "activa (" + MODEL + ")" : "SIN clave"}`));
