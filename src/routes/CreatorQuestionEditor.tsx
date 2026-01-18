import { useEffect, useState } from "react";
import { addQuestion, getExams, getSchools, upsertExam, updateQuestion } from "../data/api";
import type { Exam, ExamCategory, Question, QuestionType, School } from "../data/models";
import Latex from "../components/Latex";

// 預設選項
const examCategoryOptions = [
  { value: "school", label: "📝 學校段考" },
  { value: "junior_high", label: "🏫 國中會考" },
  { value: "gsat", label: "📚 高中學測" },
  { value: "ast", label: "🎯 高中分科測驗" },
];
const gradeOptions = ["高一", "高二", "高三"];
const juniorGradeOptions = ["國一", "國二", "國三"];
const subjectOptions = ["數學", "數A", "數B", "數甲", "數乙"];
const gsatSubjectOptions = ["數學A", "數學B"];
const astSubjectOptions = ["數學甲", "數學乙"];
const juniorSubjectOptions = ["數學"];
const yearOptions = ["110", "111", "112", "113", "114"];
const semesterOptions = ["上學期", "下學期"];
const examNoOptions = ["第一次", "第二次", "第三次"];
const difficultyOptions = [
  { value: "easy", label: "簡單" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困難" },
];
const typeOptions = [
  { value: "MCQ", label: "選擇題" },
  { value: "TF", label: "是非題" },
  { value: "Fill", label: "填充題" },
];
const chapterTagOptions = [
  "數與式", "多項式", "三角函數", "向量", "平面向量", "圓與球",
  "統計", "機率", "極限", "微分", "積分", "指數與對數",
  "數列與級數", "排列組合", "矩陣", "複數", "空間向量", "應用數學"
];

// 快速測試題目範本
const quickTestQuestions = [
  {
    label: "因式分解",
    type: "MCQ" as QuestionType,
    content: "將 $x^2 + 5x + 6$ 因式分解後為？",
    options: ["$(x+2)(x+3)$", "$(x+1)(x+6)$", "$(x-2)(x-3)$", "$(x+2)(x-3)$"],
    correctAnswer: "$(x+2)(x+3)$",
    textExplanation: "找兩數相乘為 6、相加為 5 的數，即 2 和 3。所以 $x^2 + 5x + 6 = (x+2)(x+3)$。",
    chapterTag: "多項式",
    difficulty: "easy" as const,
  },
  {
    label: "三角函數",
    type: "MCQ" as QuestionType,
    content: "在直角三角形中，若 $\\sin\\theta = \\frac{3}{5}$，則 $\\cos\\theta = $？",
    options: ["$\\frac{4}{5}$", "$\\frac{3}{4}$", "$\\frac{5}{4}$", "$\\frac{5}{3}$"],
    correctAnswer: "$\\frac{4}{5}$",
    textExplanation: "由 $\\sin^2\\theta + \\cos^2\\theta = 1$，得 $\\cos^2\\theta = 1 - \\frac{9}{25} = \\frac{16}{25}$，故 $\\cos\\theta = \\frac{4}{5}$。",
    chapterTag: "三角函數",
    difficulty: "easy" as const,
  },
  {
    label: "機率",
    type: "MCQ" as QuestionType,
    content: "擲一顆公正骰子，出現偶數的機率為？",
    options: ["$\\frac{1}{2}$", "$\\frac{1}{3}$", "$\\frac{2}{3}$", "$\\frac{1}{6}$"],
    correctAnswer: "$\\frac{1}{2}$",
    textExplanation: "偶數有 2、4、6 共 3 個，總共 6 個結果，機率 = $\\frac{3}{6} = \\frac{1}{2}$。",
    chapterTag: "機率",
    difficulty: "easy" as const,
  },
  {
    label: "是非題",
    type: "TF" as QuestionType,
    content: "若 $a < b$ 且 $c < 0$，則 $ac > bc$。",
    options: [],
    correctAnswer: "是",
    textExplanation: "不等式兩邊同乘負數，不等號方向改變。原式 $a < b$，乘以 $c < 0$ 後變成 $ac > bc$。",
    chapterTag: "數與式",
    difficulty: "easy" as const,
  },
  {
    label: "填充題",
    type: "Fill" as QuestionType,
    content: "若 $2^x = 32$，則 $x = $",
    options: [],
    correctAnswer: "5",
    textExplanation: "$2^x = 32 = 2^5$，故 $x = 5$。",
    chapterTag: "指數與對數",
    difficulty: "easy" as const,
  },
];

type ExamFormState = {
  id: string;
  title: string;
  examCategory: ExamCategory;
  school: string;
  schoolName: string;  // 手動輸入學校名稱
  useCustomSchool: boolean;  // 是否使用手動輸入
  grade: string;
  year: string;
  semester: string;
  examNo: string;
  subject: string;
  isPremium: boolean;
};

type QuestionFormState = {
  id?: string;
  content: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  textExplanation: string;
  videoExplanations: string[];
  chapterTag: string;
  difficulty: "easy" | "medium" | "hard";
  isEditing?: boolean;
};

const emptyQuestion = (): QuestionFormState => ({
  content: "",
  type: "MCQ",
  options: ["", "", "", ""],
  correctAnswer: "",
  textExplanation: "",
  videoExplanations: [""],
  chapterTag: "多項式",
  difficulty: "medium",
  isEditing: true,
});

export default function CreatorQuestionEditor() {
  const [schools, setSchools] = useState<School[]>([]);
  const [existingExams, setExistingExams] = useState<Exam[]>([]);
  const [examForm, setExamForm] = useState<ExamFormState>({
    id: "",
    title: "",
    examCategory: "school",
    school: "",
    schoolName: "",
    useCustomSchool: false,
    grade: "高一",
    year: "114",
    semester: "上學期",
    examNo: "第一次",
    subject: "數學",
    isPremium: false,
  });
  const [questions, setQuestions] = useState<QuestionFormState[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [status, setStatus] = useState<string>("");
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    Promise.all([getSchools(), getExams()]).then(([schoolData, examData]) => {
      setSchools(schoolData);
      setExistingExams(examData);
      const testSchool = schoolData.find((s) => s.id === "test01");
      if (testSchool) {
        setExamForm((prev) => ({ ...prev, school: testSchool.id }));
      } else if (schoolData.length > 0) {
        setExamForm((prev) => ({ ...prev, school: schoolData[0].id }));
      }
    });
  }, []);

  // 自動生成標題
  useEffect(() => {
    let title = "";
    const schoolObj = schools.find((s) => s.id === examForm.school);
    const schoolName = examForm.useCustomSchool ? examForm.schoolName : (schoolObj?.name ?? "");

    if (examForm.examCategory === "school") {
      title = `${schoolName} ${examForm.year}學年度${examForm.semester}${examForm.grade}${examForm.subject}${examForm.examNo}段考`;
    } else if (examForm.examCategory === "junior_high") {
      title = `${examForm.year}學年度國中教育會考 ${examForm.subject}`;
    } else if (examForm.examCategory === "gsat") {
      title = `${examForm.year}學年度學科能力測驗 ${examForm.subject}`;
    } else if (examForm.examCategory === "ast") {
      title = `${examForm.year}學年度分科測驗 ${examForm.subject}`;
    }
    setExamForm((prev) => ({ ...prev, title }));
  }, [examForm.examCategory, examForm.school, examForm.schoolName, examForm.useCustomSchool, examForm.year, examForm.semester, examForm.grade, examForm.subject, examForm.examNo, schools]);

  // 切換考試類別時重設相關欄位
  const handleCategoryChange = (category: ExamCategory) => {
    let subject = examForm.subject;
    let grade = examForm.grade;

    if (category === "junior_high") {
      subject = "數學";
      grade = "國三";
    } else if (category === "gsat") {
      subject = "數學A";
      grade = "高三";
    } else if (category === "ast") {
      subject = "數學甲";
      grade = "高三";
    } else {
      subject = "數學";
      grade = "高一";
    }

    setExamForm((prev) => ({
      ...prev,
      examCategory: category,
      subject,
      grade,
    }));
  };

  const handleSelectExam = (examId: string) => {
    const exam = existingExams.find((e) => e.id === examId);
    if (exam) {
      setActiveExam(exam);
      setExamForm({
        id: exam.id,
        title: exam.title,
        examCategory: exam.examCategory,
        school: exam.schoolId ?? "",
        schoolName: "",
        useCustomSchool: false,
        grade: exam.grade,
        year: exam.year,
        semester: exam.semester ?? "上學期",
        examNo: exam.examNo ?? "第一次",
        subject: exam.subject,
        isPremium: exam.isPremium,
      });
      setQuestions(exam.questions.map((q) => ({
        id: q.id,
        content: q.content,
        type: q.type,
        options: q.options ?? ["", "", "", ""],
        correctAnswer: q.correctAnswer,
        textExplanation: q.textExplanation,
        videoExplanations: q.videoUrl ? [q.videoUrl] : [""],
        chapterTag: q.tags[0] ?? "多項式",
        difficulty: q.difficulty,
        isEditing: false,
      })));
      setStep(2);
      setStatus(`已選擇試卷：${exam.title}`);
    }
  };

  const handleCreateExam = async () => {
    if (examForm.examCategory === "school" && !examForm.school && !examForm.schoolName) {
      setStatus("⚠️ 請選擇學校或手動輸入學校名稱");
      return;
    }

    const schoolObj = schools.find((s) => s.id === examForm.school);

    const exam = await upsertExam({
      id: examForm.id || undefined,
      title: examForm.title,
      examCategory: examForm.examCategory,
      grade: examForm.grade,
      year: examForm.year,
      semester: examForm.examCategory === "school" ? examForm.semester : undefined,
      examNo: examForm.examCategory === "school" ? examForm.examNo : undefined,
      subject: examForm.subject,
      isPremium: examForm.isPremium,
      schoolId: examForm.examCategory === "school" ? (examForm.useCustomSchool ? undefined : examForm.school) : undefined,
      // 如果是手動輸入學校，把學校名稱存到 title 裡
    });
    setActiveExam(exam);
    const updatedExams = await getExams();
    setExistingExams(updatedExams);
    setStep(2);
    if (questions.length === 0) {
      setQuestions([emptyQuestion()]);
    }
    setStatus(`✅ 試卷已建立：${exam.title}`);
  };

  const handleAddNewQuestion = () => {
    setQuestions([...questions, emptyQuestion()]);
  };

  const updateQuestionField = (index: number, field: keyof QuestionFormState, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const handleQuickFill = (qIndex: number, templateIndex: number) => {
    const t = quickTestQuestions[templateIndex];
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              type: t.type,
              content: t.content,
              options: t.options.length > 0 ? [...t.options] : ["", "", "", ""],
              correctAnswer: t.correctAnswer,
              textExplanation: t.textExplanation,
              chapterTag: t.chapterTag,
              difficulty: t.difficulty,
            }
          : q
      )
    );
  };

  const handleDeleteQuestion = (index: number) => {
    if (confirm("確定要刪除這題嗎？")) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const addVideoExplanation = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, videoExplanations: [...q.videoExplanations, ""] }
          : q
      )
    );
  };

  const updateVideoExplanation = (qIndex: number, vIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              videoExplanations: q.videoExplanations.map((v, vi) =>
                vi === vIndex ? value : v
              ),
            }
          : q
      )
    );
  };

  const handleSaveAll = async () => {
    if (!activeExam) {
      setStatus("⚠️ 請先建立試卷");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const q of questions) {
      if (!q.content.trim()) continue;

      const tags = [q.chapterTag].filter(Boolean);
      const options = q.type === "TF" ? undefined : q.options.filter(Boolean);
      const videoUrl = q.videoExplanations.filter(Boolean)[0];

      try {
        if (q.id) {
          await updateQuestion(q.id, {
            type: q.type,
            content: q.content,
            options,
            correctAnswer: q.correctAnswer,
            textExplanation: q.textExplanation,
            videoUrl,
            tags,
            difficulty: q.difficulty,
          });
        } else {
          const created = await addQuestion(activeExam.id, {
            type: q.type,
            content: q.content,
            options,
            correctAnswer: q.correctAnswer,
            textExplanation: q.textExplanation,
            videoUrl,
            tags,
            difficulty: q.difficulty,
          });
          q.id = created.id;
        }
        successCount++;
      } catch (e) {
        failCount++;
      }
    }

    const updatedExams = await getExams();
    setExistingExams(updatedExams);
    const updatedExam = updatedExams.find((e) => e.id === activeExam.id);
    if (updatedExam) setActiveExam(updatedExam);

    setStatus(`✅ 儲存完成！成功 ${successCount} 題${failCount > 0 ? `，失敗 ${failCount} 題` : ""}`);
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  // 根據考試類別取得對應的科目選項
  const getSubjectOptions = () => {
    switch (examForm.examCategory) {
      case "junior_high":
        return juniorSubjectOptions;
      case "gsat":
        return gsatSubjectOptions;
      case "ast":
        return astSubjectOptions;
      default:
        return subjectOptions;
    }
  };

  // 根據考試類別取得對應的年級選項
  const getGradeOptions = () => {
    switch (examForm.examCategory) {
      case "junior_high":
        return juniorGradeOptions;
      default:
        return gradeOptions;
    }
  };

  return (
    <div className="stack">
      <h2 className="page-title">題目編輯器</h2>

      {/* 步驟指示 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: step === 1 ? "var(--primary)" : "#e5e7eb",
            color: step === 1 ? "#fff" : "#6b7280",
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={handleBackToStep1}
        >
          ① 試卷資訊
        </div>
        <div
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: step === 2 ? "var(--primary)" : "#e5e7eb",
            color: step === 2 ? "#fff" : "#6b7280",
            fontWeight: 600,
            opacity: activeExam ? 1 : 0.5,
          }}
        >
          ② 新增題目
        </div>
      </div>

      {step === 1 && (
        <>
          {/* 選擇現有試卷 */}
          <div className="card">
            <h3>📂 選擇現有試卷</h3>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={activeExam?.id ?? ""}
                onChange={(e) => handleSelectExam(e.target.value)}
                style={{ flex: 1, minWidth: 300 }}
              >
                <option value="">-- 選擇試卷或建立新試卷 --</option>
                {existingExams.slice(0, 100).map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.questions.length} 題)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 試卷資訊表單 */}
          <div className="card">
            <h3>📝 新增試卷</h3>

            {/* 考試類別選擇 */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>考試類別 *</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {examCategoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    className={`btn ${examForm.examCategory === cat.value ? "" : "ghost"}`}
                    style={{
                      padding: "12px 20px",
                      border: examForm.examCategory === cat.value ? "2px solid var(--primary)" : "2px solid #e5e7eb",
                    }}
                    onClick={() => handleCategoryChange(cat.value as ExamCategory)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 根據考試類別顯示不同欄位 */}
            {examForm.examCategory === "school" && (
              <div style={{ marginBottom: 20, padding: 16, background: "#f0fdf4", borderRadius: 12, border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#166534", marginBottom: 12 }}>🏫 學校段考設定</div>
                
                {/* 學校選擇方式 */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <input
                      type="radio"
                      checked={!examForm.useCustomSchool}
                      onChange={() => setExamForm((prev) => ({ ...prev, useCustomSchool: false }))}
                    />
                    <span>從列表選擇學校</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      checked={examForm.useCustomSchool}
                      onChange={() => setExamForm((prev) => ({ ...prev, useCustomSchool: true }))}
                    />
                    <span>手動輸入學校名稱</span>
                  </label>
                </div>

                {!examForm.useCustomSchool ? (
                  <label style={{ display: "block", marginBottom: 12 }}>
                    <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>選擇學校</span>
                    <select
                      value={examForm.school}
                      onChange={(e) => setExamForm((prev) => ({ ...prev, school: e.target.value }))}
                      style={{ width: "100%" }}
                    >
                      <option value="">請選擇學校</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.region})</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label style={{ display: "block", marginBottom: 12 }}>
                    <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>學校名稱</span>
                    <input
                      type="text"
                      value={examForm.schoolName}
                      onChange={(e) => setExamForm((prev) => ({ ...prev, schoolName: e.target.value }))}
                      placeholder="例如：台北市立建國高級中學"
                      style={{ width: "100%" }}
                    />
                  </label>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                  <label>
                    <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>年級</span>
                    <select
                      value={examForm.grade}
                      onChange={(e) => setExamForm((prev) => ({ ...prev, grade: e.target.value }))}
                      style={{ width: "100%" }}
                    >
                      {getGradeOptions().map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>科目</span>
                    <select
                      value={examForm.subject}
                      onChange={(e) => setExamForm((prev) => ({ ...prev, subject: e.target.value }))}
                      style={{ width: "100%" }}
                    >
                      {getSubjectOptions().map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>學年度</span>
                    <select
                      value={examForm.year}
                      onChange={(e) => setExamForm((prev) => ({ ...prev, year: e.target.value }))}
                      style={{ width: "100%" }}
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}學年度</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>學期</span>
                    <select
                      value={examForm.semester}
                      onChange={(e) => setExamForm((prev) => ({ ...prev, semester: e.target.value }))}
                      style={{ width: "100%" }}
                    >
                      {semesterOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>段考次數</span>
                    <select
                      value={examForm.examNo}
                      onChange={(e) => setExamForm((prev) => ({ ...prev, examNo: e.target.value }))}
                      style={{ width: "100%" }}
                    >
                      {examNoOptions.map((n) => (
                        <option key={n} value={n}>{n}段考</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}

            {(examForm.examCategory === "junior_high" || examForm.examCategory === "gsat" || examForm.examCategory === "ast") && (
              <div style={{ 
                marginBottom: 20, 
                padding: 16, 
                background: examForm.examCategory === "junior_high" ? "#ecfdf5" : examForm.examCategory === "gsat" ? "#fef3c7" : "#fee2e2", 
                borderRadius: 12, 
                border: `1px solid ${examForm.examCategory === "junior_high" ? "#a7f3d0" : examForm.examCategory === "gsat" ? "#fde68a" : "#fecaca"}` 
              }}>
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: examForm.examCategory === "junior_high" ? "#166534" : examForm.examCategory === "gsat" ? "#92400e" : "#991b1b", 
                  marginBottom: 12 
                }}>
                  {examForm.examCategory === "junior_high" && "🏫 國中教育會考設定"}
                  {examForm.examCategory === "gsat" && "📚 學科能力測驗設定"}
                  {examForm.examCategory === "ast" && "🎯 分科測驗設定"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                  <label>
                    <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>學年度</span>
                    <select
                      value={examForm.year}
                      onChange={(e) => setExamForm((prev) => ({ ...prev, year: e.target.value }))}
                      style={{ width: "100%" }}
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}學年度</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>科目</span>
                    <select
                      value={examForm.subject}
                      onChange={(e) => setExamForm((prev) => ({ ...prev, subject: e.target.value }))}
                      style={{ width: "100%" }}
                    >
                      {getSubjectOptions().map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* 自動生成標題 */}
            <div style={{ marginBottom: 20, padding: 16, background: "#f8fafc", borderRadius: 8 }}>
              <label>
                <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>📋 試卷標題（可編輯）</span>
                <input
                  value={examForm.title}
                  onChange={(e) => setExamForm((prev) => ({ ...prev, title: e.target.value }))}
                  style={{ width: "100%", fontWeight: 600, fontSize: 16 }}
                />
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={examForm.isPremium}
                  onChange={(e) => setExamForm((prev) => ({ ...prev, isPremium: e.target.checked }))}
                />
                <span>⭐ 付費試卷（VIP 專屬）</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn" style={{ padding: "14px 32px", fontSize: 16 }} onClick={handleCreateExam}>
                {examForm.id ? "更新試卷並進入建題" : "建立試卷並進入建題"} →
              </button>
            </div>

            {status && (
              <p style={{ marginTop: 12 }} className={status.includes("✅") ? "success" : status.includes("⚠️") ? "warning" : "muted"}>
                {status}
              </p>
            )}
          </div>
        </>
      )}

      {step === 2 && activeExam && (
        <>
          {/* 目前試卷 */}
          <div className="card" style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", border: "2px solid #10b981" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, color: "#065f46" }}>📋 {activeExam.title}</h3>
                <p className="muted" style={{ margin: "8px 0 0" }}>
                  已有 {activeExam.questions.length} 題 ｜ 目前編輯中 {questions.length} 題
                </p>
              </div>
              <button className="btn ghost" onClick={handleBackToStep1}>
                ← 修改試卷資訊
              </button>
            </div>
          </div>

          {/* 題目列表 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="card" style={{ border: "2px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>第 {qIndex + 1} 題</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn ghost"
                      style={{ fontSize: 12, color: "#ef4444" }}
                      onClick={() => handleDeleteQuestion(qIndex)}
                    >
                      🗑️ 刪除
                    </button>
                  </div>
                </div>

                {/* 快速填入 */}
                <div style={{ marginBottom: 16, padding: 12, background: "#fef3c7", borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#92400e" }}>⚡ 快速填入測試題目</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {quickTestQuestions.map((t, ti) => (
                      <button
                        key={ti}
                        className="btn ghost"
                        style={{ fontSize: 11, padding: "4px 8px" }}
                        onClick={() => handleQuickFill(qIndex, ti)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* 左欄 */}
                  <div>
                    <label style={{ display: "block", marginBottom: 12 }}>
                      <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>題型</span>
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestionField(qIndex, "type", e.target.value)}
                        style={{ width: "100%" }}
                      >
                        {typeOptions.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </label>

                    <label style={{ display: "block", marginBottom: 12 }}>
                      <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>題幹（支援 LaTeX）</span>
                      <textarea
                        rows={3}
                        value={q.content}
                        onChange={(e) => updateQuestionField(qIndex, "content", e.target.value)}
                        placeholder="輸入題目內容，例如：若 $x^2 - 5x + 6 = 0$，則 $x = $？"
                        style={{ width: "100%" }}
                      />
                    </label>

                    {q.type !== "TF" && (
                      <label style={{ display: "block", marginBottom: 12 }}>
                        <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>選項</span>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                            <span style={{ width: 24, color: "#6b7280" }}>({String.fromCharCode(65 + oi)})</span>
                            <input
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[oi] = e.target.value;
                                updateQuestionField(qIndex, "options", newOpts);
                              }}
                              placeholder={`選項 ${String.fromCharCode(65 + oi)}`}
                              style={{ flex: 1 }}
                            />
                          </div>
                        ))}
                      </label>
                    )}

                    <label style={{ display: "block", marginBottom: 12 }}>
                      <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>正確答案</span>
                      {q.type === "TF" ? (
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestionField(qIndex, "correctAnswer", e.target.value)}
                          style={{ width: "100%" }}
                        >
                          <option value="是">是（正確）</option>
                          <option value="否">否（錯誤）</option>
                        </select>
                      ) : (
                        <input
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestionField(qIndex, "correctAnswer", e.target.value)}
                          placeholder="輸入正確答案"
                          style={{ width: "100%" }}
                        />
                      )}
                    </label>
                  </div>

                  {/* 右欄 */}
                  <div>
                    <label style={{ display: "block", marginBottom: 12 }}>
                      <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>文字解析</span>
                      <textarea
                        rows={4}
                        value={q.textExplanation}
                        onChange={(e) => updateQuestionField(qIndex, "textExplanation", e.target.value)}
                        placeholder="輸入解題詳解..."
                        style={{ width: "100%" }}
                      />
                    </label>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>🎬 影音詳解（可多個）</span>
                        <button
                          className="btn ghost"
                          style={{ fontSize: 11, padding: "2px 8px" }}
                          onClick={() => addVideoExplanation(qIndex)}
                        >
                          + 新增
                        </button>
                      </div>
                      {q.videoExplanations.map((v, vi) => (
                        <input
                          key={vi}
                          value={v}
                          onChange={(e) => updateVideoExplanation(qIndex, vi, e.target.value)}
                          placeholder={`影片連結 ${vi + 1}（YouTube 或其他）`}
                          style={{ width: "100%", marginBottom: 6 }}
                        />
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <label>
                        <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>章節</span>
                        <select
                          value={q.chapterTag}
                          onChange={(e) => updateQuestionField(qIndex, "chapterTag", e.target.value)}
                          style={{ width: "100%" }}
                        >
                          {chapterTagOptions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>難度</span>
                        <select
                          value={q.difficulty}
                          onChange={(e) => updateQuestionField(qIndex, "difficulty", e.target.value as any)}
                          style={{ width: "100%" }}
                        >
                          {difficultyOptions.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 題目預覽 */}
                {q.content && (
                  <div style={{ marginTop: 16, padding: 16, background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>👁️ 預覽</div>
                    <div style={{ marginBottom: 8 }}>
                      <Latex content={q.content} />
                    </div>
                    {q.type !== "TF" && q.options.filter(Boolean).length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                        {q.options.filter(Boolean).map((opt, oi) => (
                          <div key={oi} style={{ fontSize: 14 }}>
                            <Latex content={`(${String.fromCharCode(65 + oi)}) ${opt}`} />
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: "#059669" }}>
                      <strong>答案：</strong><Latex content={q.correctAnswer || "未填寫"} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 新增題目按鈕 */}
          <div style={{ textAlign: "center" }}>
            <button
              className="btn ghost"
              style={{ padding: "16px 32px", fontSize: 16, border: "2px dashed #d1d5db" }}
              onClick={handleAddNewQuestion}
            >
              ➕ 新增一題
            </button>
          </div>

          {/* 儲存全部 */}
          <div className="card" style={{ background: "#fef3c7", border: "2px solid #f59e0b", position: "sticky", bottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 600, color: "#92400e" }}>
                  共 {questions.filter((q) => q.content.trim()).length} 題待儲存
                </span>
              </div>
              <button
                className="btn"
                style={{ padding: "14px 40px", fontSize: 16, background: "#f59e0b" }}
                onClick={handleSaveAll}
              >
                💾 儲存全部題目
              </button>
            </div>
            {status && (
              <p style={{ marginTop: 8, marginBottom: 0 }} className={status.includes("✅") ? "success" : "muted"}>
                {status}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
