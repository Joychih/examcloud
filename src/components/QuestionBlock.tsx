import Latex from "./Latex";
import type { Question } from "../data/models";

type QuestionBlockProps = {
  index: number;
  question: Question;
  value: string;
  onChange?: (questionId: string, value: string) => void;
  submitted: boolean;
  isCorrect?: boolean;
  showExplanation: boolean;
  readOnly?: boolean;
};

export default function QuestionBlock({
  index,
  question,
  value,
  onChange,
  submitted,
  isCorrect,
  showExplanation,
  readOnly = false,
}: QuestionBlockProps) {
  const statusClass =
    submitted && isCorrect !== undefined
      ? isCorrect
        ? "question-card correct"
        : "question-card incorrect"
      : "question-card";

  const options =
    question.type === "TF"
      ? ["是", "否"]
      : question.options ?? [];

  const handleChange = (questionId: string, nextValue: string) => {
    if (readOnly || !onChange) return;
    onChange(questionId, nextValue);
  };

  return (
    <div className={statusClass}>
      <div className="muted question-title">第 {index + 1} 題</div>
      <div className="question-content" style={{ marginTop: 8 }}>
        <Latex content={question.content} />
      </div>
      {question.images && question.images.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {question.images.map((src) => (
            <img
              key={src}
              src={src}
              alt="題目圖片"
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          ))}
        </div>
      )}
      {question.type === "Fill" ? (
        <div style={{ marginTop: 12 }}>
          <input
            type="text"
            value={value}
            onChange={(event) => handleChange(question.id, event.target.value)}
            placeholder="請輸入答案"
            disabled={readOnly}
          />
        </div>
      ) : (
        <div className="question-options">
          {options.map((option) => (
            <label key={option} className="inline">
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={() => handleChange(question.id, option)}
                disabled={readOnly}
              />
              <Latex content={option} />
            </label>
          ))}
        </div>
      )}
      {submitted && (
        <div className="answer-sections">
          <div className="answer-section">
            <div className="answer-title">正確答案</div>
            <div className="answer-body">
              <Latex content={question.correctAnswer || "—"} />
              {question.tags && question.tags.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  <span className="tag" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                    📚 {question.tags[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="answer-section">
            <div className="answer-title">解析</div>
            <div className="answer-body">
              {showExplanation
                ? <Latex content={question.textExplanation || "（尚無解析內容）"} />
                : "升級 VIP 後可查看完整文字詳解。"}
            </div>
          </div>
          <div className="answer-section">
            <div className="answer-title">影音詳解</div>
            <div className="answer-body">
              {showExplanation ? (
                question.videoUrl ? (
                  <div className="video-placeholder">
                    <div className="video-icon">▶</div>
                    <a href={question.videoUrl} target="_blank" rel="noreferrer">
                      點擊觀看影片
                    </a>
                  </div>
                ) : (
                  <div className="video-placeholder empty">
                    <div className="video-icon">🎬</div>
                    <span>影片製作中，敬請期待</span>
                  </div>
                )
              ) : (
                <div className="video-placeholder locked">
                  <div className="video-icon">🔒</div>
                  <span>升級 VIP 後可查看影音詳解</span>
                </div>
              )}
            </div>
          </div>
          <div className="answer-section">
            <div className="answer-title">AI 解惑</div>
            <div className="answer-body">
              <div className="ai-placeholder">
                <div className="ai-icon">🤖</div>
                <span>（預留）請輸入問題後即時解惑</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
