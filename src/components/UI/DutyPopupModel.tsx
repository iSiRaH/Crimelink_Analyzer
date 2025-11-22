import React from "react";
import ReactDOM from "react-dom";

interface DutyPopupModelProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DutyPopupModel: React.FC<DutyPopupModelProps> = ({
  open,
  onClose,
  children,
}) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white p-5 rounded-lg w-[700px]" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  );
};

export default DutyPopupModel;
