import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExamsBySchool } from "../data/api";
import type { Exam } from "../data/models";

export default function SchoolExamList() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [gradeFilter, setGradeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  useEffect(() => {
    if (!schoolId) return;
    getExamsBySchool(schoolId).then(setExams);
  }, [schoolId]);

  const grades = useMemo(
    () => Array.from(new Set(exams.map((exam) => exam.grade))),
    [exams]
  );

  const subjects = useMemo(
    () => Array.from(new Set(exams.map((exam) => exam.subject))),
    [exams]
  );

  const filteredExams = exams.filter((exam) => {
    if (gradeFilter && exam.grade !== gradeFilter) return false;
    if (subjectFilter && exam.subject !== subjectFilter) return false;
    return true;
  });

  return (
    <div className="stack">
      <h2 className="page-title">學校試卷列表</h2>
      <div className="card">
        <div className="split">
          <div className="form-grid">
            <label>年級</label>
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
            >
              <option value="">全部年級</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
          <div className="form-grid">
            <label>科目</label>
            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
            >
              <option value="">全部科目</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="card-grid">
        {filteredExams.map((exam) => (
          <div key={exam.id} className="card">
            <h3>{exam.title}</h3>
            <p className="muted">
              {exam.subject} · {exam.grade} · {exam.questions.length} 題
            </p>
            {exam.isPremium && <span className="badge premium">付費</span>}
            <div style={{ marginTop: 12 }}>
              <button
                className="btn ghost"
                onClick={() => navigate(`/student/exams/${exam.id}`)}
              >
                以學生模式開啟
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
