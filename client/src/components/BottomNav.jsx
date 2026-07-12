import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const { pathname } = useLocation();

  const items = [
    { to: "/", icon: "🏠", label: "Beranda", match: (p) => p === "/" },
    { to: "/bab", icon: "📚", label: "Pustaka", match: (p) => p.startsWith("/bab") },
    { to: "/profile", icon: "👤", label: "Profil", match: (p) => p.startsWith("/profile") || p.startsWith("/admin") },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className={`nav-item ${item.match(pathname) ? "active" : ""}`}>
          <span className="nav-icon-wrap">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

