import React from 'react';
import { UploadCloud, Film, Image as ImageIcon, Loader2 } from 'lucide-react';
import UploadAlert from './UploadAlert';

export const UploadMobileForm = ({
  title,
  handleTitleChange,
  description,
  handleDescriptionChange,
  videoFile,
  handleVideoChange,
  thumbnail,
  handleThumbnailChange,
  handleSubmit,
  loading,
  uploadProgress,
  message,
  onCloseMessage,
  fieldErrors = {}
}) => (
  <div className="md:hidden min-h-[calc(100vh-5rem)] flex flex-col justify-start max-w-xl mx-auto p-3 sm:p-4 pb-24 relative">
    <div className="flex flex-col gap-3 relative z-10">
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl glass-panel border border-white/10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-lg shadow-[#FF0055]/30 shrink-0">
          <UploadCloud className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight">Creator Studio</h1>
          <p className="text-[10px] text-neutral-400">Upload 4K streams with Cloudinary & HLS transcoding</p>
        </div>
      </div>

      <UploadAlert message={message} onClose={onCloseMessage} />

      {/* Compact Form */}
      <form onSubmit={handleSubmit} className="glass-card p-3.5 sm:p-5 rounded-2xl flex flex-col gap-2.5">
        {/* Title */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-300">
              Video Title *
            </label>
            {fieldErrors.title && (
              <span className="text-[8px] text-rose-400 font-medium truncate max-w-[150px]">{fieldErrors.title}</span>
            )}
          </div>
          <input
            type="text"
            placeholder="e.g. Next-Gen Full-Stack Tutorial"
            value={title}
            onChange={handleTitleChange}
            className={`w-full bg-[#12121c] border ${
              fieldErrors.title ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus:border-[#FF0055]/50'
            } rounded-xl px-3 h-8.5 text-xs text-white outline-none transition-colors`}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-300">
              Description *
            </label>
            {fieldErrors.description && (
              <span className="text-[8px] text-rose-400 font-medium truncate max-w-[150px]">{fieldErrors.description}</span>
            )}
          </div>
          <textarea
            rows="2"
            placeholder="Tell viewers about your video..."
            value={description}
            onChange={handleDescriptionChange}
            className={`w-full bg-[#12121c] border ${
              fieldErrors.description ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10 focus:border-[#FF0055]/50'
            } rounded-xl p-2 text-xs text-white outline-none resize-none transition-colors`}
          ></textarea>
        </div>

        {/* 2-Column File Pickers */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded-xl ${
            fieldErrors.videoFile ? 'bg-rose-500/5 border-rose-500 ring-1 ring-rose-500/30' : 'bg-white/[0.03] border-white/15 hover:border-[#FF0055]/50'
          } border border-dashed flex flex-col items-center justify-center text-center gap-0.5 cursor-pointer transition-colors relative`}>
            <Film className={`w-4 h-4 ${fieldErrors.videoFile ? 'text-rose-400' : 'text-[#FF2E7E]'}`} />
            <span className="text-[10px] font-semibold text-white truncate max-w-full px-1">
              {videoFile ? videoFile.name : 'Select Video (.mp4)'}
            </span>
            {fieldErrors.videoFile && (
              <span className="text-[7.5px] text-rose-400 font-medium truncate">{fieldErrors.videoFile}</span>
            )}
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className={`p-2 rounded-xl ${
            fieldErrors.thumbnail ? 'bg-rose-500/5 border-rose-500 ring-1 ring-rose-500/30' : 'bg-white/[0.03] border-white/15 hover:border-[#FF0055]/50'
          } border border-dashed flex flex-col items-center justify-center text-center gap-0.5 cursor-pointer transition-colors relative`}>
            <ImageIcon className={`w-4 h-4 ${fieldErrors.thumbnail ? 'text-rose-400' : 'text-pink-400'}`} />
            <span className="text-[10px] font-semibold text-white truncate max-w-full px-1">
              {thumbnail ? thumbnail.name : 'Select Thumbnail (.jpg)'}
            </span>
            {fieldErrors.thumbnail && (
              <span className="text-[7.5px] text-rose-400 font-medium truncate">{fieldErrors.thumbnail}</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Publish Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-1 w-full py-2.5 text-xs gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {uploadProgress < 100 
                  ? `Uploading file (${uploadProgress}%)...` 
                  : 'Encoding 4K stream on Cloudinary...'}
              </span>
            </>
          ) : (
            <span>Publish Video Stream</span>
          )}
        </button>
      </form>
    </div>
  </div>
);

export default UploadMobileForm;
