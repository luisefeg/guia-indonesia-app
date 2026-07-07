import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Home, CalendarDays, Ticket, MapPin, MessagesSquare, Plane, Train, Ship, Bus, Landmark,
  Plus, Trash2, Check, Pencil, ChevronDown, RefreshCw, Users, Moon,
  Sunrise, ExternalLink, X, Paperclip, FileText, Image as ImageIcon, Loader2,
  Lightbulb, Send, Navigation, Mic, Square
} from "lucide-react";
import bg from "./assets/bg.jpg";
import { supabase } from "./supabase";

const PHOTO = bg;

/* ============================================================
   DATOS PRECARGADOS — Indonesia · 28 jul → 13 ago 2026 · 5 amigos
   ============================================================ */

const AUTHORS = [
  { name: "Luis", bg: "#FBF1C4", bd: "#E7D480", dot: "#E4C13A" },
  { name: "Paloma", bg: "#D3E3F6", bd: "#A5C3E9", dot: "#5B9BE0" },
  { name: "Maialen", bg: "#FBE0C6", bd: "#F0BC86", dot: "#EE9A4D" },
  { name: "Lorena", bg: "#F8D7E6", bd: "#EFACC8", dot: "#E77FB0" },
  { name: "Diego", bg: "#D7EBD3", bd: "#A6D19E", dot: "#5FB05A" },
];

const TICKETS_DEFAULT = [
  { id: "t1", mode: "plane", op: "Saudia", from: "Madrid (MAD)", to: "Jeddah (JED)", date: "28 jul", time: "16:40", note: "Aerolínea por confirmar", group: "todos", status: "confirmado", files: [] },
  { id: "t2", mode: "plane", op: "Saudia", from: "Jeddah (JED)", to: "Yakarta (CGK)", date: "29 jul", time: "01:55", note: "Escala", group: "todos", status: "confirmado", files: [] },
  { id: "t3", mode: "train", op: "Argo Dwipangga 16 · Ejecutiva", from: "Gambir (GMR)", to: "Yogyakarta (YK)", date: "30 jul", time: "08:50", code: "RTM9M7L", note: "", group: "todos", status: "confirmado", files: [] },
  { id: "t4", mode: "plane", op: "Vuelo interno", from: "Yogyakarta (YIA)", to: "Denpasar (DPS)", date: "1 ago", time: "", code: "", note: "Por reservar", group: "A", status: "pendiente", files: [] },
  { id: "t5", mode: "train", op: "Sancaka 86B · Ejecutiva", from: "Yogyakarta (YK)", to: "Surabaya Gubeng (SGU)", date: "1 ago", time: "17:00", code: "93X9OXR", note: "", group: "B", status: "confirmado", files: [] },
  { id: "t6", mode: "plane", op: "Citilink", from: "Surabaya (SUB)", to: "Denpasar (DPS)", date: "2 ago", time: "16:45", code: "", note: "151 € · 3 pax · directo", group: "B", status: "confirmado", files: [] },
  { id: "t7", mode: "ferry", op: "Ferry rápido", from: "Sanur (Bali)", to: "Nusa Penida", date: "6 ago", time: "", code: "", note: "Por reservar", group: "todos", status: "pendiente", files: [] },
  { id: "t8", mode: "ferry", op: "Ferry rápido", from: "Nusa Penida", to: "Gili Air", date: "8 ago", time: "", code: "", note: "Por reservar", group: "todos", status: "pendiente", files: [] },
  { id: "t9", mode: "ferry", op: "Ferry rápido", from: "Gili Air", to: "Bali (Uluwatu)", date: "10 ago", time: "", code: "", note: "Por reservar", group: "todos", status: "pendiente", files: [] },
  { id: "t10", mode: "plane", op: "AirAsia QZ-801", from: "Denpasar (DPS)", to: "Yakarta (CGK)", date: "11 ago", time: "20:00", code: "D8FJ7F", note: "Traveloka 1349741448 · reembolsable", group: "todos", status: "confirmado", files: [] },
  { id: "t11", mode: "plane", op: "Saudia", from: "Yakarta (CGK)", to: "Madinah (MED)", date: "12 ago", time: "12:00", code: "", note: "Escala", group: "todos", status: "confirmado", files: [] },
  { id: "t12", mode: "plane", op: "Saudia", from: "Madinah (MED)", to: "Jeddah (JED)", date: "12 ago", time: "22:20", code: "", note: "Escala", group: "todos", status: "confirmado", files: [] },
  { id: "t13", mode: "plane", op: "Saudia", from: "Jeddah (JED)", to: "Madrid (MAD)", date: "13 ago", time: "08:10", code: "", note: "Llegada", group: "todos", status: "confirmado", files: [] },
];

const STOPS_DEFAULT = [
  { id: "jkt1", name: "Yakarta", region: "Java", nights: "1 noche", dates: "29 jul", pois: [] },
  { id: "ygy", name: "Yogyakarta", region: "Java", nights: "2 noches", dates: "30–31 jul", pois: [] },
  { id: "bromo", name: "Monte Bromo", region: "Java · solo Grupo B", nights: "sin hotel (madrugada 1→2)", dates: "1–2 ago", pois: [] },
  { id: "ubud", name: "Ubud", region: "Bali", nights: "Grupo A: 1–3 · Grupo B: 2–3", dates: "2–3 ago", pois: [] },
  { id: "sidemen", name: "Sidemen", region: "Bali", nights: "2 noches", dates: "4–5 ago", pois: [] },
  { id: "penida", name: "Nusa Penida", region: "Islas", nights: "2 noches", dates: "6–7 ago", pois: [] },
  { id: "gili", name: "Gili Air", region: "Islas", nights: "2 noches", dates: "8–9 ago", pois: [] },
  { id: "uluwatu", name: "Uluwatu", region: "Bali", nights: "1 noche", dates: "10 ago", pois: [] },
  { id: "jkt2", name: "Yakarta", region: "Java", nights: "1 noche", dates: "11 ago", pois: [] },
];

const DAYS_DEFAULT = [
  { id: "d1", date: "mar 28 jul", title: "Salida desde Madrid", icon: "plane", items: ["Vuelo MAD → Jeddah · 16:40–23:40"], sleep: "En ruta", region: "Madrid" },
  { id: "d2", date: "mié 29 jul", title: "Llegada a Yakarta", icon: "plane", items: ["Jeddah → Yakarta · 01:55–16:00"], sleep: "Yakarta", region: "Yakarta" },
  { id: "d3", date: "jue 30 jul", title: "Tren a Yogyakarta", icon: "train", items: ["Argo Dwipangga 16 · Gambir → Yogyakarta · 08:50–14:51 (RTM9M7L)"], sleep: "Yogyakarta", region: "Yogyakarta" },
  { id: "d4", date: "vie 31 jul", title: "Templos de Java", icon: "landmark", items: ["Borobudur y/o Prambanan", "Centro: Kraton, Malioboro"], sleep: "Yogyakarta", region: "Yogyakarta" },
  { id: "d5", date: "sáb 1 ago", title: "El grupo se divide", icon: "split", split: { A: ["Vuelo directo Yogyakarta → Denpasar (por reservar)", "Traslado a Ubud"], B: ["Tren Sancaka 86B · Yogyakarta → Surabaya · 17:00–21:02 (93X9OXR)", "Subida nocturna al Bromo"] }, sleep: "A: Ubud · B: Bromo", region: "Yogyakarta" },
  { id: "d6", date: "dom 2 ago", title: "Amanecer en el Bromo y reencuentro", icon: "sunrise", split: { A: ["Día libre en Ubud"], B: ["Amanecer en el Bromo", "Vuelo Surabaya → Denpasar · Citilink · 16:45–18:50"] }, items: ["Por la noche, todos juntos en Ubud"], sleep: "Ubud (todos)", region: "Ubud" },
  { id: "d7", date: "lun 3 ago", title: "Ubud", icon: "landmark", items: ["Tegalalang", "Campuhan Ridge Walk", "Mercado y templos"], sleep: "Ubud", region: "Ubud" },
  { id: "d8", date: "mar 4 ago", title: "Traslado a Sidemen", icon: "bus", items: ["Salida hacia Sidemen", "Valle de arrozales"], sleep: "Sidemen", region: "Sidemen" },
  { id: "d9", date: "mié 5 ago", title: "Sidemen", icon: "landmark", items: ["Lahangan Sweet", "Ruta en moto por el valle"], sleep: "Sidemen", region: "Sidemen" },
  { id: "d10", date: "jue 6 ago", title: "Ferry a Nusa Penida", icon: "ferry", items: ["Ferry Sanur → Nusa Penida (por reservar)"], sleep: "Nusa Penida", region: "Nusa Penida" },
  { id: "d11", date: "vie 7 ago", title: "Nusa Penida", icon: "landmark", items: ["Kelingking Beach", "Angel's Billabong y Broken Beach", "Snorkel en Crystal Bay"], sleep: "Nusa Penida", region: "Nusa Penida" },
  { id: "d12", date: "sáb 8 ago", title: "Ferry a Gili Air", icon: "ferry", items: ["Ferry Nusa Penida → Gili Air (por reservar)"], sleep: "Gili Air", region: "Gili Air" },
  { id: "d13", date: "dom 9 ago", title: "Gili Air", icon: "landmark", items: ["Snorkel con tortugas", "Bici por la isla", "Atardecer"], sleep: "Gili Air", region: "Gili Air" },
  { id: "d14", date: "lun 10 ago", title: "Ferry a Uluwatu", icon: "ferry", items: ["Ferry Gili Air → Bali (por reservar)", "Templo de Uluwatu y danza Kecak"], sleep: "Uluwatu", region: "Uluwatu" },
  { id: "d15", date: "mar 11 ago", title: "Vuelta a Yakarta", icon: "plane", items: ["Vuelo AirAsia QZ-801 · Denpasar → Yakarta · 20:00–20:50 (D8FJ7F)"], sleep: "Yakarta", region: "Yakarta" },
  { id: "d16", date: "mié 12 ago", title: "Inicio del regreso", icon: "plane", items: ["Yakarta → Madinah · 12:00–17:50", "Madinah → Jeddah · 22:20–23:30"], sleep: "En ruta", region: "Yakarta" },
  { id: "d17", date: "jue 13 ago", title: "Llegada a Madrid", icon: "plane", items: ["Jeddah → Madrid · 08:10–13:45", "Fin del viaje"], sleep: "Casa", region: "Madrid" },
];

