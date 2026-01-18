import { useEffect, useState } from "react";
import { getExams, getResults } from "../data/api";
import type { Exam, ExamResult } from "../data/models";

export default function AdminDashboard() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    Promise.all([getResults(), getExams()]).then(([resultData, examData]) => {
      setResults(resultData);
      setExams(examData);
    });
  }, []);

  const totalStudents = new Set(results.map((result) => result.userId)).size;

  return (
    <div className="stack">
      <h2 className="page-title">管理總覽</h2>
      <div className="card-grid">
        <div className="card">
          <h3>學生總數</h3>
          <p>{totalStudents || 0}</p>
        </div>
        <div className="card">
          <h3>結果總數</h3>
          <p>{results.length}</p>
        </div>
        <div className="card">
          <h3>試卷總數</h3>
          <p>{exams.length}</p>
        </div>
      </div>
    </div>
  );
}
