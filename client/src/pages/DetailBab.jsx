import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import ChapterMarkdown from "../components/ChapterMarkdown";

export default function DetailBab() {
  const { number } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [chapter, setChapter] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [reading, setReading] = useState(false);
  const [totalChapters, setTotalChapters] = useState(0);

  useEffect(() => {
    loadChapter();
  }, [number, user]);

  async function loadChapter() {
    setReading(false);
    const { data: ch } = await supabase.from("chapters").select("*").eq("number", Number(number)).single();
    setChapter(ch);

    const { count } = await supabase.from("chapters").select("*", { count: "exact", head: true });
    setTotalChapters(count || 0);

    if (user && ch) {
      const { data: bm } = await supabase.from("bookmarks").select("id").eq("user_id", user.id).eq("chapter_id", ch.id).maybeSingle();
      setIsBookmarked(!!bm);

      const { data: prog } = await supabase.from("reading_progress").select("completed").eq("user_id", user.id).eq("chapter_id", ch.id).maybeSingle();
      setIsCompleted(!!prog?.completed);
    }
  }

  async function toggleBookmark() {
    if (!user) return navigate("/login");
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("chapter_id", chapter.id);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, chapter_id: chapter.id });
    }
    setIsBookmarked(!isBookmarked);
  }

  async function markAsRead() {
    if (!user) return navigate("/login");
    setReading(true);

    await supabase.from("reading_progress").upsert(
      { user_id: user.id, chapter_id: chapter.id, completed: true, completed_at: new Date().toISOString() },
      { onConflict: "user_id,chapter_id" }
    );
    setIsCompleted(true);
    await updateStreak();
    refreshProfile();
  }

  async function updateStreak() {
    const { data: profile } = await supabase.from("profiles").select("streak_count,last_active_date").eq("id", user.id).single();
    const today = new Date().toISOString().slice(0, 10);
    if (profile?.last_active_date === today) return; // sudah dihitung hari ini

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = profile?.last_active_date === yesterday ? (profile.streak_count || 0) + 1 : 1;

    await supabase.from("profiles").update({ streak_count: newStreak, last_active_date: today }).eq("id", user.id);
  }

  function goToChapter(num) {
    if (num < 1 || num > totalChapters) return;
    navigate(`/bab/${num}`);
  }

  if (!chapter) return <p className="loading-screen">Memuat bab...</p>;

  return (
    <>
      <div className="detail-topbar">
        <button onClick={() => navigate(-1)}>←</button>
        <h2 style={{ fontSize: 16 }}>Detail Bab</h2>
        <button onClick={toggleBookmark}>{isBookmarked ? "🔖" : "🏷️"}</button>
      </div>

      <div className="detail-illust">
        <span className="badge-top-left">BAB {chapter.number}</span>
        {isCompleted && <span className="badge-top-right">✓ Selesai</span>}
        📖
      </div>

      <div className="detail-body">
        <div className="eyebrow">{chapter.volume}</div>
        <h2>{chapter.title}</h2>
        <div className="tag-row">
          <span className={`tag ${chapter.level.toLowerCase()}`}>⭐ {chapter.level}</span>
          {chapter.tags?.map((t) => <span key={t} className="tag neutral">{t}</span>)}
          <span className="tag time">⏱ {chapter.duration_minutes} menit</span>
        </div>

        <button className="btn-primary" onClick={markAsRead} disabled={reading}>
          {isCompleted ? "✓ Sudah Dibaca" : "▶ Tandai Sudah Dibaca"}
        </button>

        <ChapterMarkdown content={chapter.content} />

        <div style={{ display: "flex", gap: 10, margin: "20px 0" }}>
          <button className="btn-secondary" onClick={() => goToChapter(chapter.number - 1)} disabled={chapter.number <= 1}>‹ Bab Sebelumnya</button>
          <button className="btn-secondary" onClick={() => goToChapter(chapter.number + 1)} disabled={chapter.number >= totalChapters}>Bab Selanjutnya ›</button>
        </div>
      </div>
    </>
  );
}
