import React from "react";

interface PopupAdminProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const PopupAdmin: React.FC<PopupAdminProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "w-96" 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className={`bg-white p-6 rounded-lg ${maxWidth} max-w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default PopupAdmin;