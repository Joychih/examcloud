import { useEffect, useState } from "react";
import { createAnnouncement, deleteAnnouncement, getAnnouncements, getStudents } from "../data/api";
import type { Announcement, StudentUser } from "../data/models";

const gradeOptions = ["", "高一", "高二", "高三"];
const regionOptions = ["", "基北區", "桃連區", "竹苗區", "中投區", "彰化區", "雲林區", "嘉義區", "台南區", "高雄區"];
const typeOptions = [
  { value: "info", label: "一般通知", icon: "ℹ️" },
  { value: "new", label: "新功能/題目", icon: "🆕" },
  { value: "promo", label: "優惠促銷", icon: "🎁" },
  { value: "important", label: "重要公告", icon: "⚠️" },
];

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "info" as Announcement["type"],
    targetGrades: [] as string[],
    targetClasses: [] as string[],
    targetRegions: [] as string[],
  });

  useEffect(() => {
    Promise.all([getAnnouncements(), getStudents()]).then(([annData, studentData]) => {
      setAnnouncements(annData);
      setStudents(studentData);
    });
  }, []);

  // 取得所有班級列表
  const classList = [...new Set(students.map((s) => s.className))].sort();

  // 計算目標人數
  const targetCount = students.filter((s) => {
    if (form.targetGrades.length > 0 && !form.targetGrades.includes(s.grade)) return false;
    if (form.targetClasses.length > 0 && !form.targetClasses.includes(s.className)) return false;
    if (form.targetRegions.length > 0 && !form.targetRegions.includes(s.region)) return false;
    return true;
  }).length;

  const handleCreate = async () => {
    // 驗證必填欄位
    if (!form.title.trim()) {
      setFormError("⚠️ 請填寫公告標題");
      return;
    }
    if (!form.content.trim()) {
      setFormError("⚠️ 請填寫公告內容");
      return;
    }
    
    setFormError("");
    const created = await createAnnouncement(form);
    setAnnouncements([created, ...announcements]);
    setForm({
      title: "",
      content: "",
      type: "info",
      targetGrades: [],
      targetClasses: [],
      targetRegions: [],
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此公告嗎？")) return;
    await deleteAnnouncement(id);
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const toggleArrayItem = (
    arr: string[],
    item: string,
    setter: (val: string[]) => void
  ) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const typeStyles: Record<string, { bg: string; border: string }> = {
    new: { bg: "#ecfdf5", border: "#10b981" },
    promo: { bg: "#fef3c7", border: "#f59e0b" },
    important: { bg: "#fee2e2", border: "#ef4444" },
    info: { bg: "#eff6ff", border: "#3b82f6" },
  };

  return (
    <div className="stack">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="page-title">公告管理</h2>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "取消" : "+ 發布新公告"}
        </button>
      </div>

      {/* 發布公告表單 */}
      {showForm && (
        <div className="card" style={{ background: "#fffbeb", border: "2px solid #fbbf24" }}>
          <h3 style={{ marginBottom: 16 }}>📢 發布新公告</h3>
          <div className="form-grid">
            <label>公告類型</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: opt.value as Announcement["type"] })}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: form.type === opt.value ? "2px solid #059669" : "1px solid #d1d5db",
                    background: form.type === opt.value ? "#ecfdf5" : "#fff",
                    cursor: "pointer",
                    fontWeight: form.type === opt.value ? 600 : 400,
                  }}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>

            <label>
              標題 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                setFormError("");
              }}
              placeholder="例：🎉 新題目上線！113學年度學測完整解析"
              style={{
                borderColor: formError && !form.title.trim() ? "#ef4444" : undefined,
              }}
            />

            <label>
              內容 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              rows={3}
              value={form.content}
              style={{
                borderColor: formError && !form.content.trim() ? "#ef4444" : undefined,
              }}
              onChange={(e) => {
                setForm({ ...form, content: e.target.value });
                setFormError("");
              }}
              placeholder="公告詳細內容..."
            />

            <label style={{ marginTop: 12, fontWeight: 600, fontSize: 14, color: "#374151" }}>
              📌 發送對象篩選（不選 = 全部）
            </label>

            <label>年級</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {gradeOptions.filter(Boolean).map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() =>
                    toggleArrayItem(form.targetGrades, grade, (val) =>
                      setForm({ ...form, targetGrades: val })
                    )
                  }
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: form.targetGrades.includes(grade)
                      ? "2px solid #3b82f6"
                      : "1px solid #d1d5db",
                    background: form.targetGrades.includes(grade) ? "#dbeafe" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  {grade}
                </button>
              ))}
              {form.targetGrades.length > 0 && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, targetGrades: [] })}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "1px solid #ef4444",
                    background: "#fff",
                    color: "#ef4444",
                    cursor: "pointer",
                  }}
                >
                  清除
                </button>
              )}
            </div>

            <label>班級</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {classList.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() =>
                    toggleArrayItem(form.targetClasses, cls, (val) =>
                      setForm({ ...form, targetClasses: val })
                    )
                  }
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: form.targetClasses.includes(cls)
                      ? "2px solid #8b5cf6"
                      : "1px solid #d1d5db",
                    background: form.targetClasses.includes(cls) ? "#ede9fe" : "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {cls}
                </button>
              ))}
              {form.targetClasses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, targetClasses: [] })}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "1px solid #ef4444",
                    background: "#fff",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  清除
                </button>
              )}
            </div>

            <label>區域</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {regionOptions.filter(Boolean).map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() =>
                    toggleArrayItem(form.targetRegions, region, (val) =>
                      setForm({ ...form, targetRegions: val })
                    )
                  }
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: form.targetRegions.includes(region)
                      ? "2px solid #059669"
                      : "1px solid #d1d5db",
                    background: form.targetRegions.includes(region) ? "#ecfdf5" : "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {region}
                </button>
              ))}
              {form.targetRegions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, targetRegions: [] })}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    border: "1px solid #ef4444",
                    background: "#fff",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  清除
                </button>
              )}
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#f3f4f6",
                borderRadius: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#374151" }}>
                預計發送對象：
                <strong style={{ color: "#059669", marginLeft: 8 }}>{targetCount} 位學生</strong>
                {form.targetGrades.length === 0 &&
                  form.targetClasses.length === 0 &&
                  form.targetRegions.length === 0 && (
                    <span style={{ color: "#6b7280", marginLeft: 8 }}>（全部學生）</span>
                  )}
              </span>
              <button className="btn" onClick={handleCreate}>
                發布公告
              </button>
            </div>
            {formError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 16px",
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  color: "#dc2626",
                  fontWeight: 500,
                }}
              >
                {formError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 公告列表 */}
      <div className="card">
        <h3>已發布公告 ({announcements.length})</h3>
        {announcements.length === 0 ? (
          <p className="muted">尚無公告。</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {announcements.map((ann) => {
              const style = typeStyles[ann.type] ?? typeStyles.info;
              const typeLabel = typeOptions.find((t) => t.value === ann.type);
              return (
                <div
                  key={ann.id}
                  style={{
                    background: style.bg,
                    borderLeft: `4px solid ${style.border}`,
                    padding: 16,
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 12,
                          background: style.border,
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: 4,
                          marginRight: 8,
                        }}
                      >
                        {typeLabel?.icon} {typeLabel?.label}
                      </span>
                      <strong style={{ fontSize: 16 }}>{ann.title}</strong>
                    </div>
                    <button
                      className="btn ghost"
                      style={{ fontSize: 12, color: "#ef4444" }}
                      onClick={() => handleDelete(ann.id)}
                    >
                      刪除
                    </button>
                  </div>
                  <p style={{ margin: "8px 0", color: "#374151" }}>{ann.content}</p>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      fontSize: 12,
                      color: "#6b7280",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>📅 {new Date(ann.createdAt).toLocaleString()}</span>
                    {ann.targetGrades.length > 0 && (
                      <span>🎓 年級：{ann.targetGrades.join(", ")}</span>
                    )}
                    {ann.targetClasses.length > 0 && (
                      <span>🏫 班級：{ann.targetClasses.join(", ")}</span>
                    )}
                    {ann.targetRegions.length > 0 && (
                      <span>📍 區域：{ann.targetRegions.join(", ")}</span>
                    )}
                    {ann.targetGrades.length === 0 &&
                      ann.targetClasses.length === 0 &&
                      ann.targetRegions.length === 0 && <span>👥 全部學生</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
