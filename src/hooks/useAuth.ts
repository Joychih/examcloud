import { useEffect, useState } from "react";
import { clearRole, getPlan, getRole, setPlan, setRole } from "../utils/auth";
import type { UserPlan, UserRole } from "../utils/auth";
import type { StudentUser } from "../data/models";

const STUDENT_KEY = "current_student";

const getStoredStudent = (): StudentUser | null => {
  try {
    const stored = localStorage.getItem(STUDENT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const storeStudent = (student: StudentUser | null) => {
  if (student) {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
  } else {
    localStorage.removeItem(STUDENT_KEY);
  }
};

export const useAuth = () => {
  const [role, setRoleState] = useState<UserRole | null>(() => getRole());
  const [plan, setPlanState] = useState<UserPlan>(() => getPlan());
  const [currentStudent, setCurrentStudentState] = useState<StudentUser | null>(() => getStoredStudent());

  useEffect(() => {
    const handleChange = () => {
      setRoleState(getRole());
      setPlanState(getPlan());
      setCurrentStudentState(getStoredStudent());
    };
    window.addEventListener("storage", handleChange);
    window.addEventListener("rolechange", handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("rolechange", handleChange);
    };
  }, []);

  // 當 currentStudent 改變時，同步 plan（班級決定是否為 VIP）
  useEffect(() => {
    if (currentStudent) {
      const isPaid = currentStudent.className !== "免費會員";
      setPlan(isPaid ? "vip" : "free");
    }
  }, [currentStudent]);

  const setCurrentStudent = (student: StudentUser | null) => {
    setCurrentStudentState(student);
    storeStudent(student);
    if (student) {
      const isPaid = student.className !== "免費會員";
      setPlan(isPaid ? "vip" : "free");
    }
  };

  // 計算是否為 VIP（根據班級）
  const isVip = currentStudent ? currentStudent.className !== "免費會員" : plan === "vip";

  return {
    role,
    plan,
    isVip,
    currentStudent,
    login: (nextRole: UserRole) => setRole(nextRole),
    logout: () => {
      clearRole();
      setCurrentStudent(null);
    },
    setPlan: (nextPlan: UserPlan) => setPlan(nextPlan),
    setCurrentStudent,
  };
};
