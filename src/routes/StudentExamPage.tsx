import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionBlock from "../components/QuestionBlock";
import { getExamById, postResult } from "../data/api";
import type { Exam } from "../data/models";
import { useAuth } from "../hooks/useAuth";

type AnswerState = Record<string, string>;

export default function StudentExamPage() {
  const { examId } = useParams();
  const { isVip, currentStudent } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitted, setSubmitted] = useState(false);
  const [correctness, setCorrectness] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!examId) return;
    getExamById(examId).then(setExam);
  }, [examId]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const scoreSummary = useMemo(() => {
    if (!exam) return { correct: 0, total: 0 };
    const correct = exam.questions.filter(
      (question) => correctness[question.id]
    ).length;
    return { correct, total: exam.questions.length };
  }, [exam, correctness]);

  const handleSubmit = async () => {
    if (!exam) return;
    const resultAnswers = exam.questions.map((question) => {
      const answer = answers[question.id] ?? "";
      const isCorrect = question.correctAnswer
        ? answer.trim().toLowerCase() ===
          question.correctAnswer.trim().toLowerCase()
        : false;
      return { questionId: question.id, answer, isCorrect };
    });

    const correctnessMap: Record<string, boolean> = {};
    resultAnswers.forEach((record) => {
      correctnessMap[record.questionId] = record.isCorrect;
    });

    setCorrectness(correctnessMap);
    setSubmitted(true);

    await postResult({
      examId: exam.id,
      schoolId: exam.schoolId,
      score: resultAnswers.filter((record) => record.isCorrect).length,
      total: exam.questions.length,
      answers: resultAnswers,
      submittedAt: new Date().toISOString(),
      userId: currentStudent?.id ?? "student-001",
    });
  };

  if (!exam) {
    return <p>載入試卷中...</p>;
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>{exam.title}</h2>
        <p className="muted">
          {exam.grade} · {exam.subject} · {exam.year}
        </p>
      </div>
      <div className="stack">
        {exam.questions.map((question, index) => (
          <QuestionBlock
            key={question.id}
            index={index}
            question={question}
            value={answers[question.id] ?? ""}
            onChange={handleAnswerChange}
            submitted={submitted}
            isCorrect={correctness[question.id]}
            showExplanation={submitted && isVip}
          />
        ))}
      </div>
      <div className="card">
        <button className="btn" onClick={handleSubmit}>
          送出作答
        </button>
        {submitted && (
          <div className="muted" style={{ marginTop: 12 }}>
            得分：{scoreSummary.correct} / {scoreSummary.total}
          </div>
        )}
      </div>
    </div>
  );
}
