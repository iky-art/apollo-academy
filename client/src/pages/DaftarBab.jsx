import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

const LEVELS = ["Pemula", "Menengah", "Lanjutan", "Master"];

export default function DaftarBab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [bookmarkSet, setBookmarkSet] = useState(new Set());
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    const { data: chs } = await supabase.from("chapters").select("*").order("number");
    setChapters(chs || []);

    if (user) {
      const { data: progress } = await supabase.from("reading_progress").select("*").eq("user_id", user.id);
      const map = {};
      (progress || []).forEach((p) => (map[p.chapter_id] = p));
      setProgressMap(map);

      const { data: bm } = await supabase.from("bookmarks").select("chapter_id").eq("user_id", user.id);
      setBookmarkSet(new Set((bm || []).map((b) => b.chapter_id)));
    }
    setLoading(false);
  }

  async function toggleBookmark(e, chapterId) {
    e.stopPropagation();
    if (!user) return navigate("/login");

    if (bookmarkSet.has(chapterId)) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("chapter_id", chapterId);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, chapter_id: chapterId });
    }
    loadData();
  }

  const filtered =
    filter === "Semua"
      ? chapters
      : filter === "Ditandai"
      ? chapters.filter((c) => bookmarkSet.has(c.id))
      : chapters.filter((c) => c.level === filter);

  const grouped = filtered.reduce((acc, c) => {
    acc[c.volume] = acc[c.volume] || [];
    acc[c.volume].push(c);
    return acc;
  }, {});

  if (loading) return <p className="loading-screen">Memuat...</p>;

  return (
    <>
      <div className="app-header">
        <div className="app-title-row">
          <div className="app-icon">📚</div>
          <div className="app-title"><h2>Daftar Bab</h2><p>{chapters.length} bab tersedia</p></div>
        </div>
      </div>

      <div className="pill-row">
        {["Semua", "Ditandai", ...LEVELS].map((f) => (
          <button key={f} className={`pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "Ditandai" ? "🔖 Ditandai" : f}
          </button>
        ))}
      </div>

      {Object.entries(grouped).map(([volume, chs]) => (
        <div key={volume}>
          <div className="section" style={{ paddingBottom: 8 }}>
            <div className="section-title" style={{ margin: 0 }}>{volume}</div>
          </div>
          <div className="chapter-grid" style={{ marginBottom: 20 }}>
            {chs.map((c) => {
              const done = progressMap[c.id]?.completed;
              return (
                <div key={c.id} className="chapter-card" onClick={() => navigate(`/bab/${c.number}`)}>
                  <div className="chapter-illust">
                    <span className="badge-num">#{c.number}</span>
                    <span className="badge-bookmark" onClick={(e) => toggleBookmark(e, c.id)}>
                      {bookmarkSet.has(c.id) ? "🔖" : "🏷️"}
                    </span>
                    📖
                    {done && <span className="badge-status done">✓ selesai</span>}
                  </div>
                  <div className="chapter-meta">
                    <h4>{c.title}</h4>
                    <span className={`tag ${c.level.toLowerCase()}`}>{c.level}</span>{" "}
                    <span className="tag time">⏱ {c.duration_minutes}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && <p className="empty-note" style={{ padding: "0 16px" }}>Tidak ada bab untuk filter ini.</p>}
    </>
  );
}
