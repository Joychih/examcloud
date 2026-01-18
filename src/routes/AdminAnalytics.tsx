import { useEffect, useMemo, useState } from "react";
import { getCustomExam, getExams, getResults, getStudents } from "../data/api";
import type { Exam, ExamResult, Question, StudentUser } from "../data/models";
import QuestionBlock from "../components/QuestionBlock";
import { mockDb } from "../data/mock";

const buckets = [
  { label: "0-59", min: 0, max: 59 },
  { label: "60-69", min: 60, max: 69 },
  { label: "70-79", min: 70, max: 79 },
  { label: "80-89", min: 80, max: 89 },
  { label: "90-100", min: 90, max: 100 },
];

export default function AdminAnalytics() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [classFilter, setClassFilter] = useState("");

  // 查看詳情的狀態
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [detailQuestions, setDetailQuestions] = useState<Question[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    Promise.all([getResults(), getExams(), getStudents()]).then(
      ([resultData, examData, studentData]) => {
        setResults(resultData);
        setExams(examData);
        setStudents(studentData);
      }
    );
  }, []);

  const examMap = useMemo(
    () => new Map(exams.map((exam) => [exam.id, exam])),
    [exams]
  );

  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students]
  );

  const classList = useMemo(() => {
    const classes = new Set(students.map((s) => s.className));
    return Array.from(classes).sort();
  }, [students]);

  const filteredResults = useMemo(() => {
    if (!classFilter) return results;
    return results.filter((r) => {
      const student = studentMap.get(r.userId || "");
      return student?.className === classFilter;
    });
  }, [results, classFilter, studentMap]);

  const distribution = useMemo(() => {
    const scores = filteredResults.map((result) =>
      result.total === 0 ? 0 : Math.round((result.score / result.total) * 100)
    );
    return buckets.map((bucket) => ({
      ...bucket,
      count: scores.filter(
        (score) => score >= bucket.min && score <= bucket.max
      ).length,
    }));
  }, [filteredResults]);

  const maxCount = Math.max(1, ...distribution.map((item) => item.count));

  // 查看詳情
  const handleViewDetail = async (result: ExamResult) => {
    setLoadingDetail(true);
    setSelectedResult(result);

    try {
      if (result.examId.startsWith("custom:")) {
        // 自訂試卷
        const customId = result.examId.replace("custom:", "");
        const customData = await getCustomExam(customId);
        if (customData) {
          setDetailQuestions(customData.questions);
        }
      } else {
        // 一般試卷
        const exam = examMap.get(result.examId);
        if (exam) {
          setDetailQuestions(exam.questions);
        }
      }
    } catch (e) {
      console.error("Error loading detail:", e);
    }

    setLoadingDetail(false);
  };

  const closeDetail = () => {
    setSelectedResult(null);
    setDetailQuestions([]);
  };

  // 取得試卷名稱
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

  // 取得答案對應表
  const answersMap = useMemo(() => {
    if (!selectedResult) return {};
    return selectedResult.answers.reduce<Record<string, string>>((acc, answer) => {
      acc[answer.questionId] = answer.answer;
      return acc;
    }, {});
  }, [selectedResult]);

  // 取得正確性對應表
  const correctnessMap = useMemo(() => {
    if (!selectedResult) return {};
    return selectedResult.answers.reduce<Record<string, boolean>>((acc, answer) => {
      acc[answer.questionId] = answer.isCorrect;
      return acc;
    }, {});
  }, [selectedResult]);

  return (
    <div className="stack">
      <h2 className="page-title">📊 系統分析</h2>

      {/* 篩選器 */}
      <div className="card">
        <h3>篩選條件</h3>
        <div className="inline" style={{ gap: 16 }}>
          <label>
            <span style={{ marginRight: 8 }}>班級：</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={{ padding: "8px 12px" }}
            >
              <option value="">全部班級</option>
              {classList.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* 分數分佈 */}
      <div className="card">
        <h3>分數分佈 {classFilter && `（${classFilter}）`}</h3>
        <div className="stack">
          {distribution.map((item) => (
            <div key={item.label}>
              <div className="inline" style={{ gap: 12 }}>
                <strong>{item.label}</strong>
                <span className="muted">{item.count} 筆</span>
              </div>
              <div className="chart-bar">
                <span style={{ width: `${(item.count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 答題紀錄列表 */}
      <div className="card">
        <h3>答題紀錄 ({filteredResults.length} 筆)</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>答題者</th>
                <th>班級</th>
                <th>試卷名稱</th>
                <th>分數</th>
                <th>送出時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults
                .sort(
                  (a, b) =>
                    new Date(b.submittedAt).getTime() -
                    new Date(a.submittedAt).getTime()
                )
                .map((result, index) => {
                  const student = studentMap.get(result.userId || "");
                  const pctScore =
                    result.total === 0
                      ? 0
                      : Math.round((result.score / result.total) * 100);
                  const isCustom = result.examId.startsWith("custom:");
                  return (
                    <tr key={result.id ?? `${result.examId}-${index}`}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{student?.name ?? result.userId ?? "未知"}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{student?.school ?? ""}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: "#e0e7ff",
                            color: "#4338ca",
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                          }}
                        >
                          {student?.className ?? "-"}
                        </span>
                      </td>
                      <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isCustom && <span style={{ marginRight: 4 }}>🎯</span>}
                        {getExamTitle(result)}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{result.score}/{result.total}</span>
                          <span
                            style={{
                              background: pctScore >= 80 ? "#d1fae5" : pctScore >= 60 ? "#fef3c7" : "#fee2e2",
                              color: pctScore >= 80 ? "#059669" : pctScore >= 60 ? "#d97706" : "#dc2626",
                              padding: "4px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {pctScore}%
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: "#6b7280" }}>
                        {new Date(result.submittedAt).toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="btn ghost"
                          style={{ fontSize: 12, padding: "6px 12px" }}
                          onClick={() => handleViewDetail(result)}
                        >
                          📋 查看詳情
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳情 Modal */}
      {selectedResult && (
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
          onClick={closeDetail}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 900,
              width: "100%",
              maxHeight: "calc(100vh - 80px)",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 標題區 */}
            <div
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                padding: "24px 32px",
                color: "#fff",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <span
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        padding: "4px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                      }}
                    >
                      👤 學生答題紀錄
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>
                    {studentMap.get(selectedResult.userId || "")?.name ?? selectedResult.userId ?? "未知學生"}
                  </h2>
                  <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: 14 }}>
                    {getExamTitle(selectedResult)}
                  </p>
                </div>
                <button
                  onClick={closeDetail}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "#fff",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* 成績摘要 */}
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  marginTop: 16,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>得分</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {selectedResult.score}/{selectedResult.total}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>正確率</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {selectedResult.total === 0 ? 0 : Math.round((selectedResult.score / selectedResult.total) * 100)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>送出時間</div>
                  <div style={{ fontSize: 14 }}>
                    {new Date(selectedResult.submittedAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>學生資訊</div>
                  <div style={{ fontSize: 14 }}>
                    {studentMap.get(selectedResult.userId || "")?.className ?? "-"} · 
                    {studentMap.get(selectedResult.userId || "")?.grade ?? "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* 題目內容 */}
            <div style={{ padding: "24px 32px" }}>
              {loadingDetail ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <p>載入題目中...</p>
                </div>
              ) : detailQuestions.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <p className="muted">無法載入題目資料，該試卷可能已被刪除。</p>
                </div>
              ) : (
                <div className="stack">
                  {detailQuestions.map((question, index) => (
                    <QuestionBlock
                      key={question.id}
                      index={index}
                      question={question}
                      value={answersMap[question.id] ?? ""}
                      submitted
                      readOnly
                      isCorrect={correctnessMap[question.id]}
                      showExplanation={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 底部操作 */}
            <div
              style={{
                padding: "16px 32px",
                borderTop: "1px solid #e5e7eb",
                position: "sticky",
                bottom: 0,
                background: "#fff",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button className="btn" onClick={closeDetail}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
