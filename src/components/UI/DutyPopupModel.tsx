import React, { useState } from "react";

interface DutyPopupModelProps {
  isOpen: boolean;
  date: Date | null;
  existingNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
  onDelete: () => void;
  children: React.ReactNode; 
}

const DutyPopupModel: React.FC<DutyPopupModelProps> = ({
  isOpen,
  date,
  existingNote,
  onSave,
  onClose,
  onDelete,
  children, 
}) => {
  const [note, setNote] = useState("");
  const [lastExistingNote, setLastExistingNote] = useState("");

  // Sync note with existingNote when modal opens or existingNote changes
  if (isOpen && existingNote !== lastExistingNote) {
    setNote(existingNote);
    setLastExistingNote(existingNote);
  }

  // Reset tracking when modal closes
  if (!isOpen && lastExistingNote !== "") {
    setLastExistingNote("");
  }

  if (!isOpen || !date) return null;

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-[#181d30] rounded-3xl p-7 w-[450px] max-w-[90%] shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-[slideIn_0.2s_ease-out] font-[Inter]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          {/* <h2 className="text-white text-2xl font-semibold m-0">Work Note</h2>
          <button
            className="bg-transparent border-none text-[#888] text-[32px] cursor-pointer p-0 leading-none transition-colors duration-200 hover:text-white"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="text-[#572aff] text-base mb-5 font-medium">
          {formatDate(date)}
        </div>
        <textarea
          className="w-full h-[150px] bg-[#0b0c1a] border-2 border-[#2a2f45] rounded-xl p-4 text-white text-[15px] font-[Inter] resize-none outline-none transition-colors duration-200 box-border focus:border-[#572aff] placeholder:text-[#666]"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add your work note for this day..."
          autoFocus
        />
        <div className="flex justify-end gap-3 mt-5">
          {existingNote && (
            <button
              className="mr-auto py-3 px-6 rounded-[10px] text-[15px] font-medium cursor-pointer transition-all duration-200 font-[Inter] border-none bg-[#ff3b3b] text-white hover:bg-[#ff5555]"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
          <button
            className="py-3 px-6 rounded-[10px] text-[15px] font-medium cursor-pointer transition-all duration-200 font-[Inter] border-none bg-[#2a2f45] text-white hover:bg-[#3a3f55]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="py-3 px-6 rounded-[10px] text-[15px] font-medium cursor-pointer transition-all duration-200 font-[Inter] border-none bg-[#572aff] text-white hover:bg-[#6b3fff] hover:-translate-y-[1px]"
            onClick={handleSave}
          >
            Save
          </button> */ children}

          
        </div>
      </div>
    </div>
  );
};

export default DutyPopupModel;