const MAP_STOPS = [
  { n: 1, name: "Yakarta", lat: -6.2088, lng: 106.8456, z: 11 },
  { n: 2, name: "Yogyakarta", lat: -7.7956, lng: 110.3695, z: 12 },
  { n: "B", name: "Bromo", lat: -7.9425, lng: 112.9530, z: 12 },
  { n: 3, name: "Ubud", lat: -8.5069, lng: 115.2625, z: 13 },
  { n: 4, name: "Sidemen", lat: -8.4503, lng: 115.4447, z: 13 },
  { n: 5, name: "N. Penida", lat: -8.7275, lng: 115.5444, z: 12 },
  { n: 6, name: "Gili Air", lat: -8.3575, lng: 116.0830, z: 14 },
  { n: 7, name: "Uluwatu", lat: -8.8290, lng: 115.0850, z: 13 },
];

const TRIP_START = new Date(2026, 6, 28);
function tripDate(i) { const d = new Date(2026, 6, 28); d.setDate(d.getDate() + i); return d; }
function todayIndex() { const t = new Date(); const today = new Date(t.getFullYear(), t.getMonth(), t.getDate()); return Math.round((today - TRIP_START) / 86400000); }

const MONTHS = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
function parseDMY(s) { const m = (s || "").toLowerCase().match(/(\d{1,2})\s*([a-z]{3})/); return m ? { d: +m[1], mo: (MONTHS[m[2]] ?? 99) } : null; }
function parseMin(s) { const m = (s || "").match(/(\d{1,2}):(\d{2})/); return m ? (+m[1]) * 60 + (+m[2]) : 9999; }
function ticketSortKey(t) { const p = parseDMY(t.date) || { mo: 99, d: 99 }; return p.mo * 1e5 + p.d * 1e3 + parseMin(t.time); }
function sameDay(a, b) { const x = parseDMY(a), y = parseDMY(b); return x && y && x.d === y.d && x.mo === y.mo; }

/* ============================================================
   ALMACENAMIENTO COMPARTIDO (Supabase)
   datos → tabla "guia_kv" (una fila por sección, en jsonb)
   archivos (fotos/audios/pdfs) → Storage bucket "guia-files"
   Todos los amigos que abren el enlace leen y escriben el mismo sitio.
   ============================================================ */

async function kvGet(key, fallback) {
  try {
    const { data, error } = await supabase.from("guia_kv").select("value").eq("key", key).maybeSingle();
    if (error || !data) return fallback;
    return data.value ?? fallback;
  } catch { return fallback; }
}
async function kvSet(key, value) {
  try {
    const { error } = await supabase.from("guia_kv").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) console.error("Error guardando " + key, error);
  } catch (e) { console.error("Error guardando " + key, e); }
}

const uid = () => Math.random().toString(36).slice(2, 9);
const fileToDataUrl = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

// Comprime imágenes en el propio móvil antes de subirlas (menos datos, menos espera).
async function compressImageToFile(file, max = 1000, q = 0.6) {
  try {
    if (!file.type.startsWith("image")) return file;
    const dataUrl = await fileToDataUrl(file);
    const img = await loadImg(dataUrl);
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((res) => c.toBlob((b) => res(b || file), "image/jpeg", q));
    return new File([blob], file.name || "foto.jpg", { type: "image/jpeg" });
  } catch { return file; }
}

// Sube un archivo al bucket compartido y devuelve su URL pública + ruta (para poder borrarlo luego).
async function uploadFile(file, folder = "notas") {
  try {
    const safeName = (file.name || "archivo").replace(/[^a-zA-Z0-9_.-]/g, "_");
    const path = `${folder}/${uid()}-${safeName}`;
    const { error } = await supabase.storage.from("guia-files").upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) { console.error("Error subiendo archivo", error); return null; }
    const { data } = supabase.storage.from("guia-files").getPublicUrl(path);
    return { url: data.publicUrl, path, name: file.name || safeName, type: file.type || "" };
  } catch (e) { console.error("Error subiendo archivo", e); return null; }
}
async function deleteFileByPath(path) {
  if (!path) return;
  try { await supabase.storage.from("guia-files").remove([path]); } catch (e) {}
}

