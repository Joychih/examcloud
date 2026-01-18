import { useEffect, useMemo, useState } from "react";
import { getExams, getResults } from "../data/api";
import type { Exam, ExamResult } from "../data/models";

type TagStats = {
  tag: string;
  correct: number;
  total: number;
};

export default function StudentAnalysis() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    Promise.all([getResults(), getExams()]).then(([resultData, examData]) => {
      setResults(resultData);
      setExams(examData);
    });
  }, []);

  const mastery = useMemo(() => {
    const questionMap = new Map(
      exams.flatMap((exam) => exam.questions.map((q) => [q.id, q]))
    );
    const tagMap = new Map<string, TagStats>();
    results.forEach((result) => {
      result.answers.forEach((answer) => {
        const question = questionMap.get(answer.questionId);
        if (!question) return;
        question.tags.forEach((tag) => {
          const current = tagMap.get(tag) ?? { tag, correct: 0, total: 0 };
          current.total += 1;
          if (answer.isCorrect) current.correct += 1;
          tagMap.set(tag, current);
        });
      });
    });
    return Array.from(tagMap.values()).map((item) => ({
      ...item,
      mastery: item.total === 0 ? 0 : Math.round((item.correct / item.total) * 100),
    }));
  }, [results, exams]);

  const weakTags = [...mastery].sort((a, b) => a.mastery - b.mastery).slice(0, 3);

  return (
    <div className="stack">
      <h2 className="page-title">學習分析</h2>
      <div className="card">
        <h3>知識標籤熟練度</h3>
        {mastery.length === 0 ? (
          <p className="muted">完成試卷後即可看到熟練度資料。</p>
        ) : (
          <div className="stack">
            {mastery.map((tag) => (
              <div key={tag.tag}>
                <div className="inline" style={{ gap: 12 }}>
                  <strong>{tag.tag}</strong>
                  <span className="muted">{tag.mastery}% 熟練</span>
                </div>
                <div className="chart-bar">
                  <span style={{ width: `${tag.mastery}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card">
        <h3>弱項建議</h3>
        {weakTags.length === 0 ? (
          <p className="muted">目前尚無弱項建議。</p>
        ) : (
          <div>
            {weakTags.map((tag) => (
              <span key={tag.tag} className="tag">
                {tag.tag}（{tag.mastery}% 熟練）
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
