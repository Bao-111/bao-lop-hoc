import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  itemName,
  message,
  confirmLabel = 'Xác nhận xóa',
  cancelLabel = 'Hủy bỏ',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1e]/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#0b1329] rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDestructive ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30' : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 id="confirm-modal-title" className="text-base font-semibold text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-200 transition-colors rounded-lg p-1 cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {itemName && (
            <div className="mb-3 px-3 py-2 bg-[#070d1e] border border-cyan-500/20 rounded-lg text-sm font-medium text-slate-200">
              Đối tượng: <span className="font-semibold text-cyan-300">{itemName}</span>
            </div>
          )}

          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>

        <div className="px-6 py-4 bg-[#070d1e] border-t border-cyan-500/20 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-[#0b1329] border border-cyan-500/30 rounded-lg hover:bg-cyan-950/40 hover:text-white transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-xs ${
              isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
