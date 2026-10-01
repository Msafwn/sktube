import React from 'react';

const ExploreCard = ({ item, isSelected, onSelect }) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.title)}
      className={`px-4 py-2.5 2xl:px-5 2xl:py-3 rounded-2xl flex items-center gap-3 transition-all duration-200 cursor-pointer border text-left shrink-0 whitespace-nowrap group ${
        isSelected 
          ? 'border-[#FF0055] bg-linear-to-r from-[#FF0055]/20 via-[#FF2E7E]/10 to-[#7928CA]/20 text-white shadow-lg shadow-[#FF0055]/25 ring-1 ring-[#FF0055]/40' 
          : 'glass-panel border-white/5 hover:border-white/20 text-neutral-300 hover:text-white hover:bg-white/4'
      }`}
    >
      <div className={`w-8 h-8 2xl:w-9 2xl:h-9 rounded-xl bg-linear-to-tr ${item.color} flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className="w-4 h-4 2xl:w-4.5 2xl:h-4.5" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs sm:text-sm 2xl:text-base font-bold text-white leading-tight">
          {item.title}
        </span>
        <span className="text-[10px] 2xl:text-xs text-neutral-400 leading-tight mt-0.5 font-normal">
          {item.desc}
        </span>
      </div>
    </button>
  );
};

export default ExploreCard;
