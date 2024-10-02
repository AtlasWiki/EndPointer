import React from 'react';
import { CSS_CLASSES } from '../../constants/defaultview_contants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={CSS_CLASSES.MODAL_OVERLAY} onClick={onClose}>
      <div className={`${CSS_CLASSES.MODAL_CONTENT} max-w-6xl max-h-screen overflow-auto`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};