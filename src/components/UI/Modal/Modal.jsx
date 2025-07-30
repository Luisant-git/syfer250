"use client"
import "./Modal.scss"

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showClose = true,
  className = "",
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop">
      <div className={`modal modal--${size} ${className}`}>
        <div className="modal__header">
          {title && <h3 className="modal__title">{title}</h3>}
          {showClose && (
            <button className="modal__close" onClick={onClose} aria-label="Close">
              &times;
            </button>
          )}
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal

