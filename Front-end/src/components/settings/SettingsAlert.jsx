import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const SettingsAlert = ({ alert, onClose }) => {
  if (!alert) return null;
  const isSuccess = alert.type === 'success';

  return (
    <div
      className={`p-3 sm:p-4 2xl:p-5 rounded-2xl 2xl:rounded-3xl flex items-center justify-between gap-3 text-xs sm:text-sm 2xl:text-base font-semibold animate-fadeIn shadow-lg ${
        isSuccess
          ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-300'
          : 'bg-rose-500/15 border border-rose-500/35 text-rose-300'
      }`}
    >
      <div className="flex items-center gap-2.5 2xl:gap-3.5 min-w-0">
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 2xl:w-6 2xl:h-6 shrink-0 text-emerald-400" />
        ) : (
          <AlertCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 2xl:w-6 2xl:h-6 shrink-0 text-rose-400" />
        )}
        <span className="leading-snug">{alert.text}</span>
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

export default SettingsAlert;
