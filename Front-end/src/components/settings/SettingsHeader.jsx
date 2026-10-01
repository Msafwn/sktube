import React from 'react';
import { ArrowLeft, Settings as SettingsIcon, Sparkles, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-3.5 sm:p-5 2xl:p-6 min-[2560px]:p-8 rounded-2xl 2xl:rounded-3xl glass-panel border border-white/10 shadow-xl">
      <div className="flex items-center gap-2.5 sm:gap-3.5 2xl:gap-5 min-w-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 sm:p-2.5 2xl:p-3.5 rounded-xl 2xl:rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-300 hover:text-white transition-all cursor-pointer shrink-0"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4 2xl:w-5 2xl:h-5" />
        </button>
        <div className="flex items-center gap-2.5 sm:gap-3.5 2xl:gap-4 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 2xl:w-14 2xl:h-14 min-[2560px]:w-16 min-[2560px]:h-16 rounded-xl 2xl:rounded-2xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30 shrink-0">
            <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-7 2xl:h-7 animate-[spin_12s_linear_infinite]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg 2xl:text-2xl min-[2560px]:text-3xl font-black text-white tracking-tight truncate">
                Channel & Account Settings
              </h1>
              <span className="text-[9px] 2xl:text-xs font-black px-2 py-0.5 rounded-md bg-[#FF0055]/20 text-[#FF2E7E] border border-[#FF0055]/30 uppercase hidden xs:inline-block">
                STUDIO 4K
              </span>
            </div>
            <p className="text-[10px] sm:text-xs 2xl:text-sm text-neutral-400 truncate mt-0.5">
              Manage your 4K channel profile, branding assets, and security credentials
            </p>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-xs 2xl:text-sm text-neutral-300 px-3.5 py-2 2xl:px-4 2xl:py-2.5 rounded-xl 2xl:rounded-2xl bg-white/5 border border-white/10 shrink-0 shadow-md">
        <Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#FF2E7E]" />
        <span className="font-semibold">Live 4K Cloud Sync</span>
      </div>
    </div>
  );
};

export default SettingsHeader;