const MODE_ICON = { plane: Plane, train: Train, ferry: Ship, bus: Bus, entrada: Landmark };
const DAY_ICON = { plane: Plane, train: Train, ferry: Ship, bus: Bus, landmark: Landmark, sunrise: Sunrise, split: Users };
const mapsUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const dirUrl = (a, b) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(a)}&destination=${encodeURIComponent(b)}`;

const WHO = { todos: { label: "Todos" }, A: { label: "Grupo A" }, B: { label: "Grupo B" } };
const STATUS = { idea: { label: "Idea", icon: Lightbulb, c: "#8A7A4A", bg: "#F3ECD7" }, confirmado: { label: "Confirmado", icon: Check, c: "var(--seaDeep)", bg: "var(--seaSoft)" }, reservado: { label: "Reservado", icon: Ticket, c: "#2E6B3E", bg: "#D8EBD9" } };

function GroupTag({ g }) {
  if (!g || g === "todos") return null;
  const sea = g === "A";
  return <span className="gi-grouptag" style={{ background: sea ? "var(--seaSoft)" : "var(--amberSoft)", color: sea ? "var(--seaDeep)" : "var(--amberDeep)" }}>Grupo {g}</span>;
}

/* ============================================================
   ROOT
   ============================================================ */

export default function GuiaIndonesia() {
  const [tab, setTab] = useState("viaje");
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(TICKETS_DEFAULT);
  const [stops, setStops] = useState(STOPS_DEFAULT);
  const [agenda, setAgenda] = useState({});
  const [notas, setNotas] = useState([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [t, s, a, n] = await Promise.all([
      kvGet("tickets", TICKETS_DEFAULT),
      kvGet("stops", STOPS_DEFAULT),
      kvGet("agenda", {}),
      kvGet("notas", []),
    ]);
    setTickets(t); setStops(s); setAgenda(a); setNotas(n);
    setLoading(false);
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  // Cuando otro amigo cambia algo desde su móvil, esta suscripción lo trae solo,
  // sin necesidad de tocar "Actualizar".
  useEffect(() => {
    const channel = supabase
      .channel("guia_kv_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "guia_kv" }, (payload) => {
        const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
        if (!row) return;
        if (row.key === "tickets") setTickets(payload.new ? payload.new.value : TICKETS_DEFAULT);
        if (row.key === "stops") setStops(payload.new ? payload.new.value : STOPS_DEFAULT);
        if (row.key === "agenda") setAgenda(payload.new ? payload.new.value : {});
        if (row.key === "notas") setNotas(payload.new ? payload.new.value : []);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const persist = {
    tickets: (v) => { setTickets(v); kvSet("tickets", v); },
    stops: (v) => { setStops(v); kvSet("stops", v); },
    agenda: (v) => { setAgenda(v); kvSet("agenda", v); },
    notas: (v) => { setNotas(v); kvSet("notas", v); },
  };

  const TABS = [
    { id: "viaje", label: "Inicio", icon: Home },
    { id: "agenda", label: "Agenda", icon: CalendarDays },
    { id: "billetes", label: "Tickets", icon: Ticket },
    { id: "sitios", label: "Sitios", icon: MapPin },
    { id: "notas", label: "Notas", icon: MessagesSquare },
  ];

  return (
    <div className="gi-root">
      <style>{CSS}</style>
      <div className="gi-bg" style={{ backgroundImage: `url(${PHOTO})` }} />
      <div className="gi-bg-veil" />

      <main className="gi-main">
        {loading ? (
          <div className="gi-loading"><Loader2 className="gi-spin" size={22} /> Cargando la guía…</div>
        ) : (
          <div key={tab} className="gi-fade">
            {tab === "viaje" && <TabInicio agenda={agenda} tickets={tickets} onSync={loadAll} goAgenda={() => setTab("agenda")} />}
            {tab === "agenda" && <TabAgenda agenda={agenda} setAgenda={persist.agenda} />}
            {tab === "billetes" && <TabTickets tickets={tickets} setTickets={persist.tickets} />}
            {tab === "sitios" && <TabSitios stops={stops} setStops={persist.stops} />}
            {tab === "notas" && <TabNotas notas={notas} setNotas={persist.notas} onSync={loadAll} />}
          </div>
        )}
      </main>

      <nav className="gi-tabbar">
        {TABS.map((t) => {
          const Icon = t.icon; const active = tab === t.id;
          return (
            <button key={t.id} className={"gi-tab" + (active ? " gi-tab-active" : "")} onClick={() => setTab(t.id)}>
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} /><span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ============================================================
   INICIO
   ============================================================ */

function TabInicio({ agenda, tickets, onSync, goAgenda }) {
  return (
    <div>
      <Hero onSync={onSync} />
      <TodayCard agenda={agenda} tickets={tickets} goAgenda={goAgenda} />
      <StopMap />
    </div>
  );
}

function Hero({ onSync }) {
  return (
    <div className="gi-hero" style={{ backgroundImage: `url(${PHOTO})` }}>
      <div className="gi-hero-scrim" />
      <button className="gi-sync" onClick={onSync} title="Actualizar"><RefreshCw size={15} /></button>
      <div className="gi-hero-content">
        <h1 className="gi-hero-title">Indonesia</h1>
        <div className="gi-hero-sub">Java · Bali · Islas · 17 días</div>
        <span className="gi-hero-chip">28 jul — 13 ago 2026</span>
      </div>
    </div>
  );
}

function sortActs(acts) {
  return [...(acts || [])].sort((a, b) => { if (!a.time && !b.time) return 0; if (!a.time) return 1; if (!b.time) return -1; return a.time.localeCompare(b.time); });
}

function TodayCard({ agenda, tickets, goAgenda }) {
  const idx = todayIndex();
  const inTrip = idx >= 0 && idx < DAYS_DEFAULT.length;
  const previewIdx = idx < 0 ? 0 : (inTrip ? idx : DAYS_DEFAULT.length - 1);
  const d = DAYS_DEFAULT[previewIdx];
  const acts = sortActs(agenda[d.id]);
  const dayTickets = (tickets || []).filter((t) => sameDay(t.date, d.date)).sort((a, b) => parseMin(a.time) - parseMin(b.time));
  const daysTo = -idx;

  return (
    <div className="gi-today">
      <div className="gi-today-head">
        <span className="gi-today-eyebrow">{inTrip ? "Hoy" : idx < 0 ? "Próximamente" : "Viaje terminado"}</span>
        {idx < 0 && <span className="gi-today-count">faltan {daysTo} días</span>}
      </div>

      {idx > DAYS_DEFAULT.length - 1 ? (
        <div className="gi-today-done">El viaje ha terminado. ¡A por el siguiente! 🌴</div>
      ) : (
        <>
          <div className="gi-today-title">{d.title}</div>
          <div className="gi-today-date">{d.date}</div>

          {d.split && (
            <div className="gi-today-split">
              <span><b style={{ color: "var(--seaDeep)" }}>A:</b> {d.split.A[0]}</span>
              <span><b style={{ color: "var(--amberDeep)" }}>B:</b> {d.split.B[0]}</span>
            </div>
          )}
          {d.items && <div className="gi-today-line">{d.items[0]}</div>}

          {dayTickets.length > 0 && (
            <div className="gi-today-tickets">
              {dayTickets.map((t) => {
                const Icon = MODE_ICON[t.mode] || Plane;
                return (
                  <div key={t.id} className="gi-today-ticket">
                    <Icon size={13} />
                    <span className="gi-today-ticket-t">{t.time ? t.time + " · " : ""}{t.from}{t.to ? " → " + t.to : ""}</span>
                    {t.files && t.files.length > 0 && (
                      <button
                        type="button"
                        className="gi-today-ticket-file"
                        title={t.files[0].name}
                        onClick={() => window.open(t.files[0].url, "_blank", "noopener,noreferrer")}
                      >
                        <Paperclip size={11} />{t.files.length > 1 ? t.files.length : ""}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {acts.length > 0 && (
            <div className="gi-today-acts">
              {acts.slice(0, 4).map((a) => (
                <div key={a.id} className="gi-today-act"><span className="gi-today-time">{a.time || "—"}</span><span className="gi-today-act-t">{a.title}</span></div>
              ))}
            </div>
          )}

          <div className="gi-today-foot">
            <span className="gi-today-sleep"><Moon size={13} /> {d.sleep}</span>
            <button className="gi-today-btn" onClick={goAgenda}>{idx < 0 ? "Agenda del día 1" : "Abrir agenda"} →</button>
          </div>
        </>
      )}
    </div>
  );
}

function StopMap() {
  const [sel, setSel] = useState(3);
  const s = MAP_STOPS[sel];
  const src = `https://maps.google.com/maps?q=${s.lat},${s.lng}&z=${s.z}&hl=es&output=embed`;
  return (
    <div className="gi-mapcard">
      <div className="gi-map-head">
        <span className="gi-map-title">La ruta en el mapa</span>
        <a className="gi-map-open" href={mapsUrl(s.name + " Indonesia")} target="_blank" rel="noreferrer">Abrir <ExternalLink size={12} /></a>
      </div>
      <div className="gi-map-chips">
        {MAP_STOPS.map((m, i) => (
          <button key={i} className={"gi-mapchip" + (i === sel ? " gi-mapchip-on" : "")} onClick={() => setSel(i)}>
            <span className="gi-mapchip-n">{m.n}</span>{m.name}
          </button>
        ))}
      </div>
      <div className="gi-map-frame-wrap">
        <div className="gi-map-fallback">
          <MapPin size={20} />
          <span>Si no carga, ábrelo en Google Maps.</span>
          <a href={mapsUrl(s.name + " Indonesia")} target="_blank" rel="noreferrer">Abrir en Google Maps</a>
        </div>
        <iframe title="Mapa de la ruta" src={src} className="gi-map-frame" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <div className="gi-map-foot">El 1 de agosto el grupo se separa una noche: A vuela directo a Ubud · B sube al Bromo (★).</div>
    </div>
  );
}

/* ============================================================
   AGENDA
   ============================================================ */

function TabAgenda({ agenda, setAgenda }) {
  const start = Math.min(Math.max(todayIndex(), 0), DAYS_DEFAULT.length - 1);
  const [sel, setSel] = useState(start);
  const d = DAYS_DEFAULT[sel];
  const acts = sortActs(agenda[d.id]);
  const setDayActs = (next) => setAgenda({ ...agenda, [d.id]: next });
  const addAct = (a) => setDayActs([...(agenda[d.id] || []), a]);
  const updAct = (id, patch) => setDayActs((agenda[d.id] || []).map((x) => x.id === id ? { ...x, ...patch } : x));
  const delAct = (id) => setDayActs((agenda[d.id] || []).filter((x) => x.id !== id));
  const dayCost = acts.reduce((s, a) => s + (Number(a.cost) || 0), 0);

  return (
    <div>
      <div className="gi-pagehd"><h2 className="gi-pagehd-title">Agenda</h2><p className="gi-pagehd-sub">El plan de cada día. Se ordena solo por hora.</p></div>
      <div className="gi-datestrip">
        {DAYS_DEFAULT.map((dd, i) => {
          const dt = tripDate(i);
          const wd = dt.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
          const has = (agenda[dd.id] || []).length;
          return (
            <button key={dd.id} className={"gi-datechip" + (i === sel ? " gi-datechip-on" : "")} onClick={() => setSel(i)}>
              <span className="gi-datechip-wd">{wd}</span><span className="gi-datechip-d">{dt.getDate()}</span><span className="gi-datechip-m">{dt.toLocaleDateString("es-ES", { month: "short" }).replace(".", "")}</span>
              {has > 0 && <span className="gi-datechip-dot" />}
            </button>
          );
        })}
      </div>

      <div className="gi-agday">
        <div className="gi-agday-hd">
          <div><div className="gi-agday-title">{d.title}</div><div className="gi-agday-sub"><Moon size={12} /> {d.sleep}</div></div>
          {dayCost > 0 && <div className="gi-agday-cost">~{dayCost} €</div>}
        </div>

        {(d.items || d.split) && (
          <div className="gi-agday-fixed">
            {d.split ? (
              <>
                <div className="gi-fixedline"><GroupTag g="A" /> {d.split.A.join(" · ")}</div>
                <div className="gi-fixedline"><GroupTag g="B" /> {d.split.B.join(" · ")}</div>
                {d.items && d.items.map((it, i) => <div key={i} className="gi-fixedline gi-fixedline-muted">{it}</div>)}
              </>
            ) : d.items.map((it, i) => <div key={i} className="gi-fixedline gi-fixedline-muted">{it}</div>)}
          </div>
        )}

        <div className="gi-acts">
          {acts.length === 0 && <div className="gi-acts-empty">Sin actividades aún. Añade la primera abajo.</div>}
          {acts.map((a, i) => (
            <React.Fragment key={a.id}>
              <ActivityRow act={a} onUpd={updAct} onDel={delAct} region={d.region} />
              {i < acts.length - 1 && <TravelConnector from={a} to={acts[i + 1]} region={d.region} />}
            </React.Fragment>
          ))}
        </div>
        <ActivityAdder onAdd={addAct} />
      </div>
    </div>
  );
}

