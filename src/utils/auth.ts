export type UserRole = "student" | "creator" | "admin";
export type UserPlan = "free" | "vip";

const ROLE_KEY = "examcloud.role";
const PLAN_KEY = "examcloud.plan";

export const getRole = (): UserRole | null => {
  const stored = localStorage.getItem(ROLE_KEY);
  if (stored === "student" || stored === "creator" || stored === "admin") {
    return stored;
  }
  return null;
};

export const setRole = (role: UserRole) => {
  localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new Event("rolechange"));
};

export const clearRole = () => {
  localStorage.removeItem(ROLE_KEY);
  window.dispatchEvent(new Event("rolechange"));
};

export const getPlan = (): UserPlan => {
  const stored = localStorage.getItem(PLAN_KEY);
  return stored === "vip" ? "vip" : "free";
};

export const setPlan = (plan: UserPlan) => {
  localStorage.setItem(PLAN_KEY, plan);
  window.dispatchEvent(new Event("rolechange"));
};
