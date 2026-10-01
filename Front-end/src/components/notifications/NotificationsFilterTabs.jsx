import React from 'react';

const NotificationsFilterTabs = ({ activeFilter, setActiveFilter, tabs }) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
    {tabs.map((tab) => {
      const isActive = activeFilter === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveFilter(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs 2xl:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            isActive
              ? 'bg-gradient-to-r from-[#FF0055] to-[#7928CA] text-white shadow-lg shadow-[#FF0055]/25 border border-white/20'
              : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
          }`}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
              isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-neutral-500'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default NotificationsFilterTabs;
