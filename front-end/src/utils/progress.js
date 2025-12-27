// src/utils/progress.js
const KEY_BASE = "novel_progress_v2";

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("sessionUser") || "null");
  } catch {
    return null;
  }
}
function currentUserId() {
  const u = currentUser();
  return (u && (u._id || u.id)) || "guest";
}
function key() {
  return `${KEY_BASE}_${currentUserId()}`;
}

function readObj() {
  try {
    return JSON.parse(localStorage.getItem(key()) || "{}");
  } catch {
    return {};
  }
}
function writeObj(obj) {
  localStorage.setItem(key(), JSON.stringify(obj || {}));
  // phát event để Library / Reader có thể cập nhật ngay
  window.dispatchEvent(new StorageEvent("storage", { key: key(), newValue: localStorage.getItem(key()) }));
}

/** Lấy chương hiện tại đã đọc của 1 truyện */
export function getProgress(novelId) {
  const obj = readObj();
  return Number(obj[String(novelId)]) || 0;
}

/** Lấy toàn bộ map { novelId: lastChapter } */
export function getAllProgress() {
  return readObj();
}

/** Ghi chương đã đọc của 1 truyện */
export function setProgress(novelId, chapterNo) {
  const obj = readObj();
  obj[String(novelId)] = Number(chapterNo);
  writeObj(obj);
  return true;
}

/** Subscribe thay đổi tiến độ (giữa các tab). Trả về unsubscribe */
export function subscribeProgress(cb) {
  const handler = (e) => {
    if (!e || e.key === null || e.key === key()) cb(readObj());
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
