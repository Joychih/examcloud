export default function CreatorDashboard() {
  return (
    <div className="stack">
      <h2 className="page-title">命題者總覽</h2>
      <div className="card-grid">
        <div className="card">
          <h3>題庫</h3>
          <p>管理並重用題目範本。</p>
        </div>
        <div className="card">
          <h3>試卷草稿</h3>
          <p>追蹤草稿與發布狀態。</p>
        </div>
        <div className="card">
          <h3>公告</h3>
          <p>最新標籤規範與即將更新內容。</p>
        </div>
      </div>
    </div>
  );
}
