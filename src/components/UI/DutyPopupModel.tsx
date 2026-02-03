import React from "react";
import ReactDOM from "react-dom";

interface DutyPopupModelProps {
  isOpen: boolean;
  onClose: () => void;
  date?: Date | null;
  children?: React.ReactNode;
}

const DutyPopupModel: React.FC<DutyPopupModelProps> = ({
  isOpen,
  date,
  onClose,
  children,
}) => {
  if (!isOpen) {
    return null;
  }

  if (!isOpen || !date) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-[#181d30] rounded-3xl p-7 w-[700px] max-w-[90%] shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-[slideIn_0.2s_ease-out] font-[Inter]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col justify-between items-center mb-4">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DutyPopupModel;
