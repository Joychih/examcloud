export type School = {
  id: string;
  name: string;
  region: string;
  examCount: number;
  isFreeTrial: boolean;
};

// MCQ=選擇題, TF=是非題, Fill=填充題, Calc=計算題, Proof=證明題, Written=手寫應用題
export type QuestionType = "MCQ" | "TF" | "Fill" | "Calc" | "Proof" | "Written";

export type Question = {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[];
  correctAnswer: string;
  textExplanation: string;
  videoUrl?: string;
  images?: string[];
  tags: string[];  // tags[0] = 章節
  difficulty: "easy" | "medium" | "hard";
  // 計分方式（用於應用題）
  maxScore?: number;  // 滿分分數（預設 1）
  gradingCriteria?: string;  // 評分標準說明
  allowImageUpload?: boolean;  // 是否允許上傳圖片作答
  // 來源標籤（用於題庫搜尋）
  source?: {
    examCategory: ExamCategory;
    schoolId?: string;
    schoolName?: string;
    year?: string;
    grade?: string;
    subject?: string;
    examTitle?: string;
  };
};

// 自訂試卷（主題搜題生成）
export type CustomExam = {
  id: string;
  title: string;
  chapter: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  questionIds: string[];
  createdAt: string;
};

export type ExamCategory = "school" | "junior_high" | "gsat" | "ast";

export type Exam = {
  id: string;
  examCategory: ExamCategory;
  schoolId?: string;
  grade: string;
  subject: string;
  year: string;
  semester?: string;
  examNo?: string;
  title: string;
  isPremium: boolean;
  questions: Question[];
  createdAt?: string;  // 建立時間，用於排序
};

export type AnswerRecord = {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  // 擴充欄位（用於應用題）
  score?: number;  // 實得分數
  maxScore?: number;  // 滿分
  imageUrl?: string;  // 上傳的手寫答案圖片
  aiGrading?: {
    score: number;
    feedback: string;
    confidence: number;  // AI 信心度 0-1
    gradedAt: string;
  };
};

export type ExamResult = {
  id?: string;
  examId: string;
  schoolId?: string;
  score: number;
  total: number;
  answers: AnswerRecord[];
  submittedAt: string;
  userId?: string;
  assignmentId?: string;  // 如果是指派作答，記錄指派 ID
};

// 試卷指派紀錄
export type ExamAssignment = {
  id: string;
  name: string;  // 指派名稱（預設：試卷名稱 + 班級 + 日期）
  examId: string;  // 試卷 ID（可以是 custom:xxx）
  examTitle: string;
  targetStudentIds: string[];  // 被指派的學生 ID
  createdAt: string;
  dueDate?: string;  // 截止日期（選填）
};

export type StudentUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  school: string;  // 就讀學校
  className: string;  // 班級（免費會員、高一a班 等）
  grade: string;  // 年級
  region: string;  // 地區
  plan: "free" | "vip";
  joinDate: string;  // 加入日期
  lastActiveDate?: string;  // 最後活躍日期
  examsTaken?: number;  // 已完成試卷數
  avgScore?: number;  // 平均分數
  assignedExams?: string[];  // 被指派的試卷 ID（舊格式，保留相容）
  assignments?: string[];  // 指派紀錄 ID
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  type: "info" | "new" | "promo" | "important";
  targetGrades: string[];  // 空陣列=全部
  targetClasses: string[]; // 空陣列=全部
  targetRegions: string[]; // 空陣列=全部
  createdAt: string;
  expiresAt?: string;
};
