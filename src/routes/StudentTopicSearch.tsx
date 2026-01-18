import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomExam, getQuestionBank, getResults } from "../data/api";
import type { ExamResult, Question } from "../data/models";
import Latex from "../components/Latex";
import { useAuth } from "../hooks/useAuth";

// 高中數學章節 - 分年級整理
const highSchoolChaptersByGrade: Record<string, { name: string; chapters: string[]; color: string }[]> = {
  "高一": [
    { name: "代數基礎", chapters: ["數與式", "多項式", "方程式", "不等式"], color: "#3b82f6" },
    { name: "數列機率", chapters: ["數列與級數", "排列組合"], color: "#8b5cf6" },
    { name: "三角函數", chapters: ["三角函數"], color: "#10b981" },
    { name: "指對數", chapters: ["指數與對數"], color: "#f59e0b" },
  ],
  "高二": [
    { name: "向量空間", chapters: ["向量", "平面向量", "空間向量"], color: "#3b82f6" },
    { name: "解析幾何", chapters: ["圓與球", "圓錐曲線", "直線方程"], color: "#8b5cf6" },
    { name: "機率統計", chapters: ["機率", "統計"], color: "#10b981" },
    { name: "矩陣複數", chapters: ["矩陣", "複數"], color: "#6b7280" },
  ],
  "高三": [
    { name: "微積分", chapters: ["極限", "微分", "積分"], color: "#ef4444" },
    { name: "綜合應用", chapters: ["數與式", "多項式", "三角函數", "向量"], color: "#8b5cf6" },
  ],
};

// 國中數學章節
const juniorHighChapterGroups = [
  { name: "數與量", chapters: ["數與量", "整數", "分數", "小數"], color: "#3b82f6" },
  { name: "代數", chapters: ["代數", "一元一次方程式", "二元一次方程式"], color: "#8b5cf6" },
  { name: "幾何", chapters: ["幾何", "三角形", "四邊形", "圓"], color: "#10b981" },
  { name: "統計機率", chapters: ["統計與機率"], color: "#f59e0b" },
];

// 熟練度顏色
const getProficiencyColor = (rate: number | null) => {
  if (rate === null) return { bg: "#f3f4f6", color: "#6b7280", label: "未作答" };
  if (rate >= 80) return { bg: "#dcfce7", color: "#166534", label: "精熟" };
  if (rate >= 60) return { bg: "#d1fae5", color: "#059669", label: "良好" };
  if (rate >= 40) return { bg: "#fef3c7", color: "#d97706", label: "普通" };
  return { bg: "#fee2e2", color: "#dc2626", label: "待加強" };
};

const difficultyOptions = [
  { value: "easy", label: "基礎", color: "#22c55e", emoji: "🟢" },
  { value: "medium", label: "中階", color: "#f59e0b", emoji: "🟡" },
  { value: "hard", label: "進階", color: "#ef4444", emoji: "🔴" },
  { value: "mixed", label: "混合", color: "#8b5cf6", emoji: "🔀" },
];

const gradeOptions = ["高一", "高二", "高三"];
const questionCountOptions = [5, 10, 15, 20, 25, 30];

