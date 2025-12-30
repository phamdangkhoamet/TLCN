import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../lib/api";

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function PartnerItem({ partner, isActive, onSelect }) {
  const last = partner?.lastMessage;
  const preview = last?.content?.slice(0, 40) || "Bắt đầu trò chuyện";
  return (
    <button
      onClick={() => onSelect?.(partner)}
      className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition shadow-sm ${
        isActive ? "bg-purple-50 border-purple-200" : "bg-white border-gray-100 hover:border-purple-100"
      }`}
    >
      <img
        src={partner?.user?.avatar || "https://api.dicebear.com/7.x/miniavs/svg?seed=chat"}
        alt={partner?.user?.name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-gray-900 truncate">{partner?.user?.name || "Ẩn danh"}</div>
          {last?.createdAt && (
            <span className="text-xs text-gray-500 shrink-0">{formatTime(last.createdAt)}</span>
          )}
        </div>
        <p className="text-xs text-gray-600 truncate">{preview}</p>
      </div>
      {partner?.unread > 0 && (
        <span className="inline-flex items-center justify-center h-5 min-w-[1.2rem] text-[11px] font-semibold px-1 bg-pink-500 text-white rounded-full">
          {partner.unread}
        </span>
      )}
    </button>
  );
}

function MessageBubble({ message, meId }) {
  const isMine = String(message.senderId) === String(meId);
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow ${
          isMine ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        <div>{message.content}</div>
        <div className={`text-[11px] mt-1 ${isMine ? "text-purple-100" : "text-gray-500"}`}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [partners, setPartners] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [me, setMe] = useState(null);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    api.auth
      .me()
      .then((u) => setMe(u))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadPartners();
  }, []);

  // Poll hội thoại hiện tại để nhận tin nhắn đến (giả lập realtime 2 chiều)
  useEffect(() => {
    if (!selected?.user?._id) return undefined;

    const timer = setInterval(() => {
      loadMessages(selected.user._id, { silent: true });
    }, 5000);

    return () => clearInterval(timer);
  }, [selected?.user?._id]);

  async function loadPartners() {
    try {
      setLoadingPartners(true);
      const res = await api.chats.listPartners();
      const list = Array.isArray(res) ? res : res.items || [];
      setPartners(list);
      if (!selected && list.length) setSelected(list[0]);
    } catch (err) {
      console.error(err);
      alert(err.message || "Không tải được danh sách chat.");
    } finally {
      setLoadingPartners(false);
    }
  }

  async function loadMessages(userId, { silent = false } = {}) {
    if (!userId) return;
    try {
      if (!silent) setLoadingMessages(true);
      const res = await api.chats.getConversation(userId);
      setSelected((prev) => ({ ...prev, user: res.user }));
      setMessages(res.messages || []);
      // cập nhật lại unread trong partners
      setPartners((prev) =>
        prev.map((p) => (String(p.user._id) === String(userId) ? { ...p, unread: 0 } : p))
      );
    } catch (err) {
      console.error(err);
      if (!silent) {
        alert(err.message || "Không tải được tin nhắn.");
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !selected?.user?._id) return;
    try {
      setSending(true);
      const res = await api.chats.sendMessage(selected.user._id, { content: text.trim() });
      const msg = res.message || res;
      setMessages((prev) => [...prev, msg]);
      setText("");
      setPartners((prev) =>
        prev.map((p) =>
          String(p.user._id) === String(selected.user._id)
            ? { ...p, lastMessage: msg, unread: 0 }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Gửi tin nhắn thất bại.");
    } finally {
      setSending(false);
    }
  }

  const meId = me?._id || me?.id;

  // Search users to start chat
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await api.chats.searchUsers(q);
        const list = Array.isArray(res) ? res : res.items || [];
        setSearchResults(list);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  async function startChat(user) {
    setSelected({ user, lastMessage: null, unread: 0 });
    setMessages([]);
    await loadMessages(user._id);
  }

  const sortedPartners = useMemo(() => partners, [partners]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white border border-purple-100 rounded-3xl shadow-sm flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-1/3 border-b lg:border-b-0 lg:border-r border-purple-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">Tin nhắn</h1>
                <button
                  onClick={loadPartners}
                  className="text-sm text-purple-600 hover:underline"
                  disabled={loadingPartners}
                >
                  {loadingPartners ? "Đang tải..." : "Làm mới"}
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm người để chat"
                  className="w-full rounded-2xl border border-purple-100 bg-purple-50/40 px-4 py-2 text-sm focus:border-purple-400 focus:ring-pink-300"
                />
                {searchLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">...</span>}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-purple-100 rounded-xl shadow">
                    {searchResults.map((u) => (
                      <button
                        key={u._id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 flex items-center gap-2"
                        onClick={() => startChat(u)}
                      >
                        <img
                          src={u.avatar || "https://api.dicebear.com/7.x/miniavs/svg?seed=chat"}
                          alt={u.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {sortedPartners.length === 0 && !loadingPartners ? (
                  <p className="text-sm text-gray-500">Chưa có cuộc trò chuyện nào.</p>
                ) : (
                  sortedPartners.map((p) => (
                    <PartnerItem
                      key={p.user._id}
                      partner={p}
                      isActive={selected?.user?._id === p.user._id}
                      onSelect={(pt) => {
                        setSelected(pt);
                        loadMessages(pt.user._id);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Main chat */}
            <div className="flex-1 p-4 flex flex-col">
              {selected ? (
                <>
                  <div className="flex items-center gap-3 border-b border-purple-50 pb-3 mb-3">
                    <img
                      src={selected.user?.avatar || "https://api.dicebear.com/7.x/miniavs/svg?seed=chat"}
                      alt={selected.user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{selected.user?.name}</div>
                      <div className="text-xs text-gray-500">{selected.user?.email}</div>
                    </div>
                  </div>

                  <div className="flex-1 bg-purple-50/40 rounded-2xl p-3 space-y-2 overflow-y-auto">
                    {loadingMessages ? (
                      <p className="text-sm text-gray-500">Đang tải...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-sm text-gray-500">Bắt đầu cuộc trò chuyện đầu tiên.</p>
                    ) : (
                      messages.map((m) => <MessageBubble key={m._id} message={m} meId={meId} />)
                    )}
                  </div>

                  <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 rounded-2xl border border-purple-100 bg-white px-4 py-2 text-sm focus:border-purple-400 focus:ring-pink-300"
                    />
                    <button
                      type="submit"
                      disabled={sending || !text.trim()}
                      className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold shadow disabled:opacity-60"
                    >
                      {sending ? "Đang gửi..." : "Gửi"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Chọn một cuộc trò chuyện để bắt đầu.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}