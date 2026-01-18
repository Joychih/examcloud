import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import RoleNav from "./RoleNav";
import PaymentModal from "./PaymentModal";
import logo from "../assets/logo.jpg";

export default function AppShell() {
  const { role, setPlan, logout, currentStudent } = useAuth();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const roleLabel = {
    student: "學生",
    creator: "命題者",
    admin: "管理者",
  }[role ?? "student"];

  if (!role) {
    return <Outlet />;
  }

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
              前端 UI 規格
            </div>
          </div>
        </div>
        <RoleNav role={role} />
        <div className="header-actions">
          {role === "student" && currentStudent ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{currentStudent.name}</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  {currentStudent.grade} · {currentStudent.school}
                </span>
              </div>
              {currentStudent.className === "免費會員" ? (
                <>
                  <span
                    style={{
                      background: "#f3f4f6",
                      color: "#6b7280",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    免費會員
                  </span>
                  <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => setShowPayment(true)}>
                    升級VIP
                  </button>
                </>
              ) : (
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#b45309",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  ⭐ {currentStudent.className}
                </span>
              )}
            </>
          ) : (
            <span className="role-pill">{roleLabel}</span>
          )}
          <button
            className="btn secondary"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            登出
          </button>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
      {role === "student" && (
        <PaymentModal
          open={showPayment}
          onClose={() => setShowPayment(false)}
          onPaid={() => {
            setPlan("vip");
            setShowPayment(false);
          }}
        />
      )}
    </div>
  );
}
