import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignments, getExams, getResults } from "../data/api";
import { mockDb } from "../data/mock";
import type { Exam, ExamAssignment, ExamResult } from "../data/models";
import { useAuth } from "../hooks/useAuth";

// 模擬全體作答統計（實際應從後端取得）
type GlobalStats = {
  totalAttempts: number;
  avgScore: number;
  questionStats: Record<string, number>;
  // 五標分數
  top: number;      // 頂標
  front: number;    // 前標
  average: number;  // 均標
  back: number;     // 後標
  bottom: number;   // 底標
  // 分數分布
  distribution: number[]; // 0-10, 10-20, ..., 90-100 各區間人數比例
};

const mockGlobalStats: Record<string, GlobalStats> = {};

export default function StudentRecords() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const navigate = useNavigate();
  const { currentStudent } = useAuth();

  useEffect(() => {
    Promise.all([getResults(), getExams(), getAssignments()]).then(([resultData, examData, assignmentData]) => {
      setResults(resultData);
      setExams(examData);
      setAssignments(assignmentData);

      // 生成模擬全體統計數據
      examData.forEach((exam) => {
        if (exam.examCategory === "school") {
          const attempts = Math.floor(Math.random() * 200) + 50;
          const avgScore = Math.floor(Math.random() * 20) + 55;
          const questionStats: Record<string, number> = {};
          exam.questions.forEach((q) => {
            questionStats[q.id] = Math.floor(Math.random() * 40) + 40;
          });
          
          // 五標（模擬）
          const top = Math.min(95, avgScore + 25 + Math.floor(Math.random() * 5));
          const front = Math.min(90, avgScore + 15 + Math.floor(Math.random() * 5));
          const average = avgScore;
          const back = Math.max(30, avgScore - 15 - Math.floor(Math.random() * 5));
          const bottom = Math.max(20, avgScore - 25 - Math.floor(Math.random() * 5));
          
          // 分數分布（模擬正態分佈）
          const distribution = [2, 3, 5, 8, 15, 22, 20, 13, 8, 4]; // 總和=100%
          
          mockGlobalStats[exam.id] = { 
            totalAttempts: attempts, 
            avgScore, 
            questionStats,
            top,
            front,
            average,
            back,
            bottom,
            distribution,
          };
        }
      });
    });
  }, []);

  const examMap = useMemo(
    () => new Map(exams.map((exam) => [exam.id, exam])),
    [exams]
  );

  const sortedResults = [...results].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const getExamTitle = (result: ExamResult) => {
    if (result.examId.startsWith("custom:")) {
      const customId = result.examId.replace("custom:", "");
      const customExam = mockDb.customExams?.find((e: any) => e.id === customId);
      if (customExam) return `🎯 ${customExam.title}`;
      return "🎯 主題練習";
    }
    const exam = examMap.get(result.examId);
    return exam?.title ?? result.examId;
  };

  const getExamTypeTag = (result: ExamResult) => {
    if (result.examId.startsWith("custom:")) {
      return { label: "主題練習", bg: "#ede9fe", color: "#7c3aed" };
    }
    const exam = examMap.get(result.examId);
    if (!exam) return null;
    const categoryLabels: Record<string, { label: string; bg: string; color: string }> = {
      school: { label: "段考", bg: "#dbeafe", color: "#1d4ed8" },
      junior_high: { label: "會考", bg: "#d1fae5", color: "#059669" },
      gsat: { label: "學測", bg: "#fef3c7", color: "#d97706" },
      ast: { label: "分科", bg: "#fee2e2", color: "#dc2626" },
    };
    return categoryLabels[exam.examCategory] ?? null;
  };

  // 檢查是否來自指派
  const getAssignmentInfo = (result: ExamResult) => {
    // 先檢查 result 是否有 assignmentId
    if (result.assignmentId) {
      const assignment = assignments.find((a) => a.id === result.assignmentId);
      return assignment || null;
    }
    // 否則檢查是否有指派此試卷給該學生
    if (!currentStudent) return null;
    const assignment = assignments.find(
      (a) => a.examId === result.examId && a.targetStudentIds.includes(currentStudent.id)
    );
    return assignment || null;
  };

  const getExam = (result: ExamResult) => examMap.get(result.examId);

  const getComparison = (result: ExamResult) => {
    const exam = examMap.get(result.examId);
    if (!exam || exam.examCategory !== "school") return null;
    const globalStats = mockGlobalStats[exam.id];
    if (!globalStats) return null;
    const myPct = result.total === 0 ? 0 : Math.round((result.score / result.total) * 100);
    const diff = myPct - globalStats.avgScore;
    
    // 判斷落在哪一標
    let level: string;
    let levelColor: string;
    if (myPct >= globalStats.top) {
      level = "頂標";
      levelColor = "#059669";
    } else if (myPct >= globalStats.front) {
      level = "前標";
      levelColor = "#10b981";
    } else if (myPct >= globalStats.average) {
      level = "均標";
      levelColor = "#3b82f6";
    } else if (myPct >= globalStats.back) {
      level = "後標";
      levelColor = "#f59e0b";
    } else {
      level = "底標";
      levelColor = "#ef4444";
    }
    
    return {
      myPct,
      avgPct: globalStats.avgScore,
      diff,
      totalAttempts: globalStats.totalAttempts,
      questionStats: globalStats.questionStats,
      top: globalStats.top,
      front: globalStats.front,
      average: globalStats.average,
      back: globalStats.back,
      bottom: globalStats.bottom,
      distribution: globalStats.distribution,
      level,
      levelColor,
    };
  };

  // 檢查是否可查看詳情
  const canViewDetails = (result: ExamResult) => {
    if (!result.id) return false;
    // 自訂試卷：檢查是否還存在於 mockDb
    if (result.examId.startsWith("custom:")) {
      const customId = result.examId.replace("custom:", "");
      return mockDb.customExams?.some((e: any) => e.id === customId) ?? false;
    }
    // 一般試卷：檢查試卷是否存在
    return examMap.has(result.examId);
  };

  return (
    <div className="stack">
      <h2 className="page-title">📊 答題紀錄</h2>

      {/* 歷次作答 */}
      <div className="card">
        <h3>每次作答 ({sortedResults.length} 筆)</h3>
        {sortedResults.length === 0 ? (
          <p className="muted">目前沒有作答紀錄。</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedResults.map((result) => {
              const pct = result.total === 0 ? 0 : Math.round((result.score / result.total) * 100);
              const typeTag = getExamTypeTag(result);
              const exam = getExam(result);
              const comparison = getComparison(result);
              const isExpanded = selectedResult?.id === result.id;
              const isCustom = result.examId.startsWith("custom:");
              const canView = canViewDetails(result);
              const assignmentInfo = getAssignmentInfo(result);

              return (
                <div
                  key={result.id ?? result.submittedAt}
                  style={{
                    border: assignmentInfo ? "2px solid #f59e0b" : "1px solid #e5e7eb",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: isExpanded ? "#f8fafc" : assignmentInfo ? "#fffbeb" : "#fff",
                  }}
                >
                  {/* 主要資訊列 */}
                  <div
                    style={{
                      padding: 16,
                      display: "grid",
                      gridTemplateColumns: isCustom 
                        ? "auto 1fr 80px auto" 
                        : "auto 1fr 80px 100px auto",
                      alignItems: "center",
                      gap: 16,
                      cursor: comparison ? "pointer" : "default",
                    }}
                    onClick={() => comparison && setSelectedResult(isExpanded ? null : result)}
                  >
                    {/* 類型標籤 */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {assignmentInfo && (
                        <span
                          style={{
                            background: "#fef3c7",
                            color: "#b45309",
                            padding: "6px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            display: "inline-block",
                          }}
                          title={`指派：${assignmentInfo.name}`}
                        >
                          📋 指派
                        </span>
                      )}
                      {typeTag && (
                        <span
                          style={{
                            background: typeTag.bg,
                            color: typeTag.color,
                            padding: "6px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            display: "inline-block",
                          }}
                        >
                          {typeTag.label}
                        </span>
                      )}
                    </div>

                    {/* 試卷名稱 */}
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getExamTitle(result)}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                        {new Date(result.submittedAt).toLocaleString()}
                        {assignmentInfo && (
                          <span style={{ marginLeft: 8, color: "#b45309" }}>
                            （來自：{assignmentInfo.name}）
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 分數 */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444" }}>
                        {pct}%
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {result.score}/{result.total}
                      </div>
                    </div>

                    {/* 與平均比較（段考才有） */}
                    {comparison && (
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: comparison.diff >= 0 ? "#10b981" : "#ef4444",
                          }}
                        >
                          {comparison.diff >= 0 ? "↑" : "↓"} {Math.abs(comparison.diff)}%
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          vs 平均 {comparison.avgPct}%
                        </div>
                      </div>
                    )}

                    {/* 操作按鈕 */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
                      {comparison && (
                        <span style={{ fontSize: 12, color: "#6b7280" }}>
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      )}
                      {canView && (
                        <button
                          className="btn ghost"
                          style={{ fontSize: 12, padding: "6px 12px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/student/results/${result.id}`);
                          }}
                        >
                          查看詳情
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 展開的全體統計（段考限定） */}
                  {isExpanded && comparison && exam && (
                    <div
                      style={{
                        padding: 20,
                        borderTop: "1px solid #e5e7eb",
                        background: "#f8fafc",
                      }}
                    >
                      {/* 五標與你的位置 */}
                      <h4 style={{ margin: "0 0 16px", fontSize: 14 }}>📈 五標分布與你的位置</h4>
                      <div
                        style={{
                          background: "#fff",
                          borderRadius: 12,
                          padding: 20,
                          marginBottom: 20,
                        }}
                      >
                        {/* 分數軸 */}
                        <div style={{ position: "relative", height: 120, marginBottom: 16 }}>
                          {/* 背景條 */}
                          <div
                            style={{
                              position: "absolute",
                              top: 50,
                              left: 0,
                              right: 0,
                              height: 20,
                              background: "linear-gradient(90deg, #fee2e2 0%, #fef3c7 25%, #dbeafe 50%, #d1fae5 75%, #dcfce7 100%)",
                              borderRadius: 10,
                            }}
                          />
                          
                          {/* 五標標記 */}
                          {[
                            { label: "底標", value: comparison.bottom, color: "#ef4444" },
                            { label: "後標", value: comparison.back, color: "#f59e0b" },
                            { label: "均標", value: comparison.average, color: "#3b82f6" },
                            { label: "前標", value: comparison.front, color: "#10b981" },
                            { label: "頂標", value: comparison.top, color: "#059669" },
                          ].map((item) => (
                            <div
                              key={item.label}
                              style={{
                                position: "absolute",
                                left: `${item.value}%`,
                                top: 20,
                                transform: "translateX(-50%)",
                                textAlign: "center",
                              }}
                            >
                              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>{item.label}</div>
                              <div
                                style={{
                                  width: 2,
                                  height: 40,
                                  background: item.color,
                                  margin: "0 auto",
                                }}
                              />
                              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: item.color }}>
                                {item.value}%
                              </div>
                            </div>
                          ))}
                          
                          {/* 你的位置 */}
                          <div
                            style={{
                              position: "absolute",
                              left: `${comparison.myPct}%`,
                              top: 35,
                              transform: "translateX(-50%)",
                              zIndex: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: comparison.levelColor,
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: 13,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                border: "3px solid #fff",
                              }}
                            >
                              你
                            </div>
                          </div>
                        </div>
                        
                        {/* 你的標籤 */}
                        <div style={{ textAlign: "center", marginTop: 8 }}>
                          <span
                            style={{
                              background: comparison.levelColor,
                              color: "#fff",
                              padding: "8px 20px",
                              borderRadius: 999,
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            你的成績：{comparison.myPct}% — 達到 {comparison.level}
                          </span>
                        </div>
                      </div>

                      {/* 統計數據 */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                        <div style={{ textAlign: "center", padding: 16, background: "#fff", borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>全體作答人數</div>
                          <div style={{ fontSize: 24, fontWeight: 700 }}>{comparison.totalAttempts}</div>
                        </div>
                        <div style={{ textAlign: "center", padding: 16, background: "#fff", borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>全體平均</div>
                          <div style={{ fontSize: 24, fontWeight: 700 }}>{comparison.avgPct}%</div>
                        </div>
                        <div style={{ textAlign: "center", padding: 16, background: "#fff", borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>你的成績</div>
                          <div style={{ fontSize: 24, fontWeight: 700, color: comparison.levelColor }}>
                            {comparison.myPct}%
                          </div>
                        </div>
                        <div style={{ textAlign: "center", padding: 16, background: "#fff", borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>預估排名</div>
                          <div style={{ fontSize: 24, fontWeight: 700 }}>
                            前 {Math.max(1, Math.round((1 - comparison.myPct / 100) * comparison.totalAttempts))} 名
                          </div>
                        </div>
                      </div>

                      {/* 分數分布直方圖 */}
                      <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>📊 分數分布</h4>
                      <div style={{ background: "#fff", borderRadius: 8, padding: 16, marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "flex-end", height: 100, gap: 4 }}>
                          {comparison.distribution.map((pct, i) => {
                            const rangeStart = i * 10;
                            const rangeEnd = (i + 1) * 10;
                            const isMyRange = comparison.myPct >= rangeStart && comparison.myPct < rangeEnd;
                            return (
                              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                                <div
                                  style={{
                                    height: `${pct * 4}px`,
                                    background: isMyRange ? comparison.levelColor : "#d1d5db",
                                    borderRadius: "4px 4px 0 0",
                                    transition: "all 0.3s",
                                    position: "relative",
                                  }}
                                >
                                  {isMyRange && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: -20,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: comparison.levelColor,
                                      }}
                                    >
                                      ▼ 你
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                          {comparison.distribution.map((_, i) => (
                            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#6b7280" }}>
                              {i * 10}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 各題正確率對比 */}
                      <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>📋 各題正確率對比</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {exam.questions.slice(0, 10).map((q, i) => {
                          const globalRate = comparison.questionStats[q.id] || 50;
                          const userAnswer = result.answers.find((a) => a.questionId === q.id);
                          const userCorrect = userAnswer?.isCorrect ?? false;

                          return (
                            <div
                              key={q.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "8px 12px",
                                background: "#fff",
                                borderRadius: 6,
                              }}
                            >
                              <span style={{ minWidth: 50, fontWeight: 500 }}>第 {i + 1} 題</span>
                              <div style={{ flex: 1, height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                                <div
                                  style={{
                                    width: `${globalRate}%`,
                                    height: "100%",
                                    background: globalRate >= 70 ? "#22c55e" : globalRate >= 50 ? "#f59e0b" : "#ef4444",
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 12, minWidth: 45 }}>{globalRate}%</span>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  background: userCorrect ? "#d1fae5" : "#fee2e2",
                                  color: userCorrect ? "#059669" : "#dc2626",
                                }}
                              >
                                {userCorrect ? "✓ 答對" : "✗ 答錯"}
                              </span>
                            </div>
                          );
                        })}
                        {exam.questions.length > 10 && (
                          <p className="muted" style={{ textAlign: "center", fontSize: 12 }}>
                            顯示前 10 題，點擊「查看詳情」查看完整分析
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 題型說明 */}
      <div className="card" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
        <h3 style={{ margin: "0 0 12px", color: "#92400e" }}>📝 題型說明</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>選擇題 / 是非題 / 填充題</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>系統自動批改，即時顯示結果</div>
          </div>
          <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>計算題 / 證明題</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>需手寫作答，支援 AI 輔助批改</div>
          </div>
          <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>應用題</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>複合題型，依評分標準給分</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: "#fef3c7", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 600, color: "#92400e" }}>AI 批改功能（開發中）</div>
            <div style={{ fontSize: 13, color: "#78350f" }}>
              針對手寫題、證明題等應用題型，可上傳答案圖片由 AI 進行初步批改與建議
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
