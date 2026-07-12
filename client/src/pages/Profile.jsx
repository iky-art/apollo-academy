import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabaseClient";

const BADGES = [
  { key: "petualang", emoji: "⚔️", name: "Petualang", need: 1, type: "completed", sub: "1 bab" },
  { key: "kutubuku", emoji: "📚", name: "Kutu Buku", need: 5, type: "completed", sub: "5 bab" },
  { key: "fokus", emoji: "🎯", name: "Fokus", need: 10, type: "completed", sub: "10 bab" },
  { key: "ninja", emoji: "⚡", name: "Ninja", need: 15, type: "completed", sub: "15 bab" },
  { key: "kolektor", emoji: "🏷️", name: "Kolektor", need: 3, type: "bookmark", sub: "3 bookmark" },
  { key: "master", emoji: "👑", name: "Master", need: 20, type: "completed", sub: "Selesai" },
];

export default function Profile() {
  const { user, profile, isAdmin, logout, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [completedCount, setCompletedCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  async function loadStats() {
    const { count: total } = await supabase.from("chapters").select("*", { count: "exact", head: true });
    setTotalChapters(total || 0);

    const { count: completed } = await supabase
      .from("reading_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true);
    setCompletedCount(completed || 0);

    const { count: bookmarks } = await supabase
      .from("bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setBookmarkCount(bookmarks || 0);
  }

  async function handleToggleTheme() {
    toggleTheme();
    const newTheme = theme === "dark" ? "light" : "dark";
    await supabase.from("profiles").update({ theme: newTheme }).eq("id", user.id);
    refreshProfile();
  }

  if (!user) return null;

  const progressPct = totalChapters ? Math.round((completedCount / totalChapters) * 100) : 0;

  return (
    <>
      <div className="app-header">
        <div className="app-title-row">
          <div className="app-icon">📖</div>
          <div className="app-title"><h2>Apollo Academy</h2><p>Petualangan belajar coding</p></div>
        </div>
        <div className="streak-badge">🔥 {profile?.streak_count || 0}</div>
      </div>

      <div className="profile-hero">
        {user.avatar ? <img src={user.avatar} className="profile-avatar" alt={user.name} /> : <div className="profile-avatar">🌱</div>}
        <h3>{user.name}</h3>
        <p className="email">{user.email}</p>
        {isAdmin && <div className="admin-badge">⚙️ ADMIN</div>}
        <div className="lvl">Level perjalanan: {progressPct}%</div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progressPct}%` }}></div></div>

        <div className="pref-row">
          <span>🌙 Mode Tampilan</span>
          <label className="switch">
            <input type="checkbox" checked={theme === "light"} onChange={handleToggleTheme} />
            <span className="slider" />
          </label>
          <span>{theme === "dark" ? "Gelap" : "Terang"}</span>
        </div>
      </div>

      <div className="section">
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon" style={{ background: "var(--orange-bg)" }}>🏆</div><div className="num">{completedCount}</div><div className="label">Bab selesai</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: "var(--mint)" }}>🔥</div><div className="num">{profile?.streak_count || 0}</div><div className="label">Streak hari</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: "var(--lavender)" }}>🔖</div><div className="num">{bookmarkCount}</div><div className="label">Ditandai</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: "var(--pink-bg)" }}>📖</div><div className="num">{totalChapters}</div><div className="label">Total bab</div></div>
        </div>
      </div>

      <div className="section"><div className="section-title">🏆 Lencana</div></div>
      <div className="badge-grid">
        {BADGES.map((b) => {
          const value = b.type === "completed" ? completedCount : bookmarkCount;
          const unlocked = value >= b.need;
          return (
            <div key={b.key} className={`badge-card ${unlocked ? "" : "locked"}`}>
              <div className="badge-emoji">{b.emoji}</div>
              <div className="bname">{b.name}</div>
              <div className="bsub">{b.sub}</div>
            </div>
          );
        })}
      </div>

      <button className="btn-logout" onClick={logout}>Keluar</button>
    </>
  );
}
