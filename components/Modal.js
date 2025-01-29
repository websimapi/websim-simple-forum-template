function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="card-header">
          <h2>{title}</h2>
          <button className="button" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}