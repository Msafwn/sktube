import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const UploadAlert = ({ message, onClose }) => {
  if (!message) return null;
  const isSuccess = message.type === 'success';

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold relative z-10 animate-fadeIn shadow-lg ${
        isSuccess
          ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-300'
          : 'bg-rose-500/15 border border-rose-500/35 text-rose-300'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
        ) : (
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
        )}
        <span className="leading-snug">{message.text}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default UploadAlert;