export default function StudentTopicSearch() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [level, setLevel] = useState<"junior" | "senior">("senior");
  const [gradeFilter, setGradeFilter] = useState<string>("高一");
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("compact");

  // 生成試卷設定
  const [genDifficulty, setGenDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [genCount, setGenCount] = useState(10);

  const navigate = useNavigate();
  const { currentStudent } = useAuth();

  useEffect(() => {
    Promise.all([getQuestionBank(), getResults()]).then(([questions, resultData]) => {
      setAllQuestions(questions);
      setResults(resultData);
      setLoading(false);
    });
  }, []);

  // 根據年級獲取章節組
  const chapterGroups = useMemo(() => {
    if (level === "junior") return juniorHighChapterGroups;
    return highSchoolChaptersByGrade[gradeFilter] || highSchoolChaptersByGrade["高一"];
  }, [level, gradeFilter]);

  // 計算各章節的熟練度（答對率與答題次數）
  const chapterProficiency = useMemo(() => {
    const stats = new Map<string, { correct: number; total: number }>();
    
    // 建立題目 ID -> 題目的映射
    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));
    
    // 統計使用者的答題紀錄
    const userResults = results.filter((r) => r.userId === currentStudent?.id);
    
    userResults.forEach((result) => {
      result.answers.forEach((answer) => {
        const question = questionMap.get(answer.questionId);
        if (!question) return;
        
        question.tags.forEach((tag) => {
          const current = stats.get(tag) || { correct: 0, total: 0 };
          current.total += 1;
          if (answer.isCorrect) current.correct += 1;
          stats.set(tag, current);
        });
      });
    });
    
    return stats;
  }, [allQuestions, results, currentStudent]);

  // 根據類別和章節過濾題目
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      // 考試類別
      if (level === "junior") {
        if (q.source?.examCategory !== "junior_high") return false;
      } else {
        if (q.source?.examCategory === "junior_high") return false;
      }
      // 章節（多選）
      if (selectedChapters.size > 0) {
        const hasMatchingChapter = q.tags.some((t) =>
          Array.from(selectedChapters).some((ch) => t.includes(ch))
        );
        if (!hasMatchingChapter) return false;
      }
      // 難度（多選）
      if (selectedDifficulty.size > 0 && !selectedDifficulty.has(q.difficulty)) {
        return false;
      }
      // 搜尋
      if (searchText) {
        const text = searchText.toLowerCase();
        const match =
          q.content.toLowerCase().includes(text) ||
          q.tags.some((t) => t.toLowerCase().includes(text));
        if (!match) return false;
      }
      return true;
    });
  }, [allQuestions, level, selectedChapters, selectedDifficulty, searchText]);

  // 各難度題目數量
  const difficultyStats = useMemo(() => {
    const stats = { easy: 0, medium: 0, hard: 0, total: 0 };
    filteredQuestions.forEach((q) => {
      stats[q.difficulty]++;
      stats.total++;
    });
    return stats;
  }, [filteredQuestions]);

  // 章節題目數量統計
  const chapterStats = useMemo(() => {
    const stats = new Map<string, number>();
    allQuestions.forEach((q) => {
      // 過濾考試類別
      if (level === "junior" && q.source?.examCategory !== "junior_high") return;
      if (level === "senior" && q.source?.examCategory === "junior_high") return;

      q.tags.forEach((tag) => {
        stats.set(tag, (stats.get(tag) || 0) + 1);
      });
    });
    return stats;
  }, [allQuestions, level]);

  // 切換章節選擇
  const toggleChapter = (chapter: string) => {
    setSelectedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapter)) {
        next.delete(chapter);
      } else {
        next.add(chapter);
      }
      return next;
    });
  };

  // 選擇整個分類
  const toggleGroup = (chapters: string[]) => {
    setSelectedChapters((prev) => {
      const next = new Set(prev);
      const allSelected = chapters.every((ch) => next.has(ch));
      if (allSelected) {
        chapters.forEach((ch) => next.delete(ch));
      } else {
        chapters.forEach((ch) => next.add(ch));
      }
      return next;
    });
  };

  // 切換難度篩選
  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulty((prev) => {
      const next = new Set(prev);
      if (next.has(diff)) {
        next.delete(diff);
      } else {
        next.add(diff);
      }
      return next;
    });
  };

  // 清除所有篩選
  const clearFilters = () => {
    setSelectedChapters(new Set());
    setSelectedDifficulty(new Set());
    setSearchText("");
  };

  // 生成自訂試卷
  const handleGenerate = async () => {
    if (selectedChapters.size === 0) {
      alert("請先選擇至少一個章節");
      return;
    }

    setGenerating(true);
    try {
      let questions = filteredQuestions;

      // 難度篩選
      if (genDifficulty !== "mixed") {
        questions = questions.filter((q) => q.difficulty === genDifficulty);
      }

      // 隨機打亂並取指定數量
      questions = questions.sort(() => Math.random() - 0.5).slice(0, genCount);

      if (questions.length === 0) {
        alert("找不到符合條件的題目，請調整篩選條件");
        setGenerating(false);
        return;
      }

      const chaptersStr = Array.from(selectedChapters).slice(0, 2).join("、") +
        (selectedChapters.size > 2 ? `等${selectedChapters.size}章` : "");
      const diffLabel = difficultyOptions.find((d) => d.value === genDifficulty)?.label || "混合";
      const title = `${chaptersStr} - ${diffLabel}練習 (${questions.length}題)`;

      const customExam = await createCustomExam(title, chaptersStr, genDifficulty, questions);

      navigate(`/student/custom-exam/${customExam.id}`);
    } catch (error) {
      console.error(error);
      alert("生成試卷失敗，請稍後再試");
    }
    setGenerating(false);
  };

  const difficultyLabels: Record<string, string> = {
    easy: "基礎",
    medium: "中階",
    hard: "進階",
  };

  if (loading) {
    return (
      <div className="stack">
        <h2 className="page-title">主題搜題</h2>
        <div className="card"><p>載入題庫中...</p></div>
      </div>
    );
  }

  return (
    <div className="stack">
      <h2 className="page-title">📚 主題搜題</h2>

      {/* 層級與年級選擇 */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          className={`btn ${level === "senior" ? "" : "ghost"}`}
          style={{ padding: "14px 20px" }}
          onClick={() => { setLevel("senior"); clearFilters(); }}
        >
          🎓 高中數學
        </button>
        <button
          className={`btn ${level === "junior" ? "" : "ghost"}`}
          style={{ padding: "14px 20px" }}
          onClick={() => { setLevel("junior"); clearFilters(); }}
        >
          🏫 國中數學
        </button>
        
        {level === "senior" && (
          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {gradeOptions.map((grade) => (
              <button
                key={grade}
                className={`btn ${gradeFilter === grade ? "" : "ghost"}`}
                style={{ padding: "10px 18px", fontSize: 14 }}
                onClick={() => { setGradeFilter(grade); setSelectedChapters(new Set()); }}
              >
                {grade}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 章節選擇器 - 視覺化 + 熟練度 */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>🗂️ 知識點範圍（{level === "senior" ? gradeFilter : "國中"}）</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 4, fontSize: 11 }}>
              <span style={{ padding: "2px 6px", background: "#dcfce7", color: "#166534", borderRadius: 4 }}>精熟</span>
              <span style={{ padding: "2px 6px", background: "#d1fae5", color: "#059669", borderRadius: 4 }}>良好</span>
              <span style={{ padding: "2px 6px", background: "#fef3c7", color: "#d97706", borderRadius: 4 }}>普通</span>
              <span style={{ padding: "2px 6px", background: "#fee2e2", color: "#dc2626", borderRadius: 4 }}>待加強</span>
              <span style={{ padding: "2px 6px", background: "#f3f4f6", color: "#6b7280", borderRadius: 4 }}>未作答</span>
            </div>
            {selectedChapters.size > 0 && (
              <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => setSelectedChapters(new Set())}>
                清除 ({selectedChapters.size})
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {chapterGroups.map((group) => (
            <div key={group.name} style={{ padding: 12, background: "#f8fafc", borderRadius: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                  cursor: "pointer",
                }}
                onClick={() => toggleGroup(group.chapters)}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: group.chapters.every((ch) => selectedChapters.has(ch))
                      ? group.color
                      : group.chapters.some((ch) => selectedChapters.has(ch))
                      ? `${group.color}50`
                      : "#e5e7eb",
                  }}
                />
                <span style={{ fontWeight: 600, color: group.color }}>{group.name}</span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  ({group.chapters.reduce((sum, ch) => sum + (chapterStats.get(ch) || 0), 0)} 題)
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                {group.chapters.map((ch) => {
                  const count = chapterStats.get(ch) || 0;
                  const isSelected = selectedChapters.has(ch);
                  const proficiency = chapterProficiency.get(ch);
                  const rate = proficiency && proficiency.total > 0
                    ? Math.round((proficiency.correct / proficiency.total) * 100)
                    : null;
                  const profStyle = getProficiencyColor(rate);
                  const attempts = proficiency?.total || 0;
                  
                  return (
                    <button
                      key={ch}
                      onClick={() => toggleChapter(ch)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: isSelected ? `2px solid ${group.color}` : "1px solid #e5e7eb",
                        background: isSelected ? `${group.color}10` : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: isSelected ? 600 : 500, color: isSelected ? group.color : "#374151", fontSize: 14 }}>
                          {ch}
                        </span>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{count} 題</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: profStyle.bg,
                            color: profStyle.color,
                          }}
                        >
                          {rate !== null ? `${rate}%` : "未作答"}
                        </span>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>
                          {attempts > 0 ? `${attempts} 次` : ""}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 難度 + 搜尋 + 統計 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <h3 style={{ margin: "0 0 12px" }}>🎯 難度篩選</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {difficultyOptions.slice(0, 3).map((opt) => {
              const isSelected = selectedDifficulty.has(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleDifficulty(opt.value)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: isSelected ? `2px solid ${opt.color}` : "1px solid #e5e7eb",
                    background: isSelected ? `${opt.color}15` : "#fff",
                    color: isSelected ? opt.color : "#374151",
                    fontWeight: isSelected ? 600 : 400,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {opt.emoji} {opt.label}
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    {difficultyStats[opt.value as "easy" | "medium" | "hard"]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: "0 0 12px" }}>🔍 關鍵字</h3>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜尋題目內容..."
            style={{ width: "100%", padding: "10px 14px" }}
          />
        </div>
      </div>

      {/* 生成試卷區 */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
          border: "2px solid #10b981",
        }}
      >
        <h3 style={{ margin: "0 0 16px", color: "#065f46" }}>⚡ 生成練習試卷</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>難度</label>
            <select
              value={genDifficulty}
              onChange={(e) => setGenDifficulty(e.target.value as any)}
              style={{ width: "100%", padding: "10px 12px" }}
            >
              {difficultyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.emoji} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>題數</label>
            <select
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
              style={{ width: "100%", padding: "10px 12px" }}
            >
              {questionCountOptions.map((n) => (
                <option key={n} value={n}>{n} 題</option>
              ))}
            </select>
          </div>

          <button
            className="btn"
            onClick={handleGenerate}
            disabled={selectedChapters.size === 0 || generating}
            style={{ padding: "12px 24px", background: "#10b981" }}
          >
            {generating ? "生成中..." : "🚀 開始練習"}
          </button>
        </div>

        <div style={{ marginTop: 12, padding: 10, background: "#fff", borderRadius: 8, fontSize: 14 }}>
          {selectedChapters.size > 0 ? (
            <span>
              已選 <strong style={{ color: "#10b981" }}>{selectedChapters.size}</strong> 個章節，
              共 <strong>{filteredQuestions.length}</strong> 題可練習
            </span>
          ) : (
            <span style={{ color: "#f59e0b" }}>⚠️ 請先選擇章節</span>
          )}
        </div>
      </div>

      {/* 題目列表 */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>
            📋 題庫瀏覽 <span style={{ fontWeight: 400, color: "#6b7280" }}>({filteredQuestions.length} 題)</span>
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`btn ${viewMode === "compact" ? "" : "ghost"}`}
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => setViewMode("compact")}
            >
              簡潔
            </button>
            <button
              className={`btn ${viewMode === "detailed" ? "" : "ghost"}`}
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => setViewMode("detailed")}
            >
              詳細
            </button>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <p className="muted">無符合條件的題目，請調整篩選條件。</p>
        ) : viewMode === "compact" ? (
          // 簡潔視圖
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredQuestions.slice(0, 30).map((q, index) => (
              <div
                key={q.id}
                style={{
                  padding: "12px 16px",
                  background: "#f8fafc",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderLeft: `4px solid ${
                    q.difficulty === "easy" ? "#22c55e" : q.difficulty === "medium" ? "#f59e0b" : "#ef4444"
                  }`,
                }}
              >
                <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 24 }}>#{index + 1}</span>
                <span
                  style={{
                    background: "#e0f2fe",
                    color: "#0369a1",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {q.tags[0] || "未分類"}
                </span>
                <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <Latex content={q.content.slice(0, 80) + (q.content.length > 80 ? "..." : "")} />
                </div>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>
                  {q.type === "MCQ" ? "選" : q.type === "TF" ? "是非" : "填"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          // 詳細視圖
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredQuestions.slice(0, 20).map((q, index) => (
              <div
                key={q.id}
                style={{
                  padding: 16,
                  background: "#f8fafc",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="tag" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                      {q.tags[0] || "未分類"}
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
                  </div>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>#{index + 1}</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <Latex content={q.content} />
                </div>
                {q.options && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {q.options.map((opt, i) => (
                      <div key={i} style={{ padding: "6px 10px", background: "#fff", borderRadius: 4, fontSize: 13 }}>
                        <Latex content={`(${String.fromCharCode(65 + i)}) ${opt}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredQuestions.length > (viewMode === "compact" ? 30 : 20) && (
          <p className="muted" style={{ textAlign: "center", marginTop: 16 }}>
            顯示前 {viewMode === "compact" ? 30 : 20} 題，使用上方功能生成試卷練習更多！
          </p>
        )}
      </div>
    </div>
  );
}
