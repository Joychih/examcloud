import type { Exam, ExamCategory, ExamResult, Question, School, StudentUser, Announcement, CustomExam, ExamAssignment } from "./models";
import { mockDb, nextId, syncMockDbToStorage } from "./mock";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

const apiFetch = async <T,>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
  return (await response.json()) as T;
};

export const getSchools = async (): Promise<School[]> => {
  if (useMock) return [...mockDb.schools];
  return apiFetch<School[]>("/api/schools");
};

export const getExams = async (): Promise<Exam[]> => {
  if (useMock) return [...mockDb.exams];
  return apiFetch<Exam[]>("/api/exams");
};

export const getExamsBySchool = async (schoolId: string): Promise<Exam[]> => {
  if (useMock) {
    return mockDb.exams.filter((exam) => exam.schoolId === schoolId);
  }
  return apiFetch<Exam[]>(`/api/exams?schoolId=${schoolId}`);
};

export const getExamById = async (examId: string): Promise<Exam | null> => {
  if (useMock) {
    return mockDb.exams.find((exam) => exam.id === examId) ?? null;
  }
  return apiFetch<Exam>(`/api/exams/${examId}`);
};

export const getResults = async (): Promise<ExamResult[]> => {
  if (useMock) return [...mockDb.results];
  return apiFetch<ExamResult[]>("/api/results");
};

export const postResult = async (result: ExamResult): Promise<void> => {
  if (useMock) {
    const newResult: ExamResult = {
      ...result,
      id: result.id ?? nextId("r"),
      userId: result.userId ?? "student-001",
    };
    mockDb.results.unshift(newResult);
    syncMockDbToStorage();
    return;
  }
  await apiFetch<void>("/api/results", {
    method: "POST",
    body: JSON.stringify(result),
  });
};

export const upsertExam = async (
  exam: Partial<Exam> & Pick<Exam, "title">
): Promise<Exam> => {
  if (useMock) {
    const existing = mockDb.exams.find((item) => item.id === exam.id);
    if (existing) {
      Object.assign(existing, exam);
      return existing;
    }
    const newExam: Exam = {
      id: nextId("e"),
      examCategory: exam.examCategory ?? "school",
      schoolId: exam.schoolId ?? "s01",
      grade: exam.grade ?? "高一",
      subject: exam.subject ?? "數學",
      year: exam.year ?? "114",
      title: exam.title,
      isPremium: exam.isPremium ?? false,
      questions: [],
      createdAt: new Date().toISOString(),  // 記錄建立時間
    };
    // 新建立的試卷加到最前面，讓學生能看到最新的
    mockDb.exams.unshift(newExam);
    syncMockDbToStorage();
    return newExam;
  }
  return apiFetch<Exam>("/api/exams/upsert", {
    method: "POST",
    body: JSON.stringify(exam),
  });
};

export const addQuestion = async (
  examId: string,
  question: Omit<Question, "id">
): Promise<Question> => {
  if (useMock) {
    const exam = mockDb.exams.find((item) => item.id === examId);
    if (!exam) {
      throw new Error("Exam not found");
    }
    const newQuestion: Question = { ...question, id: nextId("q") };
    exam.questions.push(newQuestion);
    return newQuestion;
  }
  return apiFetch<Question>(`/api/exams/${examId}/questions`, {
    method: "POST",
    body: JSON.stringify(question),
  });
};

