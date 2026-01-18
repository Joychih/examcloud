type ModalProps = {
  title: string;
  description: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
};

export default function Modal({
  title,
  description,
  primaryLabel = "升級",
  secondaryLabel = "取消",
  onPrimary,
  onSecondary,
}: ModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        <p className="muted">{description}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={onPrimary}>
            {primaryLabel}
          </button>
          <button className="btn secondary" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
