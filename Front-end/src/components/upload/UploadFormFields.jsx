import React from 'react';
import { Layers, Globe, Lock } from 'lucide-react';

export const UploadFormFields = ({
  title,
  handleTitleChange,
  description,
  handleDescriptionChange,
  category,
  setCategory,
  visibility,
  setVisibility,
  fieldErrors = {}
}) => (
  <div className="glass-panel p-6 2xl:p-8 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl">
    <div className="flex items-center justify-between pb-2 border-b border-white/5">
      <span className="text-xs 2xl:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <Layers className="w-4 h-4 text-[#FF2E7E]" />
        Video Metadata & Details
      </span>
      <span className="text-[10px] 2xl:text-xs text-neutral-500">Required fields marked with *</span>
    </div>

    {/* Title Input */}
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs 2xl:text-sm font-bold text-neutral-200">
          Video Title *
        </label>
        <div className="flex items-center gap-2">
          {fieldErrors.title && (
            <span className="text-[10px] text-rose-400 font-semibold">{fieldErrors.title}</span>
          )}
          <span className="text-[10px] text-neutral-500 font-mono">{title.length}/100</span>
        </div>
      </div>
      <input
        type="text"
        maxLength={100}
        placeholder="e.g. Next-Gen Full-Stack Web Development Masterclass 2026"
        value={title}
        onChange={handleTitleChange}
        className={`w-full bg-[#12121c] border ${
          fieldErrors.title ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus:border-[#FF0055]/60'
        } rounded-xl px-3.5 h-11 2xl:h-12 text-sm text-white placeholder-neutral-500 outline-none transition-colors`}
      />
    </div>

    {/* Description Textarea */}
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs 2xl:text-sm font-bold text-neutral-200">
          Video Description *
        </label>
        <div className="flex items-center gap-2">
          {fieldErrors.description && (
            <span className="text-[10px] text-rose-400 font-semibold">{fieldErrors.description}</span>
          )}
          <span className="text-[10px] text-neutral-500 font-mono">{description.length}/5000</span>
        </div>
      </div>
      <textarea
        rows="6"
        maxLength={5000}
        placeholder="Tell viewers what your video is about, add timestamps, resources, links, and tags..."
        value={description}
        onChange={handleDescriptionChange}
        className={`w-full bg-[#12121c] border ${
          fieldErrors.description ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus:border-[#FF0055]/60'
        } rounded-xl p-3.5 text-sm text-white placeholder-neutral-500 outline-none resize-none transition-colors leading-relaxed`}
      ></textarea>
    </div>

    {/* Category & Visibility Settings */}
    <div className="grid grid-cols-2 gap-3 pt-1">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] 2xl:text-xs font-bold text-neutral-300">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#12121c] border border-white/10 focus:border-[#FF0055]/60 rounded-xl px-3 h-10 2xl:h-11 text-xs 2xl:text-sm text-white outline-none cursor-pointer"
        >
          <option value="tech">Technology & Coding</option>
          <option value="gaming">Gaming & Esports</option>
          <option value="entertainment">Cinema & Entertainment</option>
          <option value="education">Education & Science</option>
          <option value="music">Music & Live Audio</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] 2xl:text-xs font-bold text-neutral-300">Visibility</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setVisibility('public')}
            className={`flex items-center justify-center gap-1.5 h-10 2xl:h-11 rounded-xl text-xs 2xl:text-sm font-bold transition-all cursor-pointer ${
              visibility === 'public'
                ? 'bg-[#FF0055]/20 border border-[#FF0055] text-white shadow-md shadow-[#FF0055]/20'
                : 'bg-[#12121c] border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public</span>
          </button>
          <button
            type="button"
            onClick={() => setVisibility('private')}
            className={`flex items-center justify-center gap-1.5 h-10 2xl:h-11 rounded-xl text-xs 2xl:text-sm font-bold transition-all cursor-pointer ${
              visibility === 'private'
                ? 'bg-purple-500/20 border border-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'bg-[#12121c] border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Private</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default UploadFormFields;
