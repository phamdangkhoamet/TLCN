// src/utils/library.js
const KEY_BASE = "dkstory_library_ids_v2";

/* ===== user-scoped key ===== */
function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("sessionUser") || "null");
  } catch {
    return null;
  }
}
function currentUserId() {
  const u = currentUser();
  // Cho phép bạn đổi cách lấy userId khác nếu muốn
  return (u && (u._id || u.id)) || "guest";
}
function key() {
  return `${KEY_BASE}_${currentUserId()}`;
}

/* ===== storage ===== */
function readIds() {
  try {
    const raw = localStorage.getItem(key());
    return raw ? JSON.parse(raw).map(String) : [];
  } catch {
    return [];
  }
}
function writeIds(arr) {
  localStorage.setItem(key(), JSON.stringify([...new Set(arr.map(String))]));
  // phát event tự đồng bộ UI (trong cùng tab)
  window.dispatchEvent(new StorageEvent("storage", { key: key(), newValue: localStorage.getItem(key()) }));
}

/* ===== public API ===== */
export function getLibraryIds() {
  return readIds();
}

export function inLibrary(novelId) {
  return readIds().includes(String(novelId));
}

export function addToLibrary(novelId) {
  const id = String(novelId);
  const ids = readIds();
  if (!ids.includes(id)) {
    ids.push(id);
    writeIds(ids);
  }
  return true;
}

export function removeFromLibrary(novelId) {
  const id = String(novelId);
  const ids = readIds().filter((x) => x !== id);
  writeIds(ids);
  return true;
}

export function toggleInLibrary(novelId) {
  const id = String(novelId);
  if (inLibrary(id)) {
    removeFromLibrary(id);
    return false;
  } else {
    addToLibrary(id);
    return true;
  }
}

/**
 * Subscribe thay đổi thư viện (kể cả khi tab khác thay đổi).
 * Trả về hàm unsubscribe.
 */
export function subscribeLibrary(cb) {
  const handler = (e) => {
    if (!e || e.key === null || e.key === key()) cb(getLibraryIds());
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
