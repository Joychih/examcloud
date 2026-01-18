import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionBlock from "../components/QuestionBlock";
import { getCustomExam, getExamById, getResults } from "../data/api";
import type { Exam, ExamResult, Question } from "../data/models";
import { useAuth } from "../hooks/useAuth";

export default function StudentResultPage() {
  const { resultId } = useParams();
  const { isVip } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [correctness, setCorrectness] = useState<Record<string, boolean>>({});
  const [isCustomExam, setIsCustomExam] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  useEffect(() => {
    if (!resultId) return;
    getResults().then((resultData) => {
      const found = resultData.find((item) => item.id === resultId) ?? null;
      setResult(found);
      if (found) {
        // 判斷是否為自訂試卷
        if (found.examId.startsWith("custom:")) {
          setIsCustomExam(true);
          const customId = found.examId.replace("custom:", "");
          getCustomExam(customId).then((data) => {
            if (data) {
              setCustomTitle(data.exam.title);
              setCustomQuestions(data.questions);
            }
          });
        } else {
          setIsCustomExam(false);
          getExamById(found.examId).then(setExam);
        }
        const correctnessMap: Record<string, boolean> = {};
        found.answers.forEach((answer) => {
          correctnessMap[answer.questionId] = answer.isCorrect;
        });
        setCorrectness(correctnessMap);
      }
    });
  }, [resultId]);

  const answersMap = useMemo(() => {
    if (!result) return {};
    return result.answers.reduce<Record<string, string>>((acc, answer) => {
      acc[answer.questionId] = answer.answer;
      return acc;
    }, {});
  }, [result]);

  // 取得題目列表
  const questions = isCustomExam ? customQuestions : (exam?.questions ?? []);
  const title = isCustomExam ? customTitle : exam?.title;

  if (!result || (isCustomExam ? customQuestions.length === 0 : !exam)) {
    return (
      <div className="stack">
        <div className="card">
          <p>載入作答紀錄中...</p>
        </div>
      </div>
    );
  }

  const pct = result.total === 0 ? 0 : Math.round((result.score / result.total) * 100);

  return (
    <div className="stack">
      {/* 試卷資訊 */}
      <div
        className="card"
        style={{
          background: isCustomExam
            ? "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)"
            : "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
          border: isCustomExam ? "2px solid #8b5cf6" : "2px solid #10b981",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  background: isCustomExam ? "#8b5cf6" : "#10b981",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {isCustomExam ? "🎯 主題練習" : "📝 段考"}
              </span>
            </div>
            <h2 style={{ margin: "0 0 8px", color: isCustomExam ? "#5b21b6" : "#065f46" }}>
              {title}
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              {!isCustomExam && exam && (
                <>
                  {exam.grade} · {exam.subject} · {exam.year}
                  {exam.semester ? ` ${exam.semester}` : ""}
                  <br />
                </>
              )}
              送出時間：{new Date(result.submittedAt).toLocaleString()}
            </p>
          </div>
          <div
            style={{
              textAlign: "center",
              background: "#fff",
              padding: "16px 24px",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444",
              }}
            >
              {pct}%
            </div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>
              {result.score} / {result.total} 題
            </div>
          </div>
        </div>
      </div>

      {/* 答題詳情 */}
      <div className="stack">
        {questions.map((question, index) => (
          <QuestionBlock
            key={question.id}
            index={index}
            question={question}
            value={answersMap[question.id] ?? ""}
            submitted
            readOnly
            isCorrect={correctness[question.id]}
            showExplanation={isVip}
          />
        ))}
      </div>

      {/* 底部操作 */}
      <div className="card" style={{ position: "sticky", bottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontWeight: 600 }}>
              答對 {result.score} 題，答錯 {result.total - result.score} 題
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn ghost" onClick={() => navigate("/student/records")}>
              ← 返回答題紀錄
            </button>
            {isCustomExam && (
              <button className="btn ghost" onClick={() => navigate("/student/topics")}>
                繼續練習
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