function ActivityRow({ act, onUpd, onDel, region }) {
  const [edit, setEdit] = useState(false);
  const st = STATUS[act.status] || STATUS.idea; const StIcon = st.icon;
  if (edit) return <ActivityForm initial={act} onSave={(v) => { onUpd(act.id, v); setEdit(false); }} onCancel={() => setEdit(false)} onDelete={() => onDel(act.id)} />;
  return (
    <div className="gi-act">
      <div className="gi-act-time">{act.time || "—"}</div>
      <div className="gi-act-body">
        <div className="gi-act-top"><span className="gi-act-title">{act.title}</span><button className="gi-act-edit" onClick={() => setEdit(true)}><Pencil size={13} /></button></div>
        <div className="gi-act-tags">
          <span className="gi-act-status" style={{ color: st.c, background: st.bg }}><StIcon size={11} /> {st.label}</span>
          {act.who !== "todos" && <GroupTag g={act.who} />}
          {act.cost > 0 && <span className="gi-act-cost">{act.cost} €</span>}
          {act.place && <a className="gi-act-place" href={mapsUrl(act.place + " " + (region || "Indonesia"))} target="_blank" rel="noreferrer"><MapPin size={11} /> {act.place}</a>}
        </div>
      </div>
    </div>
  );
}

function TravelConnector({ from, to, region }) {
  if (!from.place || !to.place) return <div className="gi-travel"><div className="gi-travel-line" /></div>;
  const ctx = region ? ", " + region : ", Indonesia";
  return (
    <div className="gi-travel">
      <div className="gi-travel-line" />
      <a className="gi-travel-btn" href={dirUrl(from.place + ctx, to.place + ctx)} target="_blank" rel="noreferrer"><Navigation size={12} /> Cómo llegar</a>
    </div>
  );
}

const EMPTY_ACT = { time: "", title: "", place: "", who: "todos", status: "idea", cost: "" };
function ActivityAdder({ onAdd }) {
  const [open, setOpen] = useState(false);
  if (!open) return <button className="gi-addbtn gi-addbtn-full" onClick={() => setOpen(true)}><Plus size={17} /> Añadir actividad</button>;
  return <ActivityForm initial={{ ...EMPTY_ACT }} isNew onSave={(v) => { onAdd({ ...v, id: uid() }); setOpen(false); }} onCancel={() => setOpen(false)} />;
}
function ActivityForm({ initial, onSave, onCancel, onDelete, isNew }) {
  const [v, setV] = useState({ ...EMPTY_ACT, ...initial });
  const set = (k, val) => setV({ ...v, [k]: val });
  const save = () => { if (!v.title.trim()) return; onSave({ ...v, cost: Number(v.cost) || 0 }); };
  return (
    <div className="gi-actform">
      <div className="gi-row2">
        <input type="time" value={v.time} onChange={(e) => set("time", e.target.value)} />
        <select value={v.status} onChange={(e) => set("status", e.target.value)}>{Object.keys(STATUS).map((k) => <option key={k} value={k}>{STATUS[k].label}</option>)}</select>
      </div>
      <input placeholder="¿Qué vais a hacer?" value={v.title} onChange={(e) => set("title", e.target.value)} />
      <input placeholder="Lugar (para el mapa)" value={v.place} onChange={(e) => set("place", e.target.value)} />
      <div className="gi-row2">
        <select value={v.who} onChange={(e) => set("who", e.target.value)}>{Object.keys(WHO).map((k) => <option key={k} value={k}>{WHO[k].label}</option>)}</select>
        <input type="number" placeholder="Coste estimado €" value={v.cost} onChange={(e) => set("cost", e.target.value)} />
      </div>
      <div className="gi-edit-actions">
        {onDelete ? <button className="gi-del" onClick={onDelete}><Trash2 size={15} /> Eliminar</button> : <button className="gi-del" onClick={onCancel}>Cancelar</button>}
        <button className="gi-save" onClick={save}><Check size={15} /> {isNew ? "Añadir" : "Guardar"}</button>
      </div>
    </div>
  );
}

/* ============================================================
   ADJUNTOS (tickets)
   ============================================================ */