export const updateQuestion = async (
  questionId: string,
  updates: Partial<Omit<Question, "id">>
): Promise<Question> => {
  if (useMock) {
    for (const exam of mockDb.exams) {
      const question = exam.questions.find((q) => q.id === questionId);
      if (question) {
        Object.assign(question, updates);
        syncMockDbToStorage();
        return question;
      }
    }
    throw new Error("Question not found");
  }
  return apiFetch<Question>(`/api/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  if (useMock) {
    for (const exam of mockDb.exams) {
      const index = exam.questions.findIndex((q) => q.id === questionId);
      if (index !== -1) {
        exam.questions.splice(index, 1);
        syncMockDbToStorage();
        return;
      }
    }
    return;
  }
  await apiFetch<void>(`/api/questions/${questionId}`, { method: "DELETE" });
};

export const getStudents = async (): Promise<StudentUser[]> => {
  if (useMock) return [...mockDb.students];
  return apiFetch<StudentUser[]>("/api/students");
};

// 取得題庫所有題目（含完整來源標籤）
export const getQuestionBank = async (): Promise<Question[]> => {
  if (useMock) {
    const result: Question[] = [];
    const seen = new Set<string>();
    const schoolMap = new Map(mockDb.schools.map((s) => [s.id, s.name]));
    
    mockDb.exams.forEach((exam) => {
      exam.questions.forEach((q) => {
        // 用題目內容去重
        const key = q.content;
        if (seen.has(key)) return;
        seen.add(key);
        
        // 加上來源標籤
        const questionWithSource: Question = {
          ...q,
          source: {
            examCategory: exam.examCategory,
            schoolId: exam.schoolId,
            schoolName: exam.schoolId ? schoolMap.get(exam.schoolId) : undefined,
            year: exam.year,
            grade: exam.grade,
            subject: exam.subject,
            examTitle: exam.title,
          },
        };
        result.push(questionWithSource);
      });
    });
    return result;
  }
  return apiFetch<Question[]>("/api/questions/bank");
};

// 根據條件篩選題目
export type QuestionFilter = {
  chapter?: string;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  examCategory?: ExamCategory | "all";
  limit?: number;
};

export const filterQuestions = async (filter: QuestionFilter): Promise<Question[]> => {
  const allQuestions = await getQuestionBank();
  
  let filtered = allQuestions.filter((q) => {
    // 章節篩選
    if (filter.chapter && !q.tags.some((t) => t.includes(filter.chapter!))) {
      return false;
    }
    // 難度篩選（mixed 不過濾）
    if (filter.difficulty && filter.difficulty !== "mixed" && q.difficulty !== filter.difficulty) {
      return false;
    }
    // 考試類別篩選
    if (filter.examCategory && filter.examCategory !== "all" && q.source?.examCategory !== filter.examCategory) {
      return false;
    }
    return true;
  });
  
  // 隨機打亂
  filtered = filtered.sort(() => Math.random() - 0.5);
  
  // 限制數量
  if (filter.limit) {
    filtered = filtered.slice(0, filter.limit);
  }
  
  return filtered;
};

// 建立自訂試卷
export const createCustomExam = async (
  title: string,
  chapter: string,
  difficulty: "easy" | "medium" | "hard" | "mixed",
  questions: Question[]
): Promise<CustomExam> => {
  const customExam: CustomExam = {
    id: nextId("custom"),
    title,
    chapter,
    difficulty,
    questionIds: questions.map((q) => q.id),
    createdAt: new Date().toISOString(),
  };
  
  if (useMock) {
    // 儲存自訂試卷的題目到暫存
    mockDb.customExams = mockDb.customExams || [];
    mockDb.customExams.push({ ...customExam, questions });
    syncMockDbToStorage();
  }
  
  return customExam;
};

// 取得自訂試卷
export const getCustomExam = async (examId: string): Promise<{ exam: CustomExam; questions: Question[] } | null> => {
  if (useMock) {
    const found = mockDb.customExams?.find((e: any) => e.id === examId);
    if (found) {
      return { exam: found, questions: found.questions };
    }
  }
  return null;
};

// 舊版相容
export const getAllQuestions = async (): Promise<{ question: Question; examId: string; examTitle: string }[]> => {
  if (useMock) {
    const result: { question: Question; examId: string; examTitle: string }[] = [];
    mockDb.exams.forEach((exam) => {
      exam.questions.forEach((q) => {
        result.push({ question: q, examId: exam.id, examTitle: exam.title });
      });
    });
    return result;
  }
  return apiFetch<{ question: Question; examId: string; examTitle: string }[]>("/api/questions/all");
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
  if (useMock) return [...mockDb.announcements];
  return apiFetch<Announcement[]>("/api/announcements");
};

export const createAnnouncement = async (announcement: Omit<Announcement, "id" | "createdAt">): Promise<Announcement> => {
  if (useMock) {
    const newAnn: Announcement = {
      ...announcement,
      id: nextId("ann"),
      createdAt: new Date().toISOString(),
    };
    mockDb.announcements.unshift(newAnn);
    syncMockDbToStorage();
    return newAnn;
  }
  return apiFetch<Announcement>("/api/announcements", {
    method: "POST",
    body: JSON.stringify(announcement),
  });
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  if (useMock) {
    const index = mockDb.announcements.findIndex((a) => a.id === id);
    if (index !== -1) {
      mockDb.announcements.splice(index, 1);
      syncMockDbToStorage();
    }
    return;
  }
  await apiFetch<void>(`/api/announcements/${id}`, { method: "DELETE" });
};

// ============================================================================
// 試卷指派 API
// ============================================================================

export const getAssignments = async (): Promise<ExamAssignment[]> => {
  if (useMock) return [...mockDb.assignments];
  return apiFetch<ExamAssignment[]>("/api/assignments");
};

export const createAssignment = async (data: {
  name: string;
  examId: string;
  examTitle: string;
  targetStudentIds: string[];
  dueDate?: string;
}): Promise<ExamAssignment> => {
  if (useMock) {
    const newAssignment: ExamAssignment = {
      id: nextId("assign"),
      name: data.name,
      examId: data.examId,
      examTitle: data.examTitle,
      targetStudentIds: data.targetStudentIds,
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate,
    };
    mockDb.assignments.push(newAssignment);
    
    console.log("[API] Created assignment:", newAssignment);
    console.log("[API] mockDb.assignments now:", mockDb.assignments);
    
    // 更新學生的 assignments 陣列
    data.targetStudentIds.forEach((studentId) => {
      const student = mockDb.students.find((s) => s.id === studentId);
      if (student) {
        student.assignments = student.assignments || [];
        student.assignments.push(newAssignment.id);
        // 也加到舊的 assignedExams（保持相容）
        student.assignedExams = student.assignedExams || [];
        if (!student.assignedExams.includes(data.examId)) {
          student.assignedExams.push(data.examId);
        }
        console.log("[API] Updated student:", student.id, "assignedExams:", student.assignedExams);
      }
    });
    
    syncMockDbToStorage();
    return newAssignment;
  }
  return apiFetch<ExamAssignment>("/api/assignments", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getAssignmentById = async (id: string): Promise<ExamAssignment | null> => {
  if (useMock) {
    return mockDb.assignments.find((a) => a.id === id) ?? null;
  }
  return apiFetch<ExamAssignment>(`/api/assignments/${id}`);
};

export const deleteAssignment = async (id: string): Promise<void> => {
  if (useMock) {
    const index = mockDb.assignments.findIndex((a) => a.id === id);
    if (index !== -1) {
      const assignment = mockDb.assignments[index];
      // 從學生的 assignments 中移除
      assignment.targetStudentIds.forEach((studentId) => {
        const student = mockDb.students.find((s) => s.id === studentId);
        if (student && student.assignments) {
          student.assignments = student.assignments.filter((aid) => aid !== id);
        }
      });
      mockDb.assignments.splice(index, 1);
      syncMockDbToStorage();
    }
    return;
  }
  await apiFetch<void>(`/api/assignments/${id}`, { method: "DELETE" });
};
