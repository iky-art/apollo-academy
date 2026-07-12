# 📖 Apollo Academy — Koding Manga

Aplikasi belajar coding dari nol sampai advanced, dikemas sebagai manga interaktif. React (Vite) + **Supabase** (Auth Google + Database Postgres). Ada progress belajar, bookmark, streak harian, dan lencana pencapaian.

**Power By Team Apollo AI Studio**

## Struktur

```
manga-reader-app/
├── supabase-schema.sql          # Jalankan pertama di Supabase SQL Editor
├── supabase-seed-chapters.sql   # Jalankan kedua — isi 20 bab awal
└── client/
    └── src/
        ├── lib/supabaseClient.js
        ├── context/         # AuthContext (Supabase Auth + role admin), ThemeContext
        ├── components/      # BottomNav, ChapterMarkdown, ProtectedRoute, AdminRoute
        └── pages/
            ├── Home.jsx        → Beranda (lanjutkan baca, statistik, progress, volume, bookmark)
            ├── DaftarBab.jsx   → Grid semua bab + filter level/bookmark
            ├── DetailBab.jsx   → Baca 1 bab penuh + tandai selesai + navigasi prev/next
            ├── Profile.jsx     → Avatar, level, streak, 6 lencana
            ├── Login.jsx       → Login Google
            └── Admin.jsx       → Kelola bab (khusus role admin)
```

## Fitur

- 🔐 Login Google (Supabase Auth) — 3 email admin otomatis dapat akses panel `/admin`
- 📚 20 Bab coding (Python dasar → Web → React → SQL/API → DSA/System Design), isi lengkap gaya narasi manga
- 🔖 Bookmark bab, ✅ tandai selesai, 🔥 streak harian, 🏆 6 lencana pencapaian
- 🌙 Dark/light mode tersimpan ke profil, 📱 UI mobile-first dengan bottom navigation
- ⚙️ Panel admin untuk tambah/hapus bab baru kapan saja tanpa deploy ulang

## Setup

### 1. Buat tabel + isi data awal di Supabase
1. Buka **SQL Editor** di Supabase Dashboard → jalankan `supabase-schema.sql`
2. Lanjutkan jalankan `supabase-seed-chapters.sql` (mengisi 20 bab pertama)

### 2. Aktifkan Login Google
1. **Authentication → Providers → Google** → aktifkan, isi Client ID & Secret dari Google Cloud Console
2. Authorized redirect URI di Google Console: `https://qoxhfnlkqqejgpotzxxl.supabase.co/auth/v1/callback`
3. **Authentication → URL Configuration** → Site URL `http://localhost:5173`, Redirect URLs `http://localhost:5173/profile`

### 3. Jalankan aplikasi
```bash
cd client
cp .env.example .env      # sudah terisi URL & anon key Supabase
npm install
npm run dev
```

### 4. Admin
Login dengan salah satu dari 3 email admin yang sudah didaftarkan di `supabase-schema.sql` (fungsi `is_admin_email`) → menu Admin otomatis muncul di halaman Profil → buka `/admin` untuk tambah bab baru.

## Deploy
- **Frontend** → Vercel/Netlify, root directory `client`, env var `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`
- **Database & Auth** → sudah live di Supabase
- Update **Site URL** & **Redirect URLs** di Supabase ke domain production setelah deploy

## Push ke GitHub
```bash
cd manga-reader-app
git init
git add .
git commit -m "Initial commit: Apollo Academy — Koding Manga"
git branch -M main
git remote add origin https://github.com/USERNAME/manga-reader-app.git
git push -u origin main
```

> `.env` tidak pernah ikut ke-push (`.gitignore`). Anon key Supabase aman di frontend (dibatasi RLS) — tapi `service_role key` wajib tetap rahasia di server jika suatu saat dipakai.

---
Power By **Team Apollo AI Studio**
