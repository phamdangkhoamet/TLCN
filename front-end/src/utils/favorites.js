// src/utils/favorites.js
import { API_BASE, api } from "../lib/api";

const KEY_BASE = "dkstory_favorites_v1";
const KEY_MAP_BASE = "dkstory_favmap_v1"; // map novelId(string) -> favoriteId(string)

/* ===== helpers ===== */
function currentUser() {
  try { return JSON.parse(localStorage.getItem("sessionUser") || "null"); }
  catch { return null; }
}
function currentUserId() {
  const u = currentUser();
  return (u && (u._id || u.id)) || "guest";   // "guest" để không crash
}
function favKey() { return `${KEY_BASE}_${currentUserId()}`; }
function favMapKey() { return `${KEY_MAP_BASE}_${currentUserId()}`; }

function readIds() {
  try { const a = JSON.parse(localStorage.getItem(favKey()) || "[]"); return a.map(String); }
  catch { return []; }
}
function writeIds(arr) { localStorage.setItem(favKey(), JSON.stringify(arr.map(String))); }

function readMap() { try { return JSON.parse(localStorage.getItem(favMapKey()) || "{}"); } catch { return {}; } }
function writeMap(obj) { localStorage.setItem(favMapKey(), JSON.stringify(obj || {})); }

const getToken = () => api?.auth?.getToken?.() || localStorage.getItem("authToken") || "";

async function authedFetch(path, init = {}) {
  const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  const tk = getToken();
  if (tk) headers.Authorization = `Bearer ${tk}`;
  const url = new URL(path, API_BASE || window.location.origin);
  const res = await fetch(url.toString(), { ...init, headers });
  // nếu server trả 404/400… thì không để crash UI
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return null;
}
const pickArray = (res) => Array.isArray(res) ? res : (res?.items || res?.data || []);

/* ===== public API (giữ nguyên tên) ===== */
export function getFavoriteIds() { return readIds(); }
export function isFavorite(bookId) {
  const id = String(bookId);
  return readIds().includes(id);
}

/** Gọi 1 lần khi vào app/page: build map novelId->favoriteId (để xoá theo favoriteId khi server yêu cầu) */
export async function ensureFavoriteMapLoaded() {
  const uid = currentUserId();
  const base = API_BASE || window.location.origin;

  try {
    // Thử GET /api/favorites (auth) hoặc /api/favorites?userId=
    let arr = [];
    try {
      const r1 = await authedFetch("/api/favorites", { method: "GET" });
      arr = pickArray(r1);
    } catch {
      const u = new URL("/api/favorites", base);
      u.searchParams.set("userId", uid);
      const r = await fetch(u.toString());
      if (r.ok) arr = pickArray(await r.json());
    }

    if (!arr || !arr.length) return;

    const m = readMap();
    for (const it of arr) {
      const favId = String(it?._id || it?.id || "");
      const nId =
        String(
          it?.novelId ??
          it?.novelID ??
          it?.novel?._id ??
          it?.novel?.id ??
          ""
        );
      if (favId && nId) m[nId] = favId;
    }
    writeMap(m);
  } catch {
    // im lặng để không phá UI
  }
}

export async function addFavorite(bookId) {
  const id = String(bookId);

  // local optimistic
  const set = new Set(readIds());
  if (!set.has(id)) { set.add(id); writeIds([...set]); }

  const uid = currentUserId();
  const base = API_BASE || window.location.origin;

  // server sync (có cũng tốt, không có vẫn chạy)
  try {
    // 1) POST /api/favorites  { novelId, userId }
    let created = null;
    try {
      created = await authedFetch("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ novelId: id, userId: uid }),
      });
    } catch {
      // 2) POST /api/favorites/toggle { novelId, userId }
      created = await authedFetch("/api/favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ novelId: id, userId: uid }),
      });
    }

    const favId = String(
      created?._id || created?.id || created?.favoriteId || created?.item?._id || created?.item?.id || ""
    );
    if (favId) {
      const m = readMap();
      m[id] = favId;
      writeMap(m);
    }
  } catch {
    // bỏ qua
  }
  return true;
}

export async function removeFavorite(bookId) {
  const id = String(bookId);
  // local optimistic
  writeIds(readIds().filter(x => x !== id));

  const uid = currentUserId();
  const base = API_BASE || window.location.origin;

  const m = readMap();
  const favId = m[id];

  // thử nhiều endpoint khác nhau để hợp với server bạn
  try {
    // 1) DELETE /api/favorites/:favoriteId?userId=
    if (favId) {
      const p = new URL(`/api/favorites/${favId}`, base);
      p.searchParams.set("userId", uid);
      const tk = getToken();
      const headers = { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) };
      const r = await fetch(p.toString(), { method: "DELETE", headers });
      if (r.ok) { delete m[id]; writeMap(m); return true; }
    }

    // 2) DELETE /api/favorites/by-novel/:novelId?userId=
    {
      const p = new URL(`/api/favorites/by-novel/${id}`, base);
      p.searchParams.set("userId", uid);
      const tk = getToken();
      const headers = { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) };
      const r = await fetch(p.toString(), { method: "DELETE", headers });
      if (r.ok) return true;
    }

    // 3) DELETE /api/favorites?novelId=&userId=
    {
      const p = new URL(`/api/favorites`, base);
      p.searchParams.set("novelId", id);
      p.searchParams.set("userId", uid);
      const tk = getToken();
      const headers = { "Content-Type": "application/json", ...(tk ? { Authorization: `Bearer ${tk}` } : {}) };
      const r = await fetch(p.toString(), { method: "DELETE", headers });
      if (r.ok) return true;
    }

    // 4) POST /api/favorites/remove
    try {
      await authedFetch("/api/favorites/remove", {
        method: "POST",
        body: JSON.stringify({ novelId: id, userId: uid }),
      });
      return true;
    } catch {}

    // 5) POST /api/favorites/toggle { action:"remove" }
    try {
      await authedFetch("/api/favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ novelId: id, action: "remove", userId: uid }),
      });
      return true;
    } catch {}
  } catch {
    // im lặng
  }

  return true; // coi như đã xoá local
}

export async function toggleFavorite(bookId) {
  const id = String(bookId);
  if (isFavorite(id)) {
    await removeFavorite(id);
    return false;
  } else {
    await addFavorite(id);
    return true;
  }
}
