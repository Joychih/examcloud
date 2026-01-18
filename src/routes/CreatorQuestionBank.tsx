import { useEffect, useMemo, useState } from "react";
import { getQuestionBank, getSchools, updateQuestion, deleteQuestion } from "../data/api";
import type { Question, School } from "../data/models";
import Latex from "../components/Latex";

const chapterTagOptions = [
  "數與式", "多項式", "三角函數", "向量", "平面向量", "圓與球",
  "統計", "機率", "極限", "微分", "積分", "指數與對數",
  "數列與級數", "排列組合", "矩陣", "複數", "空間向量", "應用數學"
];

const difficultyOptions = [
  { value: "easy", label: "簡單" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困難" },
];

export default function CreatorQuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  // 篩選條件 - 題目屬性
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  // 篩選條件 - 來源
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [schoolFilter, setSchoolFilter] = useState<string>("");
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");

  // 編輯狀態
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Question>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");

  const loadQuestions = () => {
    setLoading(true);
    Promise.all([getQuestionBank(), getSchools()]).then(([questionData, schoolData]) => {
      setQuestions(questionData);
      setSchools(schoolData);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // 取得所有選項列表
  const filterOptions = useMemo(() => {
    const tags = new Set<string>();
    const grades = new Set<string>();
    const years = new Set<string>();
    const subjects = new Set<string>();
    const schoolIds = new Set<string>();

    questions.forEach((q) => {
      q.tags.forEach((t) => tags.add(t));
      if (q.source?.grade) grades.add(q.source.grade);
      if (q.source?.year) years.add(q.source.year);
      if (q.source?.subject) subjects.add(q.source.subject);
      if (q.source?.schoolId) schoolIds.add(q.source.schoolId);
    });

    return {
      tags: Array.from(tags).sort(),
      grades: Array.from(grades).sort(),
      years: Array.from(years).sort((a, b) => b.localeCompare(a)),
      subjects: Array.from(subjects).sort(),
      schoolIds: Array.from(schoolIds),
    };
  }, [questions]);

  // 依區域分組學校
  const schoolsByRegion = useMemo(() => {
    const regionMap = new Map<string, School[]>();
    schools.forEach((s) => {
      const list = regionMap.get(s.region) ?? [];
      list.push(s);
      regionMap.set(s.region, list);
    });
    return regionMap;
  }, [schools]);

  // 篩選後的題目
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (typeFilter && q.type !== typeFilter) return false;
      if (difficultyFilter && q.difficulty !== difficultyFilter) return false;
      if (tagFilter && !q.tags.includes(tagFilter)) return false;
      if (searchText) {
        const text = searchText.toLowerCase();
        const match =
          q.content.toLowerCase().includes(text) ||
          q.tags.some((t) => t.toLowerCase().includes(text)) ||
          q.source?.schoolName?.toLowerCase().includes(text) ||
          q.source?.examTitle?.toLowerCase().includes(text);
        if (!match) return false;
      }
      if (categoryFilter && q.source?.examCategory !== categoryFilter) return false;
      if (schoolFilter && q.source?.schoolId !== schoolFilter) return false;
      if (gradeFilter && q.source?.grade !== gradeFilter) return false;
      if (yearFilter && q.source?.year !== yearFilter) return false;
      if (subjectFilter && q.source?.subject !== subjectFilter) return false;
      return true;
    });
  }, [questions, typeFilter, difficultyFilter, tagFilter, searchText, categoryFilter, schoolFilter, gradeFilter, yearFilter, subjectFilter]);

  // 統計數據
  const stats = useMemo(() => {
    return {
      total: questions.length,
      mcq: questions.filter((q) => q.type === "MCQ").length,
      tf: questions.filter((q) => q.type === "TF").length,
      fill: questions.filter((q) => q.type === "Fill").length,
      school: questions.filter((q) => q.source?.examCategory === "school").length,
      juniorHigh: questions.filter((q) => q.source?.examCategory === "junior_high").length,
      gsat: questions.filter((q) => q.source?.examCategory === "gsat").length,
      ast: questions.filter((q) => q.source?.examCategory === "ast").length,
    };
  }, [questions]);

  const clearFilters = () => {
    setTypeFilter("");
    setDifficultyFilter("");
    setTagFilter("");
    setSearchText("");
    setCategoryFilter("");
    setSchoolFilter("");
    setGradeFilter("");
    setYearFilter("");
    setSubjectFilter("");
  };

  const activeFilterCount = [
    typeFilter, difficultyFilter, tagFilter, searchText,
    categoryFilter, schoolFilter, gradeFilter, yearFilter, subjectFilter
  ].filter(Boolean).length;

  const typeLabels: Record<string, string> = {
    MCQ: "選擇題",
    TF: "是非題",
    Fill: "填充題",
  };

  const difficultyLabels: Record<string, string> = {
    easy: "簡單",
    medium: "中等",
    hard: "困難",
  };

  const categoryLabels: Record<string, string> = {
    school: "段考",
    junior_high: "會考",
    gsat: "學測",
    ast: "分科測驗",
  };

  // 開始編輯
  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setEditForm({
      content: q.content,
      options: q.options ? [...q.options] : undefined,
      correctAnswer: q.correctAnswer,
      textExplanation: q.textExplanation,
      videoUrl: q.videoUrl,
      tags: [...q.tags],
      difficulty: q.difficulty,
    });
    setStatus("");
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setStatus("");
  };

  // 儲存編輯
  const handleSaveEdit = async (qId: string) => {
    setSaving(true);
    try {
      await updateQuestion(qId, editForm);
      setEditingId(null);
      setEditForm({});
      loadQuestions();
      setStatus("✅ 儲存成功");
    } catch (e) {
      setStatus("❌ 儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  // 刪除題目
  const handleDelete = async (qId: string) => {
    if (!confirm("確定要刪除這題嗎？此操作無法復原。")) return;
    try {
      await deleteQuestion(qId);
      loadQuestions();
      setStatus("✅ 已刪除");
    } catch (e) {
      setStatus("❌ 刪除失敗");
    }
  };

  // 新增詳解來源
  const addExplanationSource = () => {
    setEditForm((prev) => ({
      ...prev,
      videoUrl: prev.videoUrl ? prev.videoUrl + "\n" : "",
    }));
  };

  if (loading) {
    return (
      <div className="stack">
        <h2 className="page-title">題庫管理</h2>
        <div className="card">
          <p>載入題庫中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <h2 className="page-title">題庫管理</h2>

      {status && (
        <div className={`card ${status.includes("✅") ? "success" : "danger"}`} style={{ padding: "12px 16px" }}>
          {status}
        </div>
      )}

      {/* 統計卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <div className="card" style={{ textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>總題數</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>{stats.total}</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>段考題</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>{stats.school}</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>會考題</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#10b981" }}>{stats.juniorHigh}</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>學測題</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{stats.gsat}</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>分科題</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{stats.ast}</div>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>🔍 篩選條件</h3>
          {activeFilterCount > 0 && (
            <button className="btn ghost" style={{ fontSize: 13 }} onClick={clearFilters}>
              清除全部 ({activeFilterCount})
            </button>
          )}
        </div>

        {/* 來源篩選 */}
        <div style={{ marginBottom: 20, padding: 16, background: "#f8fafc", borderRadius: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>📂 題目來源</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            <label>
              <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>考試類別</span>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: "100%" }}>
                <option value="">全部類別</option>
                <option value="school">📝 段考</option>
                <option value="junior_high">🏫 國中會考</option>
                <option value="gsat">📚 學測</option>
                <option value="ast">🎯 分科測驗</option>
              </select>
            </label>

            <label>
              <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>學校</span>
              <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} style={{ width: "100%" }}>
                <option value="">全部學校</option>
                {Array.from(schoolsByRegion.entries()).map(([region, regionSchools]) => (
                  <optgroup key={region} label={`── ${region} ──`}>
                    {regionSchools
                      .filter((s) => filterOptions.schoolIds.includes(s.id))
                      .map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label>
              <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>年級</span>
              <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} style={{ width: "100%" }}>
                <option value="">全部年級</option>
                {filterOptions.grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>

            <label>
              <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>學年度</span>
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ width: "100%" }}>
                <option value="">全部年度</option>
                {filterOptions.years.map((y) => (
                  <option key={y} value={y}>{y}學年度</option>
                ))}
              </select>
            </label>

            <label>
              <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>科目</span>
              <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} style={{ width: "100%" }}>
                <option value="">全部科目</option>
                {filterOptions.subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* 題目屬性篩選 */}
        <div style={{ marginBottom: 16, padding: 16, background: "#fffbeb", borderRadius: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>📝 題目屬性</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            <label>
              <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>題型</span>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: "100%" }}>
                <option value="">全部題型</option>
                <option value="MCQ">選擇題</option>
                <option value="TF">是非題</option>
                <option value="Fill">填充題</option>
              </select>
            </label>

            <label>
              <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>難度</span>
              <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} style={{ width: "100%" }}>
                <option value="">全部難度</option>
                <option value="easy">🟢 簡單</option>
                <option value="medium">🟡 中等</option>
                <option value="hard">🔴 困難</option>
              </select>
            </label>

            <label>
              <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>章節標籤</span>
              <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} style={{ width: "100%" }}>
                <option value="">全部章節</option>
                {filterOptions.tags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* 關鍵字搜尋 */}
        <div>
          <label>
            <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>🔎 關鍵字搜尋</span>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜尋題目內容、學校名稱、試卷名稱..."
              style={{ width: "100%", padding: "12px 16px" }}
            />
          </label>
        </div>
      </div>

      {/* 題目列表 */}
      <div className="card">
        <h3>題目列表 ({filteredQuestions.length} 題)</h3>
        {filteredQuestions.length === 0 ? (
          <p className="muted">無符合條件的題目。請調整篩選條件。</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredQuestions.slice(0, 50).map((q, index) => (
              <div
                key={q.id}
                style={{
                  padding: 16,
                  background: editingId === q.id ? "#fef3c7" : "var(--bg-light)",
                  borderRadius: 12,
                  border: editingId === q.id ? "2px solid #f59e0b" : "1px solid #e5e7eb",
                }}
              >
                {/* 標籤列 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {q.source?.examCategory && (
                      <span
                        className="tag"
                        style={{
                          background:
                            q.source.examCategory === "school" ? "#dbeafe" :
                            q.source.examCategory === "junior_high" ? "#d1fae5" :
                            q.source.examCategory === "gsat" ? "#fef3c7" : "#fee2e2",
                          color:
                            q.source.examCategory === "school" ? "#1d4ed8" :
                            q.source.examCategory === "junior_high" ? "#059669" :
                            q.source.examCategory === "gsat" ? "#d97706" : "#dc2626",
                        }}
                      >
                        {categoryLabels[q.source.examCategory]}
                      </span>
                    )}
                    <span
                      className="tag"
                      style={{
                        background: q.type === "MCQ" ? "#e0e7ff" : q.type === "TF" ? "#fef3c7" : "#d1fae5",
                        color: q.type === "MCQ" ? "#4338ca" : q.type === "TF" ? "#b45309" : "#059669",
                      }}
                    >
                      {typeLabels[q.type]}
                    </span>
                    <span
                      className="tag"
                      style={{
                        background: q.difficulty === "easy" ? "#d1fae5" : q.difficulty === "medium" ? "#fef3c7" : "#fee2e2",
                        color: q.difficulty === "easy" ? "#059669" : q.difficulty === "medium" ? "#d97706" : "#dc2626",
                      }}
                    >
                      {difficultyLabels[q.difficulty]}
                    </span>
                    {q.tags[0] && (
                      <span className="tag" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                        📚 {q.tags[0]}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="muted" style={{ fontSize: 12 }}>#{index + 1}</span>
                    {editingId !== q.id && (
                      <>
                        <button
                          className="btn ghost"
                          style={{ fontSize: 12, padding: "4px 8px" }}
                          onClick={() => handleEdit(q)}
                        >
                          ✏️ 編輯
                        </button>
                        <button
                          className="btn ghost"
                          style={{ fontSize: 12, padding: "4px 8px", color: "#ef4444" }}
                          onClick={() => handleDelete(q.id)}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 編輯模式 */}
                {editingId === q.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <label>
                      <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>題幹</span>
                      <textarea
                        rows={3}
                        value={editForm.content ?? ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                        style={{ width: "100%" }}
                      />
                    </label>

                    {q.type !== "TF" && editForm.options && (
                      <label>
                        <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>選項</span>
                        {editForm.options.map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                            <span style={{ width: 24 }}>({String.fromCharCode(65 + oi)})</span>
                            <input
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(editForm.options ?? [])];
                                newOpts[oi] = e.target.value;
                                setEditForm((prev) => ({ ...prev, options: newOpts }));
                              }}
                              style={{ flex: 1 }}
                            />
                          </div>
                        ))}
                      </label>
                    )}

                    <label>
                      <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>正確答案</span>
                      <input
                        value={editForm.correctAnswer ?? ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                        style={{ width: "100%" }}
                      />
                    </label>

                    <label>
                      <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>文字詳解</span>
                      <textarea
                        rows={3}
                        value={editForm.textExplanation ?? ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, textExplanation: e.target.value }))}
                        style={{ width: "100%" }}
                      />
                    </label>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>🎬 影音詳解（多個以換行分隔）</span>
                        <button
                          className="btn ghost"
                          style={{ fontSize: 11, padding: "2px 8px" }}
                          onClick={addExplanationSource}
                        >
                          + 新增來源
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={editForm.videoUrl ?? ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="影片連結（每行一個）"
                        style={{ width: "100%" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <label>
                        <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>章節</span>
                        <select
                          value={editForm.tags?.[0] ?? ""}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, tags: [e.target.value, ...(prev.tags?.slice(1) ?? [])] }))}
                          style={{ width: "100%" }}
                        >
                          {chapterTagOptions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>難度</span>
                        <select
                          value={editForm.difficulty ?? "medium"}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, difficulty: e.target.value as any }))}
                          style={{ width: "100%" }}
                        >
                          {difficultyOptions.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                      <button className="btn ghost" onClick={handleCancelEdit}>取消</button>
                      <button className="btn" onClick={() => handleSaveEdit(q.id)} disabled={saving}>
                        {saving ? "儲存中..." : "💾 儲存變更"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 題目內容 */}
                    <div style={{ marginBottom: 12 }}>
                      <Latex content={q.content} />
                    </div>

                    {/* 選項 */}
                    {q.options && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 6, marginBottom: 12 }}>
                        {q.options.map((opt, i) => (
                          <div key={i} style={{ padding: "6px 10px", background: "#fff", borderRadius: 4, border: "1px solid #e5e7eb", fontSize: 13 }}>
                            <Latex content={`(${String.fromCharCode(65 + i)}) ${opt}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 底部資訊 */}
                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12, marginTop: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ fontSize: 13 }}>
                          <strong>正確答案：</strong>
                          <Latex content={q.correctAnswer} />
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", textAlign: "right" }}>
                          <div>
                            <strong>來源：</strong>
                            {q.source?.schoolName || "未知學校"} {q.source?.year ? `${q.source.year}學年度` : ""}
                          </div>
                          <div style={{ marginTop: 2 }}>
                            {q.source?.grade} {q.source?.subject}
                          </div>
                        </div>
                      </div>
                      {q.videoUrl && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                          🎬 有影音詳解
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            {filteredQuestions.length > 50 && (
              <p className="muted" style={{ textAlign: "center" }}>
                顯示前 50 題，共 {filteredQuestions.length} 題符合條件
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
