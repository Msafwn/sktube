import React from 'react';

const HomeFilters = ({ categories, activeCategory, onSelectCategory, isPending = false }) => {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive ? 'btn-pill-active shadow-lg shadow-[#FF0055]/20' : 'glass-pill hover:bg-white/10'
            } ${isActive && isPending ? 'opacity-80 scale-95' : ''}`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default HomeFilters;
