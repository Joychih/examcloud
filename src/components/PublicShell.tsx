import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.jpg";

export default function PublicShell() {
  const { role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">
          <div className="logo-badge">
            <img src={logo} alt="良師塾" />
          </div>
          <div>
            <div>良師塾-考試雲</div>
            <div className="muted" style={{ fontSize: 12 }}>
              公開試題
            </div>
          </div>
        </div>
        <div className="header-actions">
          {role ? (
            <button className="btn ghost" onClick={() => navigate("/")}>
              回到首頁
            </button>
          ) : (
            <button className="btn ghost" onClick={() => navigate("/login")}>
              登入
            </button>
          )}
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