function Attachments({ files, setFiles, accent = "var(--sea)" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [viewer, setViewer] = useState(null);
  const onPick = async (e) => {
    const picked = [...e.target.files]; e.target.value = "";
    setBusy(true); const metas = [];
    for (const f of picked) {
      const toSend = f.type.startsWith("image") ? await compressImageToFile(f, 1400, 0.6) : f;
      const up = await uploadFile(toSend, "tickets");
      if (up) metas.push(up);
    }
    setFiles([...(files || []), ...metas]); setBusy(false);
  };
  const open = (a) => {
    const isImg = (a.type || "").startsWith("image");
    if (isImg) setViewer(a);
    else window.open(a.url, "_blank", "noopener,noreferrer");
  };
  const del = async (a) => { await deleteFileByPath(a.path); setFiles((files || []).filter((x) => x.path !== a.path)); };
  return (
    <div className="gi-attach">
      {(files || []).map((a) => {
        const isImg = (a.type || "").startsWith("image");
        return (
          <div key={a.path || a.url} className="gi-file">
            <button className="gi-file-open" onClick={() => open(a)}>{isImg ? <ImageIcon size={13} /> : <FileText size={13} />}<span className="gi-file-name">{a.name}</span></button>
            <button className="gi-file-del" onClick={() => del(a)}><X size={12} /></button>
          </div>
        );
      })}
      <button className="gi-file-add" style={{ color: accent, borderColor: accent }} onClick={() => inputRef.current && inputRef.current.click()} disabled={busy}>
        {busy ? <Loader2 size={13} className="gi-spin" /> : <Paperclip size={13} />} {busy ? "Subiendo…" : "Adjuntar"}
      </button>
      <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple style={{ display: "none" }} onChange={onPick} />
      {viewer && <FileViewer file={viewer} onClose={() => setViewer(null)} />}
    </div>
  );
}

function FileViewer({ file, onClose }) {
  return (
    <div className="gi-modal" onClick={onClose}>
      <div className="gi-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="gi-modal-head"><span className="gi-modal-name">{file.name}</span><button className="gi-modal-x" onClick={onClose}><X size={18} /></button></div>
        <div className="gi-modal-body"><img src={file.url} alt={file.name} className="gi-modal-img" /></div>
        <a className="gi-modal-dl" href={file.url} download={file.name} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Abrir / descargar</a>
      </div>
    </div>
  );
}

/* ============================================================
   TICKETS
   ============================================================ */

function TabTickets({ tickets, setTickets }) {
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("todos");
  const update = (id, patch) => setTickets(tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id) => { setTickets(tickets.filter((t) => t.id !== id)); setEditId(null); };
  const add = (mode) => { const t = { id: uid(), mode, op: mode === "entrada" ? "Nueva entrada" : "Nuevo billete", from: "", to: "", date: "", time: "", code: "", note: "", group: "todos", status: "pendiente", files: [] }; setTickets([...tickets, t]); setEditId(t.id); setFilter("todos"); };

  const dates = useMemo(() => {
    const ds = [...new Set(tickets.map((t) => (t.date || "").trim()).filter(Boolean))];
    ds.sort((a, b) => { const pa = parseDMY(a) || { mo: 99, d: 99 }, pb = parseDMY(b) || { mo: 99, d: 99 }; return pa.mo * 100 + pa.d - (pb.mo * 100 + pb.d); });
    return ds;
  }, [tickets]);

  const shown = useMemo(() => {
    const list = filter === "todos" ? tickets : tickets.filter((t) => (t.date || "").trim() === filter);
    return [...list].sort((a, b) => ticketSortKey(a) - ticketSortKey(b));
  }, [tickets, filter]);

  return (
    <div>
      <div className="gi-pagehd"><h2 className="gi-pagehd-title">Tickets</h2><p className="gi-pagehd-sub">Billetes, entradas a templos, reservas… Filtra por día y adjunta PDFs o fotos.</p></div>

      <div className="gi-tfilter">
        <button className={"gi-tchip" + (filter === "todos" ? " gi-tchip-on" : "")} onClick={() => setFilter("todos")}>Todos</button>
        {dates.map((d) => <button key={d} className={"gi-tchip" + (filter === d ? " gi-tchip-on" : "")} onClick={() => setFilter(d)}>{d}</button>)}
      </div>

      <div className="gi-ticketlist">
        {shown.length === 0 && <div className="gi-acts-empty">No hay tickets para este día.</div>}
        {shown.map((t) => {
          const Icon = MODE_ICON[t.mode] || Plane; const editing = editId === t.id;
          return (
            <div key={t.id} className={"gi-ticket" + (t.status === "pendiente" ? " gi-ticket-pend" : "")}>
              {!editing ? (
                <>
                  <div className="gi-ticket-row">
                    <div className="gi-ticket-side"><span className="gi-ticket-icon"><Icon size={16} /></span><span className="gi-ticket-date">{t.date}{t.time ? " · " + t.time : ""}</span></div>
                    <div className="gi-ticket-main">
                      <div className="gi-ticket-route">{t.from}{t.to ? <> <span className="gi-arrow">→</span> {t.to}</> : ""}</div>
                      <div className="gi-ticket-op">{t.op}</div>
                      <div className="gi-ticket-tags">
                        <GroupTag g={t.group} />
                        {t.code && <span className="gi-code">{t.code}</span>}
                        {t.status === "pendiente" && <span className="gi-pendtag">Por reservar</span>}
                        {t.note && <span className="gi-ticket-note">{t.note}</span>}
                      </div>
                    </div>
                    <button className="gi-mini-btn" onClick={() => setEditId(t.id)}><Pencil size={15} /></button>
                  </div>
                  <Attachments files={t.files} setFiles={(f) => update(t.id, { files: f })} />
                </>
              ) : (
                <div className="gi-ticket-edit">
                  <div className="gi-row2">
                    <select value={t.mode} onChange={(e) => update(t.id, { mode: e.target.value })}><option value="plane">Vuelo</option><option value="train">Tren</option><option value="ferry">Ferry</option><option value="bus">Bus/Traslado</option><option value="entrada">Entrada</option></select>
                    <select value={t.group} onChange={(e) => update(t.id, { group: e.target.value })}><option value="todos">Todos</option><option value="A">Grupo A</option><option value="B">Grupo B</option></select>
                  </div>
                  <input placeholder="Operador / nombre" value={t.op} onChange={(e) => update(t.id, { op: e.target.value })} />
                  <div className="gi-row2"><input placeholder="Origen / lugar" value={t.from} onChange={(e) => update(t.id, { from: e.target.value })} /><input placeholder="Destino" value={t.to} onChange={(e) => update(t.id, { to: e.target.value })} /></div>
                  <div className="gi-row2">
                    <input placeholder="Fecha (ej. 30 jul)" value={t.date} onChange={(e) => update(t.id, { date: e.target.value })} />
                    <input placeholder="Hora (ej. 09:30)" value={t.time} onChange={(e) => update(t.id, { time: e.target.value })} />
                  </div>
                  <div className="gi-row2"><input placeholder="Localizador" value={t.code} onChange={(e) => update(t.id, { code: e.target.value })} /><select value={t.status} onChange={(e) => update(t.id, { status: e.target.value })}><option value="confirmado">Confirmado</option><option value="pendiente">Por reservar</option></select></div>
                  <input placeholder="Nota" value={t.note} onChange={(e) => update(t.id, { note: e.target.value })} />
                  <div className="gi-edit-actions"><button className="gi-del" onClick={() => remove(t.id)}><Trash2 size={15} /> Eliminar</button><button className="gi-save" onClick={() => setEditId(null)}><Check size={15} /> Listo</button></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="gi-addrow"><button className="gi-addbtn" onClick={() => add("plane")}><Plus size={16} /> Billete</button><button className="gi-addbtn" onClick={() => add("entrada")}><Plus size={16} /> Entrada</button></div>
    </div>
  );
}

/* ============================================================
   SITIOS (sin sugerencias: desde cero)
   ============================================================ */

function TabSitios({ stops, setStops }) {
  const [open, setOpen] = useState(stops[0]?.id || null);
  const addPoi = (id, text) => { if (!text.trim()) return; setStops(stops.map((s) => s.id === id ? { ...s, pois: [...s.pois, text.trim()] } : s)); };
  const removePoi = (id, idx) => setStops(stops.map((s) => s.id === id ? { ...s, pois: s.pois.filter((_, i) => i !== idx) } : s));
  return (
    <div>
      <div className="gi-pagehd"><h2 className="gi-pagehd-title">Sitios de interés</h2><p className="gi-pagehd-sub">Añadid vuestros sitios en cada parada. Se abren en el mapa al tocarlos.</p></div>
      <div className="gi-stoplist">
        {stops.map((s) => {
          const isOpen = open === s.id;
          return (
            <div key={s.id} className={"gi-stop" + (isOpen ? " gi-stop-open" : "")}>
              <button className="gi-stop-head" onClick={() => setOpen(isOpen ? null : s.id)}><span className="gi-stop-name">{s.name}</span><span className="gi-stop-region">{s.region} · {s.nights}</span><ChevronDown size={16} className="gi-chev" /></button>
              {isOpen && (
                <div className="gi-stop-body">
                  <a className="gi-maparea" href={mapsUrl(s.name + " Indonesia")} target="_blank" rel="noreferrer"><MapPin size={14} /> Ver {s.name} en el mapa <ExternalLink size={12} /></a>
                  <PoiList stop={s} onAdd={addPoi} onRemove={removePoi} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function PoiList({ stop, onAdd, onRemove }) {
  const [val, setVal] = useState("");
  return (
    <div className="gi-poilist">
      {stop.pois.length === 0 && <div className="gi-poi-empty">Aún no habéis añadido sitios aquí.</div>}
      {stop.pois.map((p, i) => (
        <div key={i} className="gi-poi">
          <a className="gi-poi-link" href={mapsUrl(p + " " + stop.name)} target="_blank" rel="noreferrer"><MapPin size={13} /> {p}</a>
          <button className="gi-poi-del" onClick={() => onRemove(stop.id, i)}><X size={13} /></button>
        </div>
      ))}
      <div className="gi-poi-add">
        <input placeholder="Añadir un sitio…" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { onAdd(stop.id, val); setVal(""); } }} />
        <button onClick={() => { onAdd(stop.id, val); setVal(""); }}><Plus size={15} /></button>
      </div>
    </div>
  );
}

/* ============================================================
   NOTAS (chat con colores · fotos y audios)
   ============================================================ */

function TabNotas({ notas, setNotas, onSync }) {
  const [me, setMe] = useState(0);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(null); // {id, type}
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileRef = useRef(null);
  const endRef = useRef(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ block: "end" }); }, [notas.length]);

  const pickPhoto = async (e) => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    setBusy(true);
    const toSend = await compressImageToFile(f, 1000, 0.6);
    const up = await uploadFile(toSend, "notas");
    setBusy(false);
    if (up) setPending({ url: up.url, path: up.path, type: "image" });
  };

  const pickAudioMime = () => {
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "";
    const candidates = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/aac", "audio/ogg"];
    for (const c of candidates) { try { if (MediaRecorder.isTypeSupported(c)) return c; } catch { /* noop */ } }
    return "";
  };

  const startRec = async () => {
    if (typeof MediaRecorder === "undefined") { alert("Este navegador no permite grabar audio. Prueba a actualizar Safari o usa Chrome."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickAudioMime();
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        if (!chunksRef.current.length) { alert("No se ha grabado nada. Mantén pulsado un poco más e inténtalo de nuevo."); return; }
        const type = mr.mimeType || mime || "audio/webm";
        const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : type.includes("webm") ? "webm" : "audio";
        const blob = new Blob(chunksRef.current, { type });
        const file = new File([blob], `audio-${Date.now()}.${ext}`, { type });
        setBusy(true);
        const up = await uploadFile(file, "notas");
        setBusy(false);
        if (up) setPending({ url: up.url, path: up.path, type: "audio" });
        else alert("No se ha podido subir el audio. Comprueba la conexión e inténtalo de nuevo.");
      };
      mr.start(); recRef.current = mr; setRecording(true);
    } catch (err) { alert("No se pudo acceder al micrófono: " + err.message); }
  };
  const stopRec = () => { if (recRef.current && recording) { recRef.current.stop(); setRecording(false); } };

  const send = () => {
    if (!text.trim() && !pending) return;
    const msg = { id: uid(), a: me, text: text.trim(), fileUrl: pending ? pending.url : null, filePath: pending ? pending.path : null, fileType: pending ? pending.type : null, ts: Date.now() };
    setNotas([...notas, msg]); setText(""); setPending(null);
  };
  const del = async (m) => { if (m.filePath) await deleteFileByPath(m.filePath); setNotas(notas.filter((x) => x.id !== m.id)); };

  return (
    <div className="gi-notas">
      <div className="gi-pagehd">
        <h2 className="gi-pagehd-title">Notas</h2>
        <p className="gi-pagehd-sub">Vuestro cuaderno común: comentarios, fotos y audios del viaje.</p>
        <button className="gi-cfg-btn" onClick={onSync}><RefreshCw size={13} /> Actualizar</button>
      </div>

      <div className="gi-whoami">
        <span className="gi-whoami-lbl">Escribes como:</span>
        {AUTHORS.map((a, i) => (
          <button key={i} className={"gi-whochip" + (i === me ? " gi-whochip-on" : "")} style={i === me ? { background: a.dot, borderColor: a.dot, color: "#fff" } : { borderColor: a.bd, color: "#333" }} onClick={() => setMe(i)}>{a.name}</button>
        ))}
      </div>

      <div className="gi-chat">
        {notas.length === 0 && <div className="gi-chat-empty">Aún no hay notas. Escribe la primera abajo. ✍️</div>}
        {notas.map((m) => {
          const au = AUTHORS[m.a] || AUTHORS[0]; const mine = m.a === me;
          return (
            <div key={m.id} className={"gi-msg" + (mine ? " gi-msg-mine" : "")}>
              <div className="gi-bubble" style={{ background: au.bg, borderColor: au.bd }}>
                <div className="gi-bubble-name" style={{ color: au.dot }}>{au.name}</div>
                {m.fileUrl && <ChatMedia url={m.fileUrl} type={m.fileType} />}
                {m.text && <div className="gi-bubble-text">{m.text}</div>}
                <button className="gi-bubble-del" onClick={() => del(m)}><X size={12} /></button>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="gi-compose">
        {pending && (
          <div className="gi-compose-preview">
            {pending.type === "audio" ? <span className="gi-audio-chip"><Mic size={13} /> Audio listo</span> : <ChatMedia url={pending.url} type="image" small />}
            <button onClick={() => setPending(null)}><X size={14} /></button>
          </div>
        )}
        <div className="gi-compose-row">
          <button className="gi-compose-photo" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy || recording}>{busy ? <Loader2 size={18} className="gi-spin" /> : <ImageIcon size={18} />}</button>
          <button className={"gi-compose-mic" + (recording ? " rec" : "")} onClick={recording ? stopRec : startRec}>{recording ? <Square size={16} /> : <Mic size={18} />}</button>
          <input className="gi-compose-input" placeholder={recording ? "Grabando audio…" : "Escribe una nota…"} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} disabled={recording} />
          <button className="gi-compose-send" onClick={send}><Send size={17} /></button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={pickPhoto} />
      </div>
    </div>
  );
}

function ChatMedia({ url, type, small }) {
  const [full, setFull] = useState(false);
  if (!url) return <div className={"gi-chatimg-ph" + (small ? " sm" : "")}><Loader2 size={16} className="gi-spin" /></div>;
  if (type === "audio") return <audio controls src={url} className="gi-chataudio" />;
  return (
    <>
      <img src={url} className={"gi-chatimg" + (small ? " sm" : "")} onClick={() => !small && setFull(true)} alt="" />
      {full && <div className="gi-modal" onClick={() => setFull(false)}><img src={url} className="gi-modal-img" alt="" /></div>}
    </>
  );
}

/* ============================================================
   ESTILOS
   ============================================================ */

const CSS = `
:root{
  --ink:#16302B; --ink-soft:#5E6E66; --line:#E7E0D2;
  --amber:#E58A38; --amberDeep:#B5631A; --amberSoft:#F8E6D2;
  --sea:#2F8A82; --seaDeep:#1C605A; --seaSoft:#D6EAE6;
  --card:rgba(255,255,255,.86);
}
*{box-sizing:border-box;}
.gi-root{ color:var(--ink); min-height:100vh; position:relative; font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; max-width:520px; margin:0 auto; padding-bottom:80px; -webkit-font-smoothing:antialiased; overflow-x:hidden; }
.gi-bg{ position:fixed; top:0; left:50%; transform:translateX(-50%); width:100%; max-width:520px; height:100vh; background-size:cover; background-position:center; z-index:-2; }
.gi-bg-veil{ position:fixed; top:0; left:50%; transform:translateX(-50%); width:100%; max-width:520px; height:100vh; z-index:-1; background:linear-gradient(180deg, rgba(20,30,26,.18) 0%, rgba(244,239,230,.30) 26%, rgba(244,239,230,.62) 60%, rgba(244,239,230,.78) 100%); }
.gi-main{ padding:0 0 24px; }
.gi-loading{ display:flex; align-items:center; justify-content:center; gap:9px; color:#fff; padding:90px 0; text-shadow:0 1px 6px rgba(0,0,0,.4); }
.gi-spin{ animation:giSpin 1s linear infinite; } @keyframes giSpin{ to{ transform:rotate(360deg); } }
.gi-fade{ animation:giFade .28s ease; } @keyframes giFade{ from{opacity:0; transform:translateY(5px);} to{opacity:1; transform:none;} }
@media (prefers-reduced-motion:reduce){ .gi-fade{ animation:none; } }
.gi-hero{ position:relative; height:280px; background-size:cover; background-position:center 35%; overflow:hidden; }
.gi-hero-scrim{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.10) 62%, rgba(20,30,26,.62) 100%); }
.gi-hero-content{ position:absolute; left:0; right:0; bottom:0; padding:22px; color:#fff; }
.gi-hero-title{ font-size:44px; line-height:.98; margin:0; font-weight:700; letter-spacing:-.02em; text-shadow:0 2px 20px rgba(0,0,0,.4); }
.gi-hero-sub{ font-size:14px; margin-top:6px; font-weight:500; opacity:.96; text-shadow:0 1px 10px rgba(0,0,0,.5); }
.gi-hero-chip{ display:inline-block; margin-top:13px; font-size:12px; font-weight:600; background:rgba(255,255,255,.22); border:1px solid rgba(255,255,255,.35); padding:5px 12px; border-radius:20px; backdrop-filter:blur(6px); }
.gi-sync{ position:absolute; top:18px; right:18px; background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.35); color:#fff; width:36px; height:36px; border-radius:50%; display:grid; place-items:center; cursor:pointer; backdrop-filter:blur(6px); z-index:2; }
.gi-today{ margin:16px; background:var(--card); border:1px solid rgba(255,255,255,.6); border-radius:20px; padding:16px 18px; box-shadow:0 14px 34px -18px rgba(20,48,43,.5); backdrop-filter:blur(12px); }
.gi-today-head{ display:flex; justify-content:space-between; align-items:center; }
.gi-today-eyebrow{ font-size:12px; letter-spacing:.14em; text-transform:uppercase; font-weight:800; color:var(--amberDeep); }
.gi-today-count{ font-size:12px; font-weight:700; color:var(--seaDeep); background:var(--seaSoft); padding:3px 9px; border-radius:20px; }
.gi-today-title{ font-size:19px; font-weight:700; margin-top:6px; letter-spacing:-.01em; }
.gi-today-date{ font-size:12px; color:var(--ink-soft); text-transform:capitalize; }
.gi-today-split{ display:flex; flex-direction:column; gap:3px; margin-top:9px; font-size:12.5px; }
.gi-today-line{ font-size:12.5px; margin-top:8px; color:var(--ink); }
.gi-today-tickets{ margin-top:11px; display:flex; flex-direction:column; gap:5px; padding:9px 11px; background:var(--seaSoft); border-radius:11px; }
.gi-today-ticket{ display:flex; align-items:center; gap:7px; font-size:12px; color:var(--seaDeep); }
.gi-today-ticket-t{ font-weight:600; }
.gi-today-ticket-file{ margin-left:auto; display:inline-flex; align-items:center; gap:2px; background:rgba(255,255,255,.7); border:1px solid var(--seaDeep); color:var(--seaDeep); border-radius:20px; padding:2px 7px; font-size:10.5px; font-weight:700; cursor:pointer; font-family:inherit; }
.gi-today-acts{ margin-top:11px; display:flex; flex-direction:column; gap:5px; }
.gi-today-act{ display:flex; gap:9px; align-items:baseline; }
.gi-today-time{ font-size:11px; font-weight:700; color:var(--amberDeep); min-width:38px; }
.gi-today-act-t{ font-size:13px; }
.gi-today-foot{ display:flex; justify-content:space-between; align-items:center; margin-top:13px; padding-top:12px; border-top:1px solid var(--line); }
.gi-today-sleep{ display:flex; align-items:center; gap:5px; font-size:12.5px; color:var(--ink-soft); }
.gi-today-btn{ background:var(--ink); color:#fff; border:none; border-radius:20px; padding:7px 13px; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; }
.gi-today-done{ font-size:14px; margin-top:8px; }
.gi-mapcard{ margin:16px; background:var(--card); border:1px solid rgba(255,255,255,.6); border-radius:20px; padding:14px; box-shadow:0 10px 30px -16px rgba(20,48,43,.4); backdrop-filter:blur(10px); }
.gi-map-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.gi-map-title{ font-size:17px; font-weight:700; letter-spacing:-.01em; }
.gi-map-open{ display:flex; align-items:center; gap:4px; font-size:12px; font-weight:600; color:var(--seaDeep); text-decoration:none; }
.gi-map-chips{ display:flex; gap:6px; overflow-x:auto; padding-bottom:6px; margin-bottom:10px; scrollbar-width:none; }
.gi-map-chips::-webkit-scrollbar{ display:none; }
.gi-mapchip{ display:flex; align-items:center; gap:5px; flex:none; background:#fff; border:1px solid var(--line); border-radius:20px; padding:5px 11px 5px 6px; font-size:12px; font-weight:600; color:var(--ink-soft); cursor:pointer; font-family:inherit; }
.gi-mapchip-on{ background:var(--ink); color:#fff; border-color:var(--ink); }
.gi-mapchip-n{ width:18px; height:18px; border-radius:50%; background:var(--seaSoft); color:var(--seaDeep); display:grid; place-items:center; font-size:10px; font-weight:800; }
.gi-mapchip-on .gi-mapchip-n{ background:var(--amber); color:#fff; }
.gi-map-frame-wrap{ position:relative; border-radius:14px; overflow:hidden; border:1px solid var(--line); background:#e8ede9; min-height:240px; }
.gi-map-fallback{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:var(--ink-soft); font-size:12.5px; text-align:center; padding:16px; }
.gi-map-fallback a{ color:var(--seaDeep); font-weight:600; text-decoration:none; background:var(--seaSoft); padding:7px 13px; border-radius:9px; }
.gi-map-frame{ position:relative; width:100%; height:240px; border:none; display:block; }
.gi-map-foot{ font-size:11.5px; color:var(--ink-soft); margin-top:9px; line-height:1.4; }
.gi-pagehd{ margin:16px; padding:16px 18px; background:var(--card); border:1px solid rgba(255,255,255,.6); border-radius:18px; backdrop-filter:blur(10px); box-shadow:0 10px 30px -18px rgba(20,48,43,.4); display:flex; flex-direction:column; gap:3px; position:relative; }
.gi-pagehd-title{ font-size:24px; font-weight:700; margin:0; letter-spacing:-.02em; }
.gi-pagehd-sub{ font-size:12.5px; color:var(--ink-soft); margin:0; max-width:88%; }
.gi-datestrip{ display:flex; gap:7px; overflow-x:auto; padding:0 16px 4px; scrollbar-width:none; }
.gi-datestrip::-webkit-scrollbar{ display:none; }
.gi-datechip{ position:relative; flex:none; width:52px; background:var(--card); border:1px solid rgba(255,255,255,.6); border-radius:14px; padding:8px 0; display:flex; flex-direction:column; align-items:center; gap:1px; cursor:pointer; font-family:inherit; backdrop-filter:blur(8px); box-shadow:0 6px 16px -14px rgba(20,48,43,.5); }
.gi-datechip-on{ background:var(--ink); border-color:var(--ink); }
.gi-datechip-wd{ font-size:10px; text-transform:uppercase; color:var(--ink-soft); font-weight:700; }
.gi-datechip-d{ font-size:18px; font-weight:700; color:var(--ink); }
.gi-datechip-m{ font-size:9.5px; text-transform:uppercase; color:var(--ink-soft); }
.gi-datechip-on .gi-datechip-wd, .gi-datechip-on .gi-datechip-d, .gi-datechip-on .gi-datechip-m{ color:#fff; }
.gi-datechip-dot{ position:absolute; top:6px; right:9px; width:6px; height:6px; border-radius:50%; background:var(--amber); }
.gi-agday{ margin:14px 16px 0; background:var(--card); border:1px solid rgba(255,255,255,.6); border-radius:18px; padding:16px; backdrop-filter:blur(10px); box-shadow:0 10px 30px -18px rgba(20,48,43,.45); }
.gi-agday-hd{ display:flex; justify-content:space-between; align-items:flex-start; }
.gi-agday-title{ font-size:18px; font-weight:700; letter-spacing:-.01em; }
.gi-agday-sub{ display:flex; align-items:center; gap:5px; font-size:12px; color:var(--ink-soft); margin-top:2px; }
.gi-agday-cost{ font-size:12px; font-weight:700; color:var(--amberDeep); background:var(--amberSoft); padding:4px 9px; border-radius:20px; }
.gi-agday-fixed{ margin-top:12px; padding:10px 12px; background:rgba(255,255,255,.5); border-radius:12px; display:flex; flex-direction:column; gap:5px; }
.gi-fixedline{ font-size:12px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.gi-fixedline-muted{ color:var(--ink-soft); }
.gi-acts{ margin-top:14px; }
.gi-acts-empty{ font-size:13px; color:var(--ink-soft); text-align:center; padding:14px 0; }
.gi-act{ display:flex; gap:11px; }
.gi-act-time{ font-size:12px; font-weight:800; color:var(--amberDeep); min-width:42px; padding-top:2px; }
.gi-act-body{ flex:1; min-width:0; padding-bottom:2px; }
.gi-act-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; }
.gi-act-title{ font-size:14px; font-weight:600; }
.gi-act-edit{ background:none; border:none; color:var(--ink-soft); cursor:pointer; padding:2px; flex:none; }
.gi-act-tags{ display:flex; flex-wrap:wrap; gap:5px; margin-top:5px; align-items:center; }
.gi-act-status{ display:inline-flex; align-items:center; gap:3px; font-size:10px; font-weight:700; padding:2px 7px; border-radius:20px; }
.gi-act-cost{ font-size:10.5px; font-weight:700; color:var(--ink-soft); }
.gi-act-place{ display:inline-flex; align-items:center; gap:3px; font-size:11px; color:var(--seaDeep); text-decoration:none; background:var(--seaSoft); padding:2px 7px; border-radius:20px; }
.gi-travel{ display:flex; gap:11px; min-height:26px; align-items:center; }
.gi-travel-line{ width:42px; display:flex; justify-content:center; align-self:stretch; }
.gi-travel-line::before{ content:""; width:2px; background:var(--line); margin-left:20px; }
.gi-travel-btn{ display:inline-flex; align-items:center; gap:5px; font-size:11.5px; font-weight:600; color:var(--seaDeep); background:var(--seaSoft); padding:4px 11px; border-radius:20px; text-decoration:none; }
.gi-actform{ margin-top:8px; display:flex; flex-direction:column; gap:7px; background:rgba(255,255,255,.55); border:1px solid var(--line); border-radius:12px; padding:11px; }
.gi-actform input, .gi-actform select{ border:1px solid var(--line); border-radius:9px; padding:8px 10px; font-size:13px; font-family:inherit; background:#fff; color:var(--ink); width:100%; }
.gi-actform input:focus, .gi-actform select:focus{ outline:none; border-color:var(--amber); }
.gi-ticket, .gi-stop{ backdrop-filter:blur(10px); }
.gi-tfilter{ display:flex; gap:6px; overflow-x:auto; padding:0 16px 4px; scrollbar-width:none; margin-bottom:10px; }
.gi-tfilter::-webkit-scrollbar{ display:none; }
.gi-tchip{ flex:none; background:var(--card); border:1px solid rgba(255,255,255,.6); border-radius:20px; padding:6px 13px; font-size:12px; font-weight:600; color:var(--ink-soft); cursor:pointer; font-family:inherit; backdrop-filter:blur(8px); }
.gi-tchip-on{ background:var(--ink); color:#fff; border-color:var(--ink); }
.gi-ticketlist{ display:flex; flex-direction:column; gap:9px; padding:0 16px; }
.gi-ticket{ background:var(--card); border:1px solid rgba(255,255,255,.55); border-radius:15px; padding:12px 13px; box-shadow:0 8px 22px -16px rgba(20,48,43,.45); }
.gi-ticket-pend{ border-style:dashed; border-color:var(--amber); }
.gi-ticket-row{ display:flex; gap:12px; align-items:flex-start; }
.gi-ticket-side{ display:flex; flex-direction:column; align-items:center; gap:5px; width:50px; flex:none; }
.gi-ticket-icon{ width:34px; height:34px; border-radius:11px; background:var(--ink); color:#fff; display:grid; place-items:center; }
.gi-ticket-pend .gi-ticket-icon{ background:var(--amberSoft); color:var(--amberDeep); }
.gi-ticket-date{ font-size:10px; font-weight:700; color:var(--ink-soft); text-align:center; line-height:1.15; }
.gi-ticket-main{ flex:1; min-width:0; }
.gi-ticket-route{ font-size:14px; font-weight:650; }
.gi-arrow{ color:var(--amber); }
.gi-ticket-op{ font-size:12px; color:var(--ink-soft); margin-top:1px; }
.gi-ticket-tags{ display:flex; flex-wrap:wrap; gap:6px; margin-top:7px; align-items:center; }
.gi-grouptag{ font-size:10px; font-weight:700; padding:2px 7px; border-radius:20px; }
.gi-code{ font-size:10.5px; font-weight:700; letter-spacing:.04em; background:var(--ink); color:#fff; padding:2px 7px; border-radius:5px; }
.gi-pendtag{ font-size:10px; font-weight:700; color:var(--amberDeep); border:1px solid var(--amber); padding:1px 7px; border-radius:20px; }
.gi-ticket-note{ font-size:11px; color:var(--ink-soft); }
.gi-mini-btn{ background:none; border:none; color:var(--ink-soft); cursor:pointer; padding:4px; flex:none; }
.gi-ticket-edit{ display:flex; flex-direction:column; gap:7px; }
.gi-ticket-edit input, .gi-ticket-edit select{ border:1px solid var(--line); border-radius:9px; padding:8px 10px; font-size:13px; font-family:inherit; background:rgba(255,255,255,.75); color:var(--ink); width:100%; }
.gi-ticket-edit input:focus, .gi-ticket-edit select:focus{ outline:none; border-color:var(--amber); background:#fff; }
.gi-row2{ display:flex; gap:7px; } .gi-row2>*{ flex:1; min-width:0; }
.gi-edit-actions{ display:flex; justify-content:space-between; margin-top:3px; }
.gi-del{ background:none; border:none; color:#B23A3A; font-size:13px; display:flex; align-items:center; gap:5px; cursor:pointer; font-weight:600; font-family:inherit; }
.gi-save{ background:var(--ink); color:#fff; border:none; border-radius:9px; padding:7px 14px; font-size:13px; display:flex; align-items:center; gap:5px; cursor:pointer; font-weight:600; font-family:inherit; }
.gi-attach{ display:flex; flex-wrap:wrap; gap:6px; margin-top:11px; padding-top:11px; border-top:1px dashed var(--line); }
.gi-file{ display:flex; align-items:center; background:var(--seaSoft); border-radius:8px; overflow:hidden; }
.gi-file-open{ display:flex; align-items:center; gap:5px; background:none; border:none; color:var(--seaDeep); font-size:11.5px; font-weight:600; padding:5px 4px 5px 9px; cursor:pointer; max-width:160px; }
.gi-file-name{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gi-file-del{ background:none; border:none; color:var(--seaDeep); cursor:pointer; padding:5px 7px 5px 3px; opacity:.7; }
.gi-file-add{ display:flex; align-items:center; gap:6px; background:rgba(255,255,255,.5); border:1.5px dashed; border-radius:8px; font-size:11.5px; font-weight:600; padding:6px 11px; cursor:pointer; font-family:inherit; }
.gi-file-add:disabled{ opacity:.6; }
.gi-addrow{ display:flex; gap:10px; padding:14px 16px 0; }
.gi-addbtn{ flex:1; background:var(--card); border:1.5px dashed var(--amber); color:var(--amberDeep); border-radius:12px; padding:12px; font-size:14px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:7px; cursor:pointer; font-family:inherit; backdrop-filter:blur(8px); }
.gi-addbtn-full{ width:100%; margin-top:12px; }
.gi-modal{ position:fixed; inset:0; background:rgba(15,30,27,.7); display:flex; align-items:center; justify-content:center; z-index:50; padding:16px; backdrop-filter:blur(3px); }
.gi-modal-box{ background:#fff; border-radius:18px; max-width:480px; width:100%; max-height:86vh; display:flex; flex-direction:column; overflow:hidden; }
.gi-modal-head{ display:flex; justify-content:space-between; align-items:center; padding:13px 15px; border-bottom:1px solid var(--line); }
.gi-modal-name{ font-size:13.5px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.gi-modal-x{ background:none; border:none; cursor:pointer; color:var(--ink-soft); }
.gi-modal-body{ flex:1; overflow:auto; background:#f1ece2; display:flex; align-items:center; justify-content:center; min-height:200px; }
.gi-modal-img{ max-width:100%; max-height:80vh; display:block; border-radius:10px; }
.gi-modal-frame2{ width:100%; height:70vh; border:none; background:#fff; }
.gi-modal-dl{ display:flex; align-items:center; justify-content:center; gap:7px; padding:13px; font-size:13.5px; font-weight:600; color:var(--seaDeep); text-decoration:none; border-top:1px solid var(--line); }
.gi-stoplist{ display:flex; flex-direction:column; gap:8px; padding:0 16px; }
.gi-stop{ background:var(--card); border:1px solid rgba(255,255,255,.55); border-radius:15px; overflow:hidden; box-shadow:0 8px 22px -16px rgba(20,48,43,.45); }
.gi-stop-open{ border-color:var(--sea); }
.gi-stop-head{ width:100%; background:none; border:none; display:flex; align-items:center; gap:10px; padding:14px; cursor:pointer; text-align:left; }
.gi-stop-name{ font-size:17px; font-weight:700; flex:none; letter-spacing:-.01em; }
.gi-stop-region{ font-size:11.5px; color:var(--ink-soft); flex:1; }
.gi-chev{ color:var(--ink-soft); flex:none; }
.gi-stop-body{ padding:0 14px 14px; }
.gi-maparea{ display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; color:var(--seaDeep); background:var(--seaSoft); padding:7px 11px; border-radius:9px; text-decoration:none; margin-bottom:10px; }
.gi-poilist{ display:flex; flex-direction:column; gap:5px; }
.gi-poi-empty{ font-size:12px; color:var(--ink-soft); font-style:italic; padding:2px 0 6px; }
.gi-poi{ display:flex; align-items:center; gap:8px; }
.gi-poi-link{ flex:1; display:flex; align-items:center; gap:7px; font-size:13px; color:var(--ink); text-decoration:none; background:rgba(255,255,255,.6); border:1px solid var(--line); border-radius:9px; padding:8px 11px; }
.gi-poi-del{ background:none; border:none; color:var(--ink-soft); cursor:pointer; padding:5px; flex:none; }
.gi-poi-add{ display:flex; gap:7px; margin-top:5px; }
.gi-poi-add input{ flex:1; border:1px solid var(--line); border-radius:9px; padding:8px 11px; font-size:13px; font-family:inherit; background:rgba(255,255,255,.75); color:var(--ink); }
.gi-poi-add input:focus{ outline:none; border-color:var(--sea); background:#fff; }
.gi-poi-add button{ background:var(--ink); color:#fff; border:none; border-radius:9px; width:38px; display:grid; place-items:center; cursor:pointer; flex:none; }
.gi-notas{ position:relative; }
.gi-cfg-btn{ position:absolute; right:18px; top:18px; background:#fff; border:1px solid var(--line); border-radius:20px; padding:6px 11px; font-size:12px; color:var(--ink); display:flex; align-items:center; gap:5px; cursor:pointer; font-family:inherit; font-weight:600; }
.gi-whoami{ display:flex; align-items:center; gap:6px; flex-wrap:wrap; padding:0 16px; margin-bottom:10px; }
.gi-whoami-lbl{ font-size:11.5px; color:#fff; font-weight:600; text-shadow:0 1px 6px rgba(0,0,0,.5); }
.gi-whochip{ background:#fff; border:1.5px solid; border-radius:20px; padding:4px 11px; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; }
.gi-chat{ display:flex; flex-direction:column; gap:8px; padding:0 16px 150px; }
.gi-chat-empty{ text-align:center; color:#fff; font-size:13px; padding:24px 0; text-shadow:0 1px 8px rgba(0,0,0,.5); }
.gi-msg{ display:flex; }
.gi-msg-mine{ justify-content:flex-end; }
.gi-bubble{ position:relative; max-width:80%; border:1px solid; border-radius:15px; padding:8px 11px 9px; box-shadow:0 6px 16px -14px rgba(20,48,43,.5); }
.gi-bubble-name{ font-size:11px; font-weight:800; margin-bottom:2px; }
.gi-bubble-text{ font-size:14px; line-height:1.35; white-space:pre-wrap; word-break:break-word; }
.gi-bubble-del{ position:absolute; top:-7px; right:-7px; width:20px; height:20px; border-radius:50%; background:#fff; border:1px solid var(--line); color:var(--ink-soft); cursor:pointer; display:grid; place-items:center; opacity:0; transition:opacity .15s; }
.gi-bubble:hover .gi-bubble-del{ opacity:1; }
.gi-chatimg{ display:block; max-width:210px; max-height:260px; border-radius:10px; margin-bottom:4px; cursor:pointer; }
.gi-chatimg.sm{ max-width:56px; max-height:56px; margin:0; }
.gi-chatimg-ph{ width:120px; height:90px; border-radius:10px; background:rgba(0,0,0,.06); display:grid; place-items:center; color:var(--ink-soft); }
.gi-chatimg-ph.sm{ width:52px; height:52px; }
.gi-chataudio{ display:block; width:210px; max-width:60vw; margin-bottom:2px; }
.gi-audio-chip{ display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:600; color:var(--seaDeep); background:var(--seaSoft); padding:6px 11px; border-radius:20px; }
.gi-compose{ position:fixed; bottom:62px; left:50%; transform:translateX(-50%); width:100%; max-width:520px; padding:8px 12px; background:rgba(255,255,255,.94); border-top:1px solid var(--line); backdrop-filter:blur(12px); z-index:15; }
.gi-compose-preview{ display:inline-flex; align-items:center; gap:6px; margin-bottom:7px; }
.gi-compose-preview button{ background:var(--ink); color:#fff; border:none; border-radius:50%; width:22px; height:22px; display:grid; place-items:center; cursor:pointer; }
.gi-compose-row{ display:flex; align-items:center; gap:7px; }
.gi-compose-photo, .gi-compose-mic{ background:var(--seaSoft); border:none; color:var(--seaDeep); width:40px; height:40px; border-radius:50%; display:grid; place-items:center; cursor:pointer; flex:none; }
.gi-compose-photo:disabled{ opacity:.6; }
.gi-compose-mic.rec{ background:#E5484D; color:#fff; animation:giPulse 1s ease-in-out infinite; }
@keyframes giPulse{ 50%{ opacity:.6; } }
.gi-compose-input{ flex:1; min-width:0; border:1px solid var(--line); border-radius:22px; padding:11px 15px; font-size:15px; font-family:inherit; background:#fff; color:var(--ink); }
.gi-compose-input:focus{ outline:none; border-color:var(--amber); }
.gi-compose-send{ background:var(--ink); color:#fff; border:none; width:40px; height:40px; border-radius:50%; display:grid; place-items:center; cursor:pointer; flex:none; }
.gi-tabbar{ position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:520px; background:rgba(255,255,255,.9); border-top:1px solid var(--line); display:flex; padding:6px 4px calc(6px + env(safe-area-inset-bottom)); z-index:20; backdrop-filter:blur(12px); }
.gi-tab{ flex:1; background:none; border:none; display:flex; flex-direction:column; align-items:center; gap:3px; padding:7px 0; color:var(--ink-soft); cursor:pointer; font-family:inherit; font-size:10px; font-weight:600; border-radius:10px; }
.gi-tab-active{ color:var(--amberDeep); }
`;
