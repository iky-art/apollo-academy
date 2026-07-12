import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [status, setStatus] = useState("");

  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [volume, setVolume] = useState("");
  const [level, setLevel] = useState("Pemula");
  const [tags, setTags] = useState("");
  const [duration, setDuration] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    loadChapters();
  }, []);

  async function loadChapters() {
    const { data } = await supabase.from("chapters").select("*").order("number");
    setChapters(data || []);
  }

  async function handleAddChapter(e) {
    e.preventDefault();
    setStatus("Menyimpan bab...");

    const { error } = await supabase.from("chapters").insert({
      number: Number(number),
      title,
      volume,
      level,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      duration_minutes: Number(duration) || 5,
      content,
    });

    if (error) {
      setStatus(`❌ Gagal: ${error.message}`);
      return;
    }

    setStatus("✅ Bab berhasil ditambahkan");
    setNumber(""); setTitle(""); setVolume(""); setTags(""); setDuration(""); setContent("");
    loadChapters();
  }

  async function handleDelete(id) {
    if (!confirm("Hapus bab ini?")) return;
    await supabase.from("chapters").delete().eq("id", id);
    loadChapters();
  }

  return (
    <div className="admin-page">
      <h1>⚙️ Panel Admin</h1>
      <p className="admin-sub">Masuk sebagai <strong>{user?.email}</strong></p>

      {status && <div className="admin-status">{status}</div>}

      <section className="admin-card">
        <h2>Tambah Bab Baru</h2>
        <form onSubmit={handleAddChapter} className="admin-form">
          <input type="number" placeholder="Nomor bab, mis: 21" value={number} onChange={(e) => setNumber(e.target.value)} required />
          <input placeholder="Judul bab" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input placeholder="Volume, mis: Volume VII — Dunia Baru" value={volume} onChange={(e) => setVolume(e.target.value)} required />
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option>Pemula</option><option>Menengah</option><option>Lanjutan</option><option>Master</option>
          </select>
          <input placeholder="Tag (pisah koma), mis: Python, Dasar" value={tags} onChange={(e) => setTags(e.target.value)} />
          <input type="number" placeholder="Durasi (menit)" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <textarea placeholder="Konten markdown bab (panel, kode, rangkuman)..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
          <button type="submit">Simpan Bab</button>
        </form>
      </section>

      <section className="admin-card">
        <h2>Daftar Bab ({chapters.length})</h2>
        <ul className="admin-list">
          {chapters.map((c) => (
            <li key={c.id}>
              <span>#{c.number} — {c.title}</span>
              <button className="btn-delete" onClick={() => handleDelete(c.id)}>Hapus</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
