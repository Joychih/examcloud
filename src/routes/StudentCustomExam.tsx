import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomExam, postResult } from "../data/api";
import type { AnswerRecord, CustomExam, Question } from "../data/models";
import QuestionBlock from "../components/QuestionBlock";
import { useAuth } from "../hooks/useAuth";

export default function StudentCustomExam() {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<CustomExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isVip, currentStudent } = useAuth();

  useEffect(() => {
    if (!examId) return;
    getCustomExam(examId).then((data) => {
      if (data) {
        setExam(data.exam);
        setQuestions(data.questions);
      }
      setLoading(false);
    });
  }, [examId]);

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!exam) return;
    
    const answerRecords: AnswerRecord[] = questions.map((q) => {
      const userAnswer = answers[q.id] ?? "";
      return {
        questionId: q.id,
        answer: userAnswer,
        isCorrect: userAnswer === q.correctAnswer,
      };
    });

    const score = answerRecords.filter((a) => a.isCorrect).length;

    await postResult({
      examId: `custom:${exam.id}`,
      score,
      total: questions.length,
      answers: answerRecords,
      submittedAt: new Date().toISOString(),
      userId: currentStudent?.id ?? "student-001",
    });

    setSubmitted(true);
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  };

  if (loading) {
    return (
      <div className="stack">
        <h2 className="page-title">載入中...</h2>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="stack">
        <h2 className="page-title">找不到試卷</h2>
        <div className="card">
          <p>此試卷不存在或已過期。</p>
          <button className="btn" onClick={() => navigate("/student/topics")}>
            返回主題搜題
          </button>
        </div>
      </div>
    );
  }

  const difficultyLabels: Record<string, string> = {
    easy: "基礎",
    medium: "中階",
    hard: "進階",
    mixed: "混合",
  };

  return (
    <div className="stack">
      {/* 試卷標題 */}
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          borderRadius: 16,
          padding: "24px 32px",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 12,
            }}
          >
            🎯 主題練習
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 12,
            }}
          >
            {difficultyLabels[exam.difficulty]}
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: 24 }}>{exam.title}</h2>
        <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
          章節：{exam.chapter} ｜ 共 {questions.length} 題
        </p>
      </div>

      {/* 成績摘要 */}
      {submitted && (
        <div
          className="card"
          style={{
            background:
              getScore() / questions.length >= 0.8
                ? "#f0fdf4"
                : getScore() / questions.length >= 0.6
                ? "#fffbeb"
                : "#fef2f2",
            border:
              getScore() / questions.length >= 0.8
                ? "2px solid #22c55e"
                : getScore() / questions.length >= 0.6
                ? "2px solid #f59e0b"
                : "2px solid #ef4444",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 8 }}>
              {getScore()} / {questions.length}
            </div>
            <div style={{ fontSize: 24, marginBottom: 16 }}>
              正確率：{Math.round((getScore() / questions.length) * 100)}%
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn ghost" onClick={() => navigate("/student/topics")}>
                返回主題搜題
              </button>
              <button className="btn ghost" onClick={() => navigate("/student/records")}>
                查看答題紀錄
              </button>
              <button
                className="btn"
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({});
                }}
              >
                重新作答
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 題目列表 */}
      <div className="stack">
        {questions.map((question, index) => {
          const userAnswer = answers[question.id] ?? "";
          const isCorrect = submitted ? userAnswer === question.correctAnswer : undefined;
          return (
            <QuestionBlock
              key={question.id}
              index={index}
              question={question}
              value={userAnswer}
              onChange={handleChange}
              submitted={submitted}
              isCorrect={isCorrect}
              showExplanation={isVip}
              readOnly={submitted}
            />
          );
        })}
      </div>

      {/* 提交按鈕 */}
      {!submitted && (
        <div className="card" style={{ position: "sticky", bottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              已作答：{Object.keys(answers).filter((k) => answers[k]).length} / {questions.length}
            </div>
            <button className="btn" onClick={handleSubmit}>
              📝 提交試卷
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
