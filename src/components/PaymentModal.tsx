type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
};

export default function PaymentModal({ open, onClose, onPaid }: PaymentModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>升級為 VIP</h3>
        <p className="muted">此為示意付款介面，點擊確認後切換為付費方案。</p>
        <div className="stack" style={{ marginTop: 12 }}>
          <div className="card" style={{ padding: 12 }}>
            <strong>VIP 方案</strong>
            <div className="muted">解鎖所有試題與解析影片</div>
            <div style={{ marginTop: 8 }}>NT$ 199 / 月</div>
          </div>
          <div className="form-grid">
            <label>付款方式</label>
            <select defaultValue="credit">
              <option value="credit">信用卡</option>
              <option value="linepay">LINE Pay</option>
              <option value="atm">ATM 轉帳</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={onPaid}>
              確認付款
            </button>
            <button className="btn secondary" onClick={onClose}>
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
