import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../data/api";
import type { StudentUser } from "../data/models";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../utils/auth";

const roleConfig: { role: UserRole; label: string; description: string; icon: string }[] = [
  { role: "student", label: "學生登入", description: "練習歷屆試題與主題搜題", icon: "🎓" },
  { role: "creator", label: "命題者登入", description: "建立試卷與管理題庫", icon: "✏️" },
  { role: "admin", label: "管理者登入", description: "管理使用者與系統分析", icon: "⚙️" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setCurrentStudent } = useAuth();
  const [showStudentSelect, setShowStudentSelect] = useState(false);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

  // 取得班級列表
  const classes = Array.from(new Set(students.map((s) => s.className))).sort();

  // 篩選後的學生
  const filteredStudents = selectedClass
    ? students.filter((s) => s.className === selectedClass)
    : students;

  const handleLogin = (role: UserRole) => {
    if (role === "student") {
      setShowStudentSelect(true);
    } else {
      login(role);
      navigate(`/${role}`);
    }
  };

  const handleStudentLogin = (student: StudentUser) => {
    login("student");
    setCurrentStudent(student);
    navigate("/student");
  };

  const handleQuickLogin = () => {
    // 快速以第一個學生登入
    const firstStudent = students[0];
    if (firstStudent) {
      handleStudentLogin(firstStudent);
    } else {
      login("student");
      navigate("/student");
    }
  };

  if (showStudentSelect) {
    return (
      <div className="login-grid" style={{ maxWidth: 800 }}>
        <h1>🎓 選擇學生帳號</h1>
        <p className="muted">選擇要登入的學生帳號進行測試</p>

        {/* 班級篩選 */}
        <div style={{ marginTop: 24, marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            className={`btn ${selectedClass === "" ? "" : "ghost"}`}
            style={{ padding: "8px 16px" }}
            onClick={() => setSelectedClass("")}
          >
            全部班級
          </button>
          {classes.map((cls) => (
            <button
              key={cls}
              className={`btn ${selectedClass === cls ? "" : "ghost"}`}
              style={{ padding: "8px 16px" }}
              onClick={() => setSelectedClass(cls)}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* 學生列表 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
            marginTop: 16,
          }}
        >
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="card"
              style={{
                cursor: "pointer",
                transition: "all 0.2s",
                border: "2px solid transparent",
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "transparent")}
              onClick={() => handleStudentLogin(student)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px" }}>{student.name}</h4>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{student.school}</div>
                </div>
                {student.className === "免費會員" ? (
                  <span
                    style={{
                      background: "#f3f4f6",
                      color: "#6b7280",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    免費
                  </span>
                ) : (
                  <span
                    style={{
                      background: "#fef3c7",
                      color: "#b45309",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    ⭐{student.className}
                  </span>
                )}
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "#d1fae5",
                    color: "#059669",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: 11,
                  }}
                >
                  {student.grade}
                </span>
                <span
                  style={{
                    background: "#e0e7ff",
                    color: "#4338ca",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: 11,
                  }}
                >
                  {student.region}
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af" }}>
                已完成 {student.examsTaken ?? 0} 份試卷 · 平均 {student.avgScore ?? 0}%
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn ghost" onClick={() => setShowStudentSelect(false)}>
            ← 返回
          </button>
          <button className="btn ghost" onClick={handleQuickLogin}>
            快速登入（預設帳號）
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-grid">
      <h1>🏫 良師塾-考試雲</h1>
      <p className="muted">UI 模擬登入，請選擇角色進入系統。</p>
      <div className="card-grid" style={{ marginTop: 24 }}>
        {roleConfig.map((config) => (
          <div key={config.role} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{config.icon}</div>
            <h3 style={{ margin: "0 0 8px" }}>{config.label}</h3>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>{config.description}</p>
            <button className="btn" onClick={() => handleLogin(config.role)}>
              進入
            </button>
          </div>
        ))}
      </div>
      <div className="footer-note" style={{ marginTop: 32 }}>
        <p className="muted">
          測試模式：使用模擬資料。學生登入可選擇不同帳號測試。
        </p>
      </div>
    </div>
  );
}
