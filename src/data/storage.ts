// localStorage 持久化工具
// 用於在 Mock 模式下保存資料，避免刷新頁面後資料消失

const STORAGE_KEY = "examcloud_mock_db";

type StoredData = {
  exams: any[];
  results: any[];
  students: any[];
  announcements: any[];
  customExams: any[];
  assignments: any[];
};

// 從 localStorage 載入資料
export const loadFromStorage = (): Partial<StoredData> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[Storage] Failed to load from localStorage:", error);
  }
  return {};
};

// 儲存到 localStorage
export const saveToStorage = (data: Partial<StoredData>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("[Storage] Failed to save to localStorage:", error);
  }
};

// 清除所有儲存的資料
export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("[Storage] Failed to clear localStorage:", error);
  }
};
