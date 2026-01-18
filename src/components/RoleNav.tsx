import { NavLink } from "react-router-dom";
import type { UserRole } from "../utils/auth";

type RoleNavProps = {
  role: UserRole;
};

const roleLinks: Record<UserRole, { label: string; path: string }[]> = {
  student: [
    { label: "首頁總覽", path: "/student" },
    { label: "試題清單", path: "/student/exams" },
    { label: "主題搜題", path: "/student/topics" },
    { label: "答題紀錄", path: "/student/records" },
    { label: "學習分析", path: "/analysis" },
  ],
  creator: [
    { label: "首頁總覽", path: "/creator" },
    { label: "題庫管理", path: "/creator/question-bank" },
    { label: "題目編輯器", path: "/creator/question-editor" },
  ],
  admin: [
    { label: "首頁總覽", path: "/admin" },
    { label: "公告管理", path: "/admin/announcements" },
    { label: "使用者", path: "/admin/users" },
    { label: "系統分析", path: "/admin/analytics" },
  ],
};

export default function RoleNav({ role }: RoleNavProps) {
  return (
    <nav className="nav-links">
      {roleLinks[role].map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `nav-link${isActive ? " active" : ""}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
