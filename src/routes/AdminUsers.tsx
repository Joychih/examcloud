import { useEffect, useMemo, useState } from "react";
import { createAssignment, createCustomExam, filterQuestions, getAssignments, getExams, getQuestionBank, getResults, getStudents } from "../data/api";
import type { Exam, ExamAssignment, ExamResult, Question, StudentUser } from "../data/models";
import { mockDb } from "../data/mock";
import Latex from "../components/Latex";

// 章節選項
const chapterOptions = [
  "數與式", "多項式", "三角函數", "向量", "平面向量", "圓與球",
  "統計", "機率", "極限", "微分", "積分", "指數與對數",
  "數列與級數", "排列組合", "矩陣", "複數", "空間向量",
];

type AssignMode = "exam" | "topic" | "questions";
type ViewTab = "students" | "assignments";

export default function AdminUsers() {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewTab>("students");

  // 篩選
  const [classFilter, setClassFilter] = useState<string>("");
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  // 選擇的學生
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // 指派試卷
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignMode, setAssignMode] = useState<AssignMode>("exam");
  const [assignStatus, setAssignStatus] = useState<string>("");
  const [assignmentName, setAssignmentName] = useState<string>("");

  // 模式1: 選擇試卷
  const [examSearch, setExamSearch] = useState("");
  const [selectedExam, setSelectedExam] = useState<string>("");

  // 模式2: 主題生成
  const [topicChapter, setTopicChapter] = useState("");
  const [topicDifficulty, setTopicDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [topicCount, setTopicCount] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  // 模式3: 勾選題目
  const [questionSearch, setQuestionSearch] = useState("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      getStudents(),
      getExams(),
      getQuestionBank(),
      getAssignments(),
      getResults(),
    ]).then(([studentData, examData, questionData, assignmentData, resultData]) => {
      setStudents(studentData);
      setExams(examData);
      setAllQuestions(questionData);
      setAssignments(assignmentData);
      setResults(resultData);
      setLoading(false);
    });
  }, []);

  // 生成預設指派名稱
  const generateDefaultName = useMemo(() => {
    const selectedStudentsList = students.filter((s) => selectedStudents.has(s.id));
    const classes = [...new Set(selectedStudentsList.map((s) => s.className))];
    const classStr = classes.length > 2 ? `${classes[0]}等${classes.length}班` : classes.join("、");
    const dateStr = new Date().toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
    
    if (assignMode === "exam" && selectedExam) {
      const exam = exams.find((e) => e.id === selectedExam);
      return `${exam?.title || "試卷"} - ${classStr} (${dateStr})`;
    }
    if (assignMode === "topic" && topicChapter) {
      return `${topicChapter}練習 - ${classStr} (${dateStr})`;
    }
    if (assignMode === "questions" && selectedQuestionIds.size > 0) {
      return `自選題目${selectedQuestionIds.size}題 - ${classStr} (${dateStr})`;
    }
    return `指派作業 - ${classStr} (${dateStr})`;
  }, [students, selectedStudents, assignMode, selectedExam, exams, topicChapter, selectedQuestionIds]);

  // 取得所有選項
  const filterOptions = useMemo(() => {
    const classes = new Set<string>();
    const grades = new Set<string>();
    const regions = new Set<string>();
    students.forEach((s) => {
      classes.add(s.className);
      grades.add(s.grade);
      regions.add(s.region);
    });
    return {
      classes: Array.from(classes).sort(),
      grades: Array.from(grades).sort(),
      regions: Array.from(regions).sort(),
    };
  }, [students]);

  // 篩選後的學生
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (classFilter && s.className !== classFilter) return false;
      if (gradeFilter && s.grade !== gradeFilter) return false;
      if (regionFilter && s.region !== regionFilter) return false;
      if (planFilter && s.plan !== planFilter) return false;
      if (searchText) {
        const text = searchText.toLowerCase();
        const match =
          s.name.toLowerCase().includes(text) ||
          s.email?.toLowerCase().includes(text) ||
          s.school.toLowerCase().includes(text) ||
          s.id.toLowerCase().includes(text);
        if (!match) return false;
      }
      return true;
    });
  }, [students, classFilter, gradeFilter, regionFilter, planFilter, searchText]);

  // 搜尋試卷
  const filteredExams = useMemo(() => {
    if (!examSearch.trim()) return exams.slice(0, 30);
    const search = examSearch.toLowerCase();
    return exams.filter((e) => e.title.toLowerCase().includes(search)).slice(0, 30);
  }, [exams, examSearch]);

  // 搜尋題目
  const filteredQuestions = useMemo(() => {
    if (!questionSearch.trim()) return allQuestions.slice(0, 50);
    const search = questionSearch.toLowerCase();
    return allQuestions.filter((q) =>
      q.content.toLowerCase().includes(search) ||
      q.tags.some((t) => t.toLowerCase().includes(search)) ||
      q.source?.examTitle?.toLowerCase().includes(search)
    ).slice(0, 50);
  }, [allQuestions, questionSearch]);

  // 全選/取消全選
  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  // 切換選擇單個學生
  const toggleSelect = (id: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 生成主題試卷
  const handleGenerateTopic = async () => {
    if (!topicChapter) {
      setAssignStatus("⚠️ 請選擇章節");
      return;
    }
    const questions = await filterQuestions({
      chapter: topicChapter,
      difficulty: topicDifficulty,
      limit: topicCount,
    });
    setGeneratedQuestions(questions);
    if (questions.length === 0) {
      setAssignStatus("⚠️ 找不到符合條件的題目");
    } else {
      setAssignStatus(`✅ 已生成 ${questions.length} 題`);
    }
  };

  // 指派試卷
  const handleAssign = async () => {
    if (selectedStudents.size === 0) {
      setAssignStatus("⚠️ 請選擇至少一位學生");
      return;
    }

    let examIdToAssign = "";
    let examTitle = "";

    if (assignMode === "exam") {
      if (!selectedExam) {
        setAssignStatus("⚠️ 請選擇試卷");
        return;
      }
      examIdToAssign = selectedExam;
      examTitle = exams.find((e) => e.id === selectedExam)?.title ?? "";
    } else if (assignMode === "topic") {
      if (!topicChapter) {
        setAssignStatus("⚠️ 請選擇章節");
        return;
      }
      // 自動生成題目（如果尚未生成）
      let questionsToUse = generatedQuestions;
      if (questionsToUse.length === 0) {
        const questions = await filterQuestions({
          chapter: topicChapter,
          difficulty: topicDifficulty,
          limit: topicCount,
        });
        if (questions.length === 0) {
          setAssignStatus("⚠️ 找不到符合條件的題目，請調整章節或難度");
          return;
        }
        questionsToUse = questions;
        setGeneratedQuestions(questions);
      }
      const title = `指派練習 - ${topicChapter}`;
      const customExam = await createCustomExam(title, topicChapter, topicDifficulty, questionsToUse);
      examIdToAssign = `custom:${customExam.id}`;
      examTitle = title;
    } else if (assignMode === "questions") {
      if (selectedQuestionIds.size === 0) {
        setAssignStatus("⚠️ 請選擇至少一題");
        return;
      }
      const questions = allQuestions.filter((q) => selectedQuestionIds.has(q.id));
      const title = `指派練習 (${questions.length}題)`;
      const customExam = await createCustomExam(title, "自訂", "mixed", questions);
      examIdToAssign = `custom:${customExam.id}`;
      examTitle = title;
    }

    // 使用指派名稱或預設值
    const finalName = assignmentName.trim() || generateDefaultName;

    // 建立指派紀錄
    const newAssignment = await createAssignment({
      name: finalName,
      examId: examIdToAssign,
      examTitle: examTitle,
      targetStudentIds: Array.from(selectedStudents),
    });

    setAssignments([...assignments, newAssignment]);

    // 更新學生資料（從 mockDb 重新取得）
    setStudents([...mockDb.students]);

    setAssignStatus(`✅ 已成功指派「${finalName}」給 ${selectedStudents.size} 位學生`);
    setSelectedStudents(new Set());
    setShowAssignModal(false);

    // 重置
    setSelectedExam("");
    setGeneratedQuestions([]);
    setSelectedQuestionIds(new Set());
    setAssignmentName("");
  };

  // 清除篩選
  const clearFilters = () => {
    setClassFilter("");
    setGradeFilter("");
    setRegionFilter("");
    setPlanFilter("");
    setSearchText("");
  };

  const activeFilterCount = [classFilter, gradeFilter, regionFilter, planFilter, searchText].filter(Boolean).length;

  if (loading) {
    return (
      <div className="stack">
        <h2 className="page-title">使用者管理</h2>
        <div className="card"><p>載入中...</p></div>
      </div>
    );
  }

  return (
    <div className="stack">
      <h2 className="page-title">👥 使用者管理</h2>

      {assignStatus && (
        <div
          className="card"
          style={{
            background: assignStatus.includes("✅") ? "#f0fdf4" : "#fef3c7",
            border: assignStatus.includes("✅") ? "1px solid #22c55e" : "1px solid #f59e0b",
            padding: "12px 16px",
          }}
        >
          {assignStatus}
          <button
            className="btn ghost"
            style={{ marginLeft: 16, fontSize: 12 }}
            onClick={() => setAssignStatus("")}
          >
            關閉
          </button>
        </div>
      )}

      {/* 統計卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <div className="card" style={{ textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>總學生數</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>{students.length}</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>VIP 會員</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>
            {students.filter((s) => s.className !== "免費會員").length}
          </div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>指派紀錄</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#8b5cf6" }}>{assignments.length}</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>已選取</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#10b981" }}>{selectedStudents.size}</div>
        </div>
      </div>

      {/* 分頁切換 */}
      <div style={{ display: "flex", gap: 8, borderBottom: "2px solid #e5e7eb", paddingBottom: 8 }}>
        <button
          className={`btn ${activeTab === "students" ? "" : "ghost"}`}
          onClick={() => setActiveTab("students")}
        >
          👥 學生管理
        </button>
        <button
          className={`btn ${activeTab === "assignments" ? "" : "ghost"}`}
          onClick={() => setActiveTab("assignments")}
        >
          📋 指派紀錄 ({assignments.length})
        </button>
      </div>

      {/* 指派紀錄分頁 */}
      {activeTab === "assignments" && (
        <div className="card">
          <h3 style={{ margin: "0 0 16px" }}>📋 試卷指派紀錄</h3>
          {assignments.length === 0 ? (
            <p className="muted">尚無指派紀錄。</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {assignments.map((assignment) => {
                // 計算完成情況
                const completedStudents = assignment.targetStudentIds.filter((sid) =>
                  results.some((r) => r.userId === sid && (r.examId === assignment.examId || r.assignmentId === assignment.id))
                );
                const completedCount = completedStudents.length;
                const totalCount = assignment.targetStudentIds.length;
                const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                
                return (
                  <div
                    key={assignment.id}
                    style={{
                      padding: 16,
                      background: "#f8fafc",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <h4 style={{ margin: "0 0 4px", fontSize: 16 }}>{assignment.name}</h4>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          試卷：{assignment.examTitle}
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>
                          指派時間：{new Date(assignment.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: completionRate === 100 ? "#10b981" : completionRate >= 50 ? "#f59e0b" : "#ef4444",
                          }}
                        >
                          {completionRate}%
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {completedCount}/{totalCount} 人已完成
                        </div>
                      </div>
                    </div>
                    
                    {/* 進度條 */}
                    <div style={{ background: "#e5e7eb", borderRadius: 999, height: 8, marginBottom: 12 }}>
                      <div
                        style={{
                          background: completionRate === 100 ? "#10b981" : completionRate >= 50 ? "#f59e0b" : "#ef4444",
                          borderRadius: 999,
                          height: "100%",
                          width: `${completionRate}%`,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    
                    {/* 學生狀態 */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {assignment.targetStudentIds.map((sid) => {
                        const student = students.find((s) => s.id === sid);
                        const hasCompleted = results.some(
                          (r) => r.userId === sid && (r.examId === assignment.examId || r.assignmentId === assignment.id)
                        );
                        return (
                          <span
                            key={sid}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              background: hasCompleted ? "#dcfce7" : "#fee2e2",
                              color: hasCompleted ? "#166534" : "#dc2626",
                            }}
                          >
                            {hasCompleted ? "✓" : "○"} {student?.name || sid}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 學生管理分頁 */}
      {activeTab === "students" && (
        <>
      {/* 篩選器 */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>🔍 篩選條件</h3>
          {activeFilterCount > 0 && (
            <button className="btn ghost" style={{ fontSize: 12 }} onClick={clearFilters}>
              清除全部 ({activeFilterCount})
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          <label>
            <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>班級</span>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ width: "100%" }}>
              <option value="">全部班級</option>
              {filterOptions.classes.map((c) => (
                <option key={c} value={c}>{c}</option>
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
            <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>地區</span>
            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={{ width: "100%" }}>
              <option value="">全部地區</option>
              {filterOptions.regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>方案</span>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} style={{ width: "100%" }}>
              <option value="">全部方案</option>
              <option value="free">免費版</option>
              <option value="vip">VIP</option>
            </select>
          </label>
          <label style={{ gridColumn: "span 2" }}>
            <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>搜尋</span>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="姓名、Email、學校、ID..."
              style={{ width: "100%" }}
            />
          </label>
        </div>
      </div>

      {/* 批次操作 */}
      {selectedStudents.size > 0 && (
        <div
          className="card"
          style={{
            background: "#ede9fe",
            border: "2px solid #8b5cf6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: "#5b21b6" }}>
            已選取 {selectedStudents.size} 位學生
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn ghost" onClick={() => setSelectedStudents(new Set())}>
              取消選取
            </button>
            <button className="btn" style={{ background: "#8b5cf6" }} onClick={() => setShowAssignModal(true)}>
              📋 指派試卷
            </button>
          </div>
        </div>
      )}

      {/* 學生列表 */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>學生列表 ({filteredStudents.length} 人)</h3>
          <button className="btn ghost" onClick={toggleSelectAll}>
            {selectedStudents.size === filteredStudents.length ? "取消全選" : "全選"}
          </button>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="muted">無符合條件的學生。</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 1000 }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>姓名</th>
                  <th>班級</th>
                  <th>年級</th>
                  <th>就讀學校</th>
                  <th>地區</th>
                  <th>方案</th>
                  <th>加入日期</th>
                  <th>已完成</th>
                  <th>平均分</th>
                  <th>指派試卷</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    style={{ background: selectedStudents.has(s.id) ? "#f5f3ff" : undefined }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(s.id)}
                        onChange={() => toggleSelect(s.id)}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{s.email}</div>
                    </td>
                    <td>
                      {s.className === "免費會員" ? (
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
                          ⭐ {s.className}
                        </span>
                      )}
                    </td>
                    <td>{s.grade}</td>
                    <td style={{ fontSize: 13 }}>{s.school}</td>
                    <td style={{ fontSize: 13 }}>{s.region}</td>
                    <td>
                      <span
                        style={{
                          background: s.className !== "免費會員" ? "#dcfce7" : "#fee2e2",
                          color: s.className !== "免費會員" ? "#166534" : "#dc2626",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {s.className !== "免費會員" ? "✓ 付費" : "免費"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>
                      {new Date(s.joinDate).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "center" }}>{s.examsTaken ?? 0}</td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          color: (s.avgScore ?? 0) >= 80 ? "#10b981" : (s.avgScore ?? 0) >= 60 ? "#f59e0b" : "#ef4444",
                          fontWeight: 600,
                        }}
                      >
                        {s.avgScore ?? "-"}%
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>{s.assignedExams?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}

      {/* 指派試卷 Modal */}
      {showAssignModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 1000,
            padding: "40px 20px",
            overflowY: "auto",
          }}
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: 700, width: "100%", maxHeight: "calc(100vh - 80px)", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px" }}>📋 指派試卷給 {selectedStudents.size} 位學生</h3>

            {/* 模式選擇 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[
                { mode: "exam" as AssignMode, label: "📝 選擇試卷", desc: "搜尋現有段考" },
                { mode: "topic" as AssignMode, label: "🎯 主題生成", desc: "依章節難度生成" },
                { mode: "questions" as AssignMode, label: "✅ 勾選題目", desc: "自選題目組卷" },
              ].map((item) => (
                <button
                  key={item.mode}
                  onClick={() => setAssignMode(item.mode)}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: assignMode === item.mode ? "2px solid #8b5cf6" : "2px solid #e5e7eb",
                    background: assignMode === item.mode ? "#ede9fe" : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{item.desc}</div>
                </button>
              ))}
            </div>

            {/* 模式1: 選擇試卷 */}
            {assignMode === "exam" && (
              <div>
                <label style={{ display: "block", marginBottom: 12 }}>
                  <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>🔍 搜尋試卷名稱</span>
                  <input
                    type="text"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    placeholder="輸入學校名稱、年度、科目..."
                    style={{ width: "100%" }}
                  />
                </label>
                <div style={{ maxHeight: 250, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                  {filteredExams.map((exam) => (
                    <div
                      key={exam.id}
                      onClick={() => setSelectedExam(exam.id)}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        background: selectedExam === exam.id ? "#ede9fe" : "transparent",
                        borderBottom: "1px solid #f3f4f6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>{exam.title}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{exam.questions.length} 題</div>
                      </div>
                      {selectedExam === exam.id && (
                        <span style={{ color: "#8b5cf6", fontWeight: 700 }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 模式2: 主題生成 */}
            {assignMode === "topic" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <label>
                    <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>章節</span>
                    <select
                      value={topicChapter}
                      onChange={(e) => setTopicChapter(e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <option value="">請選擇</option>
                      {chapterOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>難度</span>
                    <select
                      value={topicDifficulty}
                      onChange={(e) => setTopicDifficulty(e.target.value as any)}
                      style={{ width: "100%" }}
                    >
                      <option value="easy">基礎</option>
                      <option value="medium">中階</option>
                      <option value="hard">進階</option>
                      <option value="mixed">混合</option>
                    </select>
                  </label>
                  <label>
                    <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>題數</span>
                    <select
                      value={topicCount}
                      onChange={(e) => setTopicCount(Number(e.target.value))}
                      style={{ width: "100%" }}
                    >
                      {[3, 5, 10, 15, 20].map((n) => (
                        <option key={n} value={n}>{n} 題</option>
                      ))}
                    </select>
                  </label>
                </div>
                <button className="btn ghost" onClick={handleGenerateTopic} style={{ marginBottom: 12 }}>
                  🎲 生成題目
                </button>
                {generatedQuestions.length > 0 && (
                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>已生成 {generatedQuestions.length} 題：</div>
                    {generatedQuestions.map((q, i) => (
                      <div key={q.id} style={{ fontSize: 13, padding: "4px 0", borderBottom: "1px solid #e5e7eb" }}>
                        {i + 1}. <Latex content={q.content.length > 60 ? q.content.substring(0, 60) + "..." : q.content} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 模式3: 勾選題目 */}
            {assignMode === "questions" && (
              <div>
                <label style={{ display: "block", marginBottom: 12 }}>
                  <span style={{ fontWeight: 500, display: "block", marginBottom: 4 }}>
                    🔍 搜尋題目（已選 {selectedQuestionIds.size} 題）
                  </span>
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="輸入題目內容、章節..."
                    style={{ width: "100%" }}
                  />
                </label>
                <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                  {filteredQuestions.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestionIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(q.id)) {
                            next.delete(q.id);
                          } else {
                            next.add(q.id);
                          }
                          return next;
                        });
                      }}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        background: selectedQuestionIds.has(q.id) ? "#dcfce7" : "transparent",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={selectedQuestionIds.has(q.id)}
                          onChange={() => {}}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13 }}>
                            <Latex content={q.content.length > 80 ? q.content.substring(0, 80) + "..." : q.content} />
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                            {q.tags.join(" · ")} · {q.difficulty === "easy" ? "基礎" : q.difficulty === "medium" ? "中階" : "進階"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 指派名稱 */}
            <div style={{ marginTop: 20, padding: 16, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
              <label style={{ display: "block", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>📝 指派名稱</span>
                <input
                  type="text"
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                  placeholder={generateDefaultName}
                  style={{ width: "100%" }}
                />
              </label>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                預設名稱：{generateDefaultName}
              </p>
            </div>

            {/* 操作按鈕 */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn ghost" onClick={() => setShowAssignModal(false)}>取消</button>
              <button className="btn" onClick={handleAssign}>確認指派</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
