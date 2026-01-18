import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSchools } from "../data/api";
import type { School } from "../data/models";

export default function SchoolList() {
  const [schools, setSchools] = useState<School[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSchools().then(setSchools);
  }, []);

  return (
    <div className="stack">
      <h2 className="page-title">公開學校列表</h2>
      <div className="card-grid">
        {schools.map((school) => (
          <div key={school.id} className="card">
            <h3>{school.name}</h3>
            <p className="muted">
              {school.region} · {school.examCount} 份試卷
            </p>
            {school.isFreeTrial && (
              <span className="badge">免費試用</span>
            )}
            <div style={{ marginTop: 12 }}>
              <button
                className="btn ghost"
                onClick={() => navigate(`/exams/${school.id}`)}
              >
                查看試卷
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
