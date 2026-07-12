import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user, loading, loginWithGoogle } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/profile" replace />;

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="logo-big">📖</div>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Masuk ke Apollo Academy</h1>
        <p>Simpan progress belajarmu, kumpulkan lencana, dan jaga streak harianmu.</p>

        <button className="btn-google" onClick={loginWithGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6 29.5 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.6 35.1 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.8 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.5 5.5C40.9 36.6 44 30.8 44 24c0-1.3-.1-2.7-.4-3.5z"/>
          </svg>
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
}
