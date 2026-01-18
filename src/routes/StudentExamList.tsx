import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import PaymentModal from "../components/PaymentModal";
import { getExams, getSchools } from "../data/api";
import type { Exam, ExamCategory, School } from "../data/models";
import { useAuth } from "../hooks/useAuth";

const CATEGORY_LABELS: Record<ExamCategory, string> = {
  school: "學校段考",
  junior_high: "國中會考",
  gsat: "高中學測",
  ast: "高中分科測驗",
};

export default function StudentExamList() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [lockedExam, setLockedExam] = useState<Exam | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // 篩選狀態
  const [categoryFilter, setCategoryFilter] = useState<ExamCategory | "">("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [examNoFilter, setExamNoFilter] = useState("");

  const { plan, setPlan } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getExams(), getSchools()]).then(([examData, schoolData]) => {
      setExams(examData);
      setSchools(schoolData);
    });
  }, []);

  // 重置篩選器當類別變更時
  const handleCategoryChange = (newCategory: ExamCategory | "") => {
    setCategoryFilter(newCategory);
    setSchoolFilter("");
    setRegionFilter("");
    setSubjectFilter("");
    setGradeFilter("");
    setYearFilter("");
    setSemesterFilter("");
    setExamNoFilter("");
  };

  const handleOpenExam = (exam: Exam) => {
    if (exam.isPremium && plan !== "vip") {
      setLockedExam(exam);
      return;
    }
    navigate(`/student/exams/${exam.id}`);
  };

  // 依類別篩選的試卷
  const categoryExams = useMemo(() => {
    if (!categoryFilter) return exams;
    return exams.filter((exam) => exam.examCategory === categoryFilter);
  }, [exams, categoryFilter]);

  // 學校地圖與地區
  const schoolMap = useMemo(
    () => new Map(schools.map((school) => [school.id, school])),
    [schools]
  );

  const regions = useMemo(
    () => Array.from(new Set(schools.map((school) => school.region))),
    [schools]
  );

  const filteredSchools = useMemo(() => {
    if (!regionFilter) return schools;
    return schools.filter((school) => school.region === regionFilter);
  }, [schools, regionFilter]);

  // 動態選項
  const subjects = useMemo(
    () => Array.from(new Set(categoryExams.map((exam) => exam.subject))).sort(),
    [categoryExams]
  );
  const grades = useMemo(
    () => Array.from(new Set(categoryExams.map((exam) => exam.grade))),
    [categoryExams]
  );
  const years = useMemo(
    () => Array.from(new Set(categoryExams.map((exam) => exam.year))).sort((a, b) => b.localeCompare(a)),
    [categoryExams]
  );
  const semesters = useMemo(
    () =>
      Array.from(
        new Set(categoryExams.map((exam) => exam.semester).filter(Boolean))
      ) as string[],
    [categoryExams]
  );
  const examNos = useMemo(
    () =>
      Array.from(
        new Set(categoryExams.map((exam) => exam.examNo).filter(Boolean))
      ) as string[],
    [categoryExams]
  );

  // 最終篩選結果（按建立時間排序，最新的在前面）
  const filteredExams = useMemo(() => {
    const filtered = categoryExams.filter((exam) => {
      if (schoolFilter && exam.schoolId !== schoolFilter) return false;
      if (regionFilter && exam.schoolId) {
        const school = schoolMap.get(exam.schoolId);
        if (school && school.region !== regionFilter) return false;
      }
      if (subjectFilter && exam.subject !== subjectFilter) return false;
      if (gradeFilter && exam.grade !== gradeFilter) return false;
      if (yearFilter && exam.year !== yearFilter) return false;
      if (semesterFilter && exam.semester !== semesterFilter) return false;
      if (examNoFilter && exam.examNo !== examNoFilter) return false;
      return true;
    });
    // 按建立時間排序，最新的在前面
    return filtered.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [categoryExams, schoolFilter, regionFilter, subjectFilter, gradeFilter, yearFilter, semesterFilter, examNoFilter, schoolMap]);

  // 限制顯示數量以提升效能
  const displayExams = filteredExams.slice(0, 50);
  const hasMore = filteredExams.length > 50;

  return (
    <div className="stack">
      <h2 className="page-title">學生試題清單</h2>

      {/* 考試類別選擇 */}
      <div className="card">
        <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>考試類別</label>
        <div className="category-tabs">
          <button
            className={`category-tab ${categoryFilter === "" ? "active" : ""}`}
            onClick={() => handleCategoryChange("")}
          >
            全部
          </button>
          {(Object.keys(CATEGORY_LABELS) as ExamCategory[]).map((cat) => (
            <button
              key={cat}
              className={`category-tab ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* 篩選器 - 根據類別顯示不同選項 */}
      <div className="card">
        <div className="split">
          {/* 年度 - 所有類別都有 */}
          <div className="form-grid">
            <label>年度</label>
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
            >
              <option value="">全部年度</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}學年度
                </option>
              ))}
            </select>
          </div>

          {/* 科目 - 所有類別都有 */}
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

          {/* 學校段考專用篩選器 */}
          {(categoryFilter === "school" || categoryFilter === "") && (
            <>
              <div className="form-grid">
                <label>地區</label>
                <select
                  value={regionFilter}
                  onChange={(event) => {
                    setRegionFilter(event.target.value);
                    setSchoolFilter("");
                  }}
                >
                  <option value="">全部地區</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <label>學校</label>
                <select
                  value={schoolFilter}
                  onChange={(event) => setSchoolFilter(event.target.value)}
                >
                  <option value="">全部學校</option>
                  {filteredSchools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

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
                <label>學期</label>
                <select
                  value={semesterFilter}
                  onChange={(event) => setSemesterFilter(event.target.value)}
                >
                  <option value="">全部學期</option>
                  {semesters.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <label>第幾次段考</label>
                <select
                  value={examNoFilter}
                  onChange={(event) => setExamNoFilter(event.target.value)}
                >
                  <option value="">全部</option>
                  {examNos.map((examNo) => (
                    <option key={examNo} value={examNo}>
                      {examNo}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 結果計數 */}
      <div className="muted" style={{ padding: "0 4px" }}>
        共 {filteredExams.length} 份試卷
        {hasMore && `（顯示前 50 份，請使用篩選縮小範圍）`}
      </div>

      {/* 試卷列表 */}
      <div className="card-grid">
        {displayExams.map((exam) => {
          const school = exam.schoolId ? schoolMap.get(exam.schoolId) : null;
          // 檢查是否為新試卷（7天內建立）
          const isNew = exam.createdAt && 
            (Date.now() - new Date(exam.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
          return (
            <div key={exam.id} className="card" style={{ position: "relative" }}>
              {isNew && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                  }}
                >
                  🆕 新增
                </span>
              )}
              <div className="badge" style={{ marginBottom: 8 }}>
                {CATEGORY_LABELS[exam.examCategory]}
              </div>
              <h3>{exam.title}</h3>
              <p className="muted">
                {school ? `${school.name} · ` : ""}
                {exam.subject} · {exam.grade} · {exam.year}學年度
                {exam.semester ? ` ${exam.semester}` : ""}
                {exam.examNo ? ` ${exam.examNo}` : ""} · {exam.questions.length} 題
              </p>
              {exam.isPremium && <span className="badge premium">付費</span>}
              <div style={{ marginTop: 12 }}>
                <button className="btn" onClick={() => handleOpenExam(exam)}>
                  開始測驗
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExams.length === 0 && (
        <div className="card">
          <p className="muted">沒有符合條件的試卷，請調整篩選條件。</p>
        </div>
      )}

      {lockedExam && (
        <Modal
          title="升級後可使用付費試題"
          description={`${lockedExam.title} 目前為免費方案鎖定。`}
          primaryLabel="升級為 VIP"
          onPrimary={() => {
            setShowPayment(true);
          }}
          onSecondary={() => setLockedExam(null)}
        />
      )}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onPaid={() => {
          setPlan("vip");
          setShowPayment(false);
          setLockedExam(null);
        }}
      />
    </div>
  );
}
