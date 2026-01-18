import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAnnouncements, getAssignments, getCustomExam, getExams, getResults } from "../data/api";
import type { Announcement, Exam, ExamAssignment, ExamResult } from "../data/models";
import { useAuth } from "../hooks/useAuth";
import "./StudentDashboard.css";

type AssignedExamInfo = {
  id: string;
  examId: string;
  assignmentName: string;
  examTitle: string;
  questionCount: number;
  isCustom: boolean;
};

export default function StudentDashboard() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [assignedExams, setAssignedExams] = useState<AssignedExamInfo[]>([]);
  const navigate = useNavigate();
  const { isVip, setPlan, currentStudent } = useAuth();

  useEffect(() => {
    Promise.all([getResults(), getExams(), getAnnouncements(), getAssignments()]).then(
      ([resultData, examData, annData, assignmentData]) => {
        setResults(resultData);
        setExams(examData);
        setAllAnnouncements(annData);
        setAssignments(assignmentData);
      }
    );
  }, []);

  // 載入被指派的試卷（使用 assignments）
  useEffect(() => {
    if (!currentStudent) {
      setAssignedExams([]);
      return;
    }

    const loadAssigned = async () => {
      const assigned: AssignedExamInfo[] = [];
      
      // 從 assignments 中找出指派給當前學生的
      const myAssignments = assignments.filter((a) => 
        a.targetStudentIds && a.targetStudentIds.includes(currentStudent.id)
      );
      
      console.log("[Dashboard] currentStudent:", currentStudent.id, currentStudent.name);
      console.log("[Dashboard] all assignments:", assignments);
      console.log("[Dashboard] my assignments:", myAssignments);
      
      for (const assignment of myAssignments) {
        // 檢查是否已完成
        const hasCompleted = results.some(
          (r) => r.userId === currentStudent.id && 
            (r.examId === assignment.examId || r.assignmentId === assignment.id)
        );
        if (hasCompleted) continue; // 已完成的不顯示
        
        if (assignment.examId.startsWith("custom:")) {
          // 自訂試卷
          const customId = assignment.examId.replace("custom:", "");
          const customData = await getCustomExam(customId);
          if (customData) {
            assigned.push({
              id: assignment.id,
              examId: assignment.examId,
              assignmentName: assignment.name,
              examTitle: customData.exam.title,
              questionCount: customData.questions.length,
              isCustom: true,
            });
          }
        } else {
          // 一般試卷
          const exam = exams.find((e) => e.id === assignment.examId);
          if (exam) {
            assigned.push({
              id: assignment.id,
              examId: assignment.examId,
              assignmentName: assignment.name,
              examTitle: exam.title,
              questionCount: exam.questions.length,
              isCustom: false,
            });
          }
        }
      }
      
      // 也從舊的 assignedExams 載入（向後相容）
      if (currentStudent.assignedExams?.length) {
        for (const examId of currentStudent.assignedExams) {
          // 如果已經透過 assignment 加入則跳過
          if (assigned.some((a) => a.examId === examId)) continue;
          
          // 檢查是否已完成
          const hasCompleted = results.some(
            (r) => r.userId === currentStudent.id && r.examId === examId
          );
          if (hasCompleted) continue;
          
          if (examId.startsWith("custom:")) {
            const customId = examId.replace("custom:", "");
            const customData = await getCustomExam(customId);
            if (customData) {
              assigned.push({
                id: examId,
                examId: examId,
                assignmentName: "老師指派",
                examTitle: customData.exam.title,
                questionCount: customData.questions.length,
                isCustom: true,
              });
            }
          } else {
            const exam = exams.find((e) => e.id === examId);
            if (exam) {
              assigned.push({
                id: examId,
                examId: examId,
                assignmentName: "老師指派",
                examTitle: exam.title,
                questionCount: exam.questions.length,
                isCustom: false,
              });
            }
          }
        }
      }
      
      setAssignedExams(assigned);
    };

    if (exams.length > 0 || assignments.length > 0) {
      loadAssigned();
    }
  }, [currentStudent, exams, assignments, results]);

  // 根據當前學生資料過濾公告
  const announcements = useMemo(() => {
    if (!currentStudent) return allAnnouncements;
    
    return allAnnouncements.filter((ann) => {
      // 年級篩選
      if (ann.targetGrades.length > 0 && !ann.targetGrades.includes(currentStudent.grade)) {
        return false;
      }
      // 班級篩選
      if (ann.targetClasses.length > 0 && !ann.targetClasses.includes(currentStudent.className)) {
        return false;
      }
      // 區域篩選
      if (ann.targetRegions.length > 0 && !ann.targetRegions.includes(currentStudent.region)) {
        return false;
      }
      return true;
    });
  }, [allAnnouncements, currentStudent]);

  const summary = useMemo(() => {
    const practiceCount = results.length;
    const averageScore =
      practiceCount === 0
        ? 0
        : Math.round(
            (results.reduce((sum, item) => sum + item.score / item.total, 0) /
              practiceCount) *
              100
          );

    const questionMap = new Map(
      exams.flatMap((exam) => exam.questions.map((q) => [q.id, q]))
    );

    const tagStats = new Map<string, { total: number; incorrect: number }>();
    results.forEach((result) => {
      result.answers.forEach((answer) => {
        const question = questionMap.get(answer.questionId);
        if (!question) return;
        question.tags.forEach((tag) => {
          const current = tagStats.get(tag) ?? { total: 0, incorrect: 0 };
          current.total += 1;
          if (!answer.isCorrect) current.incorrect += 1;
          tagStats.set(tag, current);
        });
      });
    });

    const weakTopics = Array.from(tagStats.entries())
      .sort((a, b) => b[1].incorrect - a[1].incorrect)
      .slice(0, 3)
      .map(([tag, stats]) => ({
        tag,
        rate: stats.total === 0 ? 0 : Math.round((stats.incorrect / stats.total) * 100),
      }));

    return { practiceCount, averageScore, weakTopics };
  }, [results, exams]);

  const announcementTypeStyles: Record<string, { bg: string; border: string; icon: string }> = {
    new: { bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", border: "#10b981", icon: "🆕" },
    promo: { bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#f59e0b", icon: "🎁" },
    important: { bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", border: "#ef4444", icon: "⚠️" },
    info: { bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "#3b82f6", icon: "ℹ️" },
  };

  return (
    <div className="dashboard-container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }} />
          ))}
        </div>
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge animate-float">
            <span>🏆</span> 全台名校題庫首選
          </div>
          <h1 className="hero-title">
            <span className="title-highlight">歡迎回來！</span>
            <br />
            準備好挑戰了嗎？ 💪
          </h1>
          <p className="hero-subtitle">
            良師塾考試雲 — 收錄全台 <span className="text-accent">45+</span> 所名校段考
            <br />
            學測、分科測驗完整解析，助你掌握考試趨勢
          </p>
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={() => navigate("/student/exams")}>
              <span className="btn-icon">🚀</span>
              開始練習
              <span className="btn-shine" />
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate("/student/topics")}>
              <span className="btn-icon">📚</span>
              主題搜題
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">精選題目</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-number">5年</span>
              <span className="stat-label">歷屆試題</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="stat-number">AI</span>
              <span className="stat-label">智慧解惑</span>
            </div>
          </div>
        </div>
      </div>

      {/* 指派試卷區 */}
      {assignedExams.length > 0 && (
        <div
          className="animate-fade-in"
          style={{
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            border: "2px solid #f59e0b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>📋</span>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#92400e" }}>
              老師指派的練習
            </span>
            <span
              style={{
                background: "#f59e0b",
                color: "#fff",
                padding: "2px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {assignedExams.length} 份
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {assignedExams.map((exam, index) => (
              <div
                key={exam.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  animation: "fade-slide-in 0.3s ease-out forwards",
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {exam.isCustom && (
                      <span
                        style={{
                          background: "#ede9fe",
                          color: "#7c3aed",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        主題練習
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 14 }}>{exam.assignmentName}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>{exam.examTitle}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{exam.questionCount} 題</div>
                </div>
                <button
                  className="btn"
                  style={{ background: "#f59e0b", padding: "8px 16px" }}
                  onClick={() => {
                    if (exam.isCustom) {
                      const customId = exam.examId.replace("custom:", "");
                      navigate(`/student/custom-exam/${customId}`);
                    } else {
                      navigate(`/student/exams/${exam.examId}`);
                    }
                  }}
                >
                  開始作答
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 公告區 */}
      {announcements.length > 0 && (
        <div className="announcements-section animate-fade-in">
          <div className="announcements-header">
            <span className="announcements-icon">📢</span>
            最新公告
            <span className="announcements-badge">{announcements.length}</span>
          </div>
          <div className="announcements-list">
            {announcements.slice(0, 3).map((ann, index) => {
              const style = announcementTypeStyles[ann.type] ?? announcementTypeStyles.info;
              return (
                <div
                  key={ann.id}
                  className="announcement-card"
                  style={{
                    background: style.bg,
                    borderLeft: `4px solid ${style.border}`,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="announcement-title">
                    <span className="announcement-type-icon">{style.icon}</span>
                    {ann.title}
                  </div>
                  <p className="announcement-content">{ann.content}</p>
                  <span className="announcement-date">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 數據統計 */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-content">
            <div className="stat-card-label">已練習</div>
            <div className="stat-card-value">{summary.practiceCount}</div>
            <div className="stat-card-unit">份試卷</div>
          </div>
          <div className="stat-card-decoration" />
        </div>

        <div className="stat-card stat-card-green animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="stat-card-icon">📊</div>
          <div className="stat-card-content">
            <div className="stat-card-label">平均正確率</div>
            <div className="stat-card-value">{summary.averageScore}%</div>
            <div className="stat-card-unit">
              {summary.averageScore >= 80 ? "🌟 太棒了！" : summary.averageScore >= 60 ? "💪 繼續加油！" : "📖 多多練習！"}
            </div>
          </div>
          <div className="stat-card-decoration" />
        </div>

        <div className="stat-card stat-card-amber animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="stat-card-icon">🎯</div>
          <div className="stat-card-content">
            <div className="stat-card-label">待加強章節</div>
            {summary.weakTopics.length === 0 ? (
              <div className="stat-card-value" style={{ fontSize: 18 }}>目前無弱點 👍</div>
            ) : (
              <div className="weak-topics">
                {summary.weakTopics.map((topic) => (
                  <span key={topic.tag} className="weak-topic-tag">
                    {topic.tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="stat-card-decoration" />
        </div>
      </div>

      {/* VIP 升級推廣 */}
      {!isVip && (
        <div className="vip-banner animate-fade-in">
          <div className="vip-glow" />
          <div className="vip-content">
            <div className="vip-badge">⭐ VIP 專屬</div>
            <h3 className="vip-title">解鎖完整學習體驗</h3>
            <p className="vip-description">
              升級 VIP 享有：完整文字詳解 + 影音教學 + AI 即時解惑 + 專屬題庫
            </p>
          </div>
          <button className="vip-button" onClick={() => setPlan("vip")}>
            立即升級
            <span className="vip-arrow">→</span>
          </button>
        </div>
      )}

      {/* 功能快捷入口 */}
      <div className="features-section">
        <h3 className="features-title">
          <span className="features-icon">🔥</span>
          熱門功能
        </h3>
        <div className="features-grid">
          {[
            { icon: "📋", title: "試題清單", desc: "瀏覽全台名校段考與升學考試題目", path: "/student/exams", color: "#3b82f6" },
            { icon: "🔍", title: "主題搜題", desc: "依章節單元快速找到想練習的題目", path: "/student/topics", color: "#8b5cf6" },
            { icon: "📈", title: "答題紀錄", desc: "查看歷次練習成績與錯題詳解", path: "/student/records", color: "#10b981" },
            { icon: "🧠", title: "學習分析", desc: "AI 分析你的學習狀況與建議", path: "/analysis", color: "#f59e0b" },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="feature-card animate-slide-up"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              onClick={() => navigate(feature.path)}
            >
              <div className="feature-icon-wrapper" style={{ background: `${feature.color}15` }}>
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h4 className="feature-title">{feature.title}</h4>
              <p className="feature-desc">{feature.desc}</p>
              <div className="feature-arrow" style={{ color: feature.color }}>
                前往 →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部推廣 */}
      <div className="footer-promo animate-fade-in">
        <div className="footer-promo-icon">💡</div>
        <div className="footer-promo-text">
          <span className="footer-promo-highlight">良師塾考試雲</span> 持續更新中 —
          收錄 <span className="text-accent">45+</span> 所名校段考題庫，
          <span className="text-accent">5 年</span> 學測與分科測驗完整解析
        </div>
      </div>
    </div>
  );
}
