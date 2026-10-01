import React from 'react';
import { User, Image as ImageIcon, ShieldCheck } from 'lucide-react';

export const SettingsTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'profile', label: 'Profile', fullLabel: 'Channel Profile', icon: User },
    { id: 'media', label: 'Branding', fullLabel: 'Media & Branding', icon: ImageIcon },
    { id: 'password', label: 'Security', fullLabel: 'Security & Password', icon: ShieldCheck }
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 2xl:gap-4 p-1 sm:p-1.5 2xl:p-2 rounded-2xl 2xl:rounded-3xl bg-white/[0.03] border border-white/10 shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center gap-2 py-2 sm:py-2.5 2xl:py-3.5 px-2 2xl:px-4 rounded-xl 2xl:rounded-2xl text-xs sm:text-sm 2xl:text-base font-bold transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-gradient-to-r from-[#FF0055] to-[#7928CA] text-white shadow-lg shadow-[#FF0055]/25 border border-white/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 2xl:w-5 2xl:h-5 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline truncate">{tab.fullLabel}</span>
            <span className="sm:hidden truncate text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SettingsTabs;
