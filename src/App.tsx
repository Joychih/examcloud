import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import PublicShell from "./components/PublicShell";
import RequireRole from "./components/RequireRole";
import LoginPage from "./routes/LoginPage";
import StudentDashboard from "./routes/StudentDashboard";
import StudentExamList from "./routes/StudentExamList";
import StudentExamPage from "./routes/StudentExamPage";
import StudentRecords from "./routes/StudentRecords";
import StudentResultPage from "./routes/StudentResultPage";
import StudentTopicSearch from "./routes/StudentTopicSearch";
import StudentCustomExam from "./routes/StudentCustomExam";
import SchoolList from "./routes/SchoolList";
import SchoolExamList from "./routes/SchoolExamList";
import StudentAnalysis from "./routes/StudentAnalysis";
import CreatorDashboard from "./routes/CreatorDashboard";
import CreatorQuestionEditor from "./routes/CreatorQuestionEditor";
import CreatorQuestionBank from "./routes/CreatorQuestionBank";
import AdminDashboard from "./routes/AdminDashboard";
import AdminUsers from "./routes/AdminUsers";
import AdminAnalytics from "./routes/AdminAnalytics";
import AdminAnnouncements from "./routes/AdminAnnouncements";
import { useAuth } from "./hooks/useAuth";

const roleDefaultRoute = (role: string | null) => {
  if (role === "student") return "/student";
  if (role === "creator") return "/creator";
  if (role === "admin") return "/admin";
  return "/login";
};

export default function App() {
  const { role } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PublicShell />}>
        <Route path="/schools" element={<SchoolList />} />
        <Route path="/exams/:schoolId" element={<SchoolExamList />} />
      </Route>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={<Navigate to={roleDefaultRoute(role)} replace />}
        />
        <Route
          path="/student"
          element={
            <RequireRole role="student">
              <StudentDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/student/exams"
          element={
            <RequireRole role="student">
              <StudentExamList />
            </RequireRole>
          }
        />
        <Route
          path="/student/exams/:examId"
          element={
            <RequireRole role="student">
              <StudentExamPage />
            </RequireRole>
          }
        />
        <Route
          path="/student/records"
          element={
            <RequireRole role="student">
              <StudentRecords />
            </RequireRole>
          }
        />
        <Route
          path="/student/results/:resultId"
          element={
            <RequireRole role="student">
              <StudentResultPage />
            </RequireRole>
          }
        />
        <Route
          path="/student/topics"
          element={
            <RequireRole role="student">
              <StudentTopicSearch />
            </RequireRole>
          }
        />
        <Route
          path="/student/custom-exam/:examId"
          element={
            <RequireRole role="student">
              <StudentCustomExam />
            </RequireRole>
          }
        />
        <Route
          path="/analysis"
          element={
            <RequireRole role="student">
              <StudentAnalysis />
            </RequireRole>
          }
        />
        <Route
          path="/creator"
          element={
            <RequireRole role="creator">
              <CreatorDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/creator/question-bank"
          element={
            <RequireRole role="creator">
              <CreatorQuestionBank />
            </RequireRole>
          }
        />
        <Route
          path="/creator/question-editor"
          element={
            <RequireRole role="creator">
              <CreatorQuestionEditor />
            </RequireRole>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole role="admin">
              <AdminUsers />
            </RequireRole>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <RequireRole role="admin">
              <AdminAnalytics />
            </RequireRole>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <RequireRole role="admin">
              <AdminAnnouncements />
            </RequireRole>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
