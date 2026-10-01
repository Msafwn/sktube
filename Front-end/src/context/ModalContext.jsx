import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Sparkles, Trash2, X } from 'lucide-react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState(null); // { isOpen, title, message, type, confirmText, cancelText, onConfirm, onCancel, isConfirm }
  const [toastConfig, setToastConfig] = useState(null); // { isOpen, message, type }

  const closeModal = useCallback(() => {
    setModalConfig(null);
  }, []);

  // Show generic or alert popup
  const showAlert = useCallback(({
    title = 'Notice',
    message,
    type = 'info', // 'info' | 'success' | 'error' | 'warning'
    confirmText = 'OK',
    onConfirm
  }) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      isConfirm: false,
      onConfirm: () => {
        closeModal();
        if (onConfirm) onConfirm();
      }
    });
  }, [closeModal]);

  // Show confirmation popup (e.g. Delete, Clear History)
  const showConfirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    type = 'danger', // 'danger' | 'warning' | 'info'
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
  }) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      isConfirm: true,
      onConfirm: async () => {
        closeModal();
        if (onConfirm) await onConfirm();
      },
      onCancel: () => {
        closeModal();
        if (onCancel) onCancel();
      }
    });
  }, [closeModal]);

  // Floating toast notification
  const showToast = useCallback(({ message, type = 'info', duration = 3000 }) => {
    setToastConfig({ isOpen: true, message, type });
    setTimeout(() => {
      setToastConfig(null);
    }, duration);
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (modalConfig) closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalConfig, closeModal]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showToast, closeModal }}>
      {children}

      {/* ============================================================== */}
      {/* 🌟 GLOBAL POPUP MODAL DIALOG                                  */}
      {/* ============================================================== */}
      {modalConfig?.isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={closeModal}
        >
          <div 
            className="w-full max-w-sm sm:max-w-md glass-panel rounded-3xl p-6 sm:p-7 border border-white/15 shadow-2xl relative flex flex-col items-center text-center animate-scaleIn my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Glow Bar */}
            <div 
              className={`absolute top-0 left-12 right-12 h-1 rounded-b-full shadow-lg ${
                modalConfig.type === 'danger' || modalConfig.type === 'error'
                  ? 'bg-rose-500 shadow-rose-500/50'
                  : modalConfig.type === 'success'
                  ? 'bg-emerald-500 shadow-emerald-500/50'
                  : modalConfig.type === 'warning'
                  ? 'bg-amber-500 shadow-amber-500/50'
                  : 'bg-[#FF0055] shadow-[#FF0055]/50'
              }`}
            />

            {/* Close Top-Right Icon */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Badge */}
            <div 
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mt-1 border shadow-inner ${
                modalConfig.type === 'danger' || modalConfig.type === 'error'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-500 shadow-rose-500/10'
                  : modalConfig.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                  : modalConfig.type === 'warning'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-amber-500/10'
                  : 'bg-[#FF0055]/15 border-[#FF0055]/30 text-[#FF2E7E] shadow-[#FF0055]/10'
              }`}
            >
              {modalConfig.type === 'danger' ? (
                <Trash2 className="w-7 h-7" />
              ) : modalConfig.type === 'error' ? (
                <AlertCircle className="w-7 h-7" />
              ) : modalConfig.type === 'success' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : modalConfig.type === 'warning' ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <Sparkles className="w-7 h-7" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mb-2">
              {modalConfig.title}
            </h3>

            {/* Message Body */}
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6 px-2">
              {modalConfig.message}
            </p>

            {/* Action Buttons */}
            <div className="w-full flex items-center gap-3">
              {modalConfig.isConfirm && (
                <button
                  type="button"
                  onClick={modalConfig.onCancel}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white text-xs sm:text-sm font-bold border border-white/10 transition-colors cursor-pointer"
                >
                  {modalConfig.cancelText || 'Cancel'}
                </button>
              )}

              <button
                type="button"
                onClick={modalConfig.onConfirm}
                className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg cursor-pointer ${
                  modalConfig.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : modalConfig.type === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-linear-to-r from-[#FF0055] to-[#7928CA] hover:opacity-90 text-white shadow-[#FF0055]/30'
                }`}
              >
                {modalConfig.confirmText || (modalConfig.isConfirm ? 'Confirm' : 'Dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🍞 FLOATING TOAST NOTIFICATION                                */}
      {/* ============================================================== */}
      {toastConfig?.isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel border border-white/15 shadow-2xl animate-slideUp text-white text-xs sm:text-sm font-semibold max-w-sm">
          {toastConfig.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastConfig.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-[#FF2E7E] shrink-0" />
          )}
          <span className="leading-snug">{toastConfig.message}</span>
          <button
            onClick={() => setToastConfig(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default ModalContext;
