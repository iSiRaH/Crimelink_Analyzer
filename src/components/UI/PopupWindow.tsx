import type { ReactNode } from "react";
import ReactDOM from "react-dom";

interface PopupWindowProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const PopupWindow = ({
  isOpen,
  onClose,
  children,
  title,
  closeOnOverlayClick = true,
  className = "",
}: PopupWindowProps) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Popup Window"}
        className={`w-full max-w-[90%] rounded-3xl border border-dark-border bg-[#181d30] p-7 font-[Inter] shadow-[0_8px_32px_rgba(0,0,0,0.4)] md:w-1/2 ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {title ? (
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/20"
            aria-label="Close popup"
          >
            Close
          </button>
        </div>

        <div className="text-white">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default PopupWindow;
