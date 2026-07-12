import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const VOLUME_ICONS = { 0: "⚔️", 1: "🧠", 2: "🌐", 3: "📕", 4: "🖥️", 5: "⚡" };

export default function Home() {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
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

      const { data: bm } = await supabase
        .from("bookmarks")
        .select("*, chapters(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookmarks(bm || []);
    }
    setLoading(false);
  }

  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const totalCount = chapters.length;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const nextChapter = chapters.find((c) => !progressMap[c.id]?.completed);

  const volumes = [...new Set(chapters.map((c) => c.volume))].map((vol, idx) => {
    const chs = chapters.filter((c) => c.volume === vol);
    const done = chs.filter((c) => progressMap[c.id]?.completed).length;
    return { name: vol, icon: VOLUME_ICONS[idx % 6], total: chs.length, done, first: chs[0] };
  });

  if (loading) return <p className="loading-screen">Memuat...</p>;

  return (
    <>
      <div className="app-header">
        <div className="app-title-row">
          <div className="app-icon">📖</div>
          <div className="app-title"><h2>Apollo Academy</h2><p>Petualangan belajar coding</p></div>
        </div>
        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme}>{theme === "dark" ? "🌙" : "☀️"}</button>
          {user ? (
            <Link to="/profile">
              {user.avatar ? <img src={user.avatar} className="avatar-sm" alt={user.name} /> : <div className="avatar-sm">{user.name?.[0]}</div>}
            </Link>
          ) : (
            <Link to="/login" className="btn-login-sm">Masuk</Link>
          )}
        </div>
      </div>

      {nextChapter && (
        <div className="section">
          <div className="section-title">▶ Lanjutkan Baca</div>
          <div className="continue-card" onClick={() => navigate(`/bab/${nextChapter.number}`)}>
            <div className="continue-illust">📦</div>
            <div className="continue-info">
              <div className="eyebrow">Bab {nextChapter.number} · {nextChapter.tags?.[0]}</div>
              <h3>{nextChapter.title}</h3>
              <p>{nextChapter.volume}</p>
              <span className={`tag ${nextChapter.level.toLowerCase()}`}>{nextChapter.level}</span>{" "}
              <span className="tag time">⏱ {nextChapter.duration_minutes}m</span>
            </div>
          </div>
        </div>
      )}

      {user && (
        <>
          <div className="section">
            <div className="section-title">📈 Statistik Kamu</div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon" style={{ background: "var(--green-bg)" }}>✅</div><div className="num">{completedCount}</div><div className="label">Selesai</div><div className="sub">dari {totalCount} bab</div></div>
              <div className="stat-card"><div className="stat-icon" style={{ background: "var(--orange-bg)" }}>🏆</div><div className="num">{progressPct}%</div><div className="label">Progress</div><div className="sub">perjalanan</div></div>
              <div className="stat-card"><div className="stat-icon" style={{ background: "var(--lavender)" }}>🔖</div><div className="num">{bookmarks.length}</div><div className="label">Bookmark</div><div className="sub">ditandai</div></div>
              <div className="stat-card"><div className="stat-icon" style={{ background: "var(--mint)" }}>🔥</div><div className="num">{profile?.streak_count || 0}</div><div className="label">Streak</div><div className="sub">hari beruntun</div></div>
            </div>
          </div>

          <div className="section">
            <div className="progress-panel">
              <div className="top-row"><span>PERJALANAN</span><span>{completedCount} / {totalCount} bab</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${progressPct}%` }}></div></div>
            </div>
          </div>
        </>
      )}

      <div className="section">
        <div className="section-title">📚 Volume <Link to="/bab" className="link">Lihat semua →</Link></div>
        <div className="volume-scroller">
          {volumes.map((v) => (
            <div key={v.name} className="volume-card" onClick={() => v.first && navigate(`/bab/${v.first.number}`)}>
              <div className="volume-icon" style={{ background: "var(--mint)" }}>{v.icon}</div>
              <h4>{v.name.replace(/^Volume [IVX]+ — /, "")}</h4>
              <div className="vol-sub">{v.done}/{v.total} bab</div>
            </div>
          ))}
        </div>
      </div>

      {user && bookmarks.length > 0 && (
        <div className="section">
          <div className="section-title">🔖 Ditandai</div>
          {bookmarks.map((b) => (
            <div key={b.id} className="bookmark-item" onClick={() => navigate(`/bab/${b.chapters.number}`)}>
              <div className="bookmark-icon">📖</div>
              <div className="bookmark-info">
                <div className="bab-num">Bab {b.chapters.number}</div>
                <h4>{b.chapters.title}</h4>
                <span className={`tag ${b.chapters.level.toLowerCase()}`}>{b.chapters.level}</span>{" "}
                <span className="tag time">⏱ {b.chapters.duration_minutes}m</span>
              </div>
              <div className="chevron">›</div>
            </div>
          ))}
        </div>
      )}

      {!user && (
        <div className="section">
          <p className="empty-note">Masuk dengan Google untuk menyimpan progress baca, bookmark, dan streak harianmu.</p>
        </div>
      )}
    </>
  );
      }
