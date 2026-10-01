import React from 'react';
import { Film, Image as ImageIcon, FileVideo, X, UploadCloud, Loader2 } from 'lucide-react';

export const UploadMediaDropzone = ({
  videoFile,
  handleVideoChange,
  handleRemoveVideo,
  thumbnail,
  thumbnailPreview,
  handleThumbnailChange,
  handleRemoveThumbnail,
  loading,
  uploadProgress,
  fieldErrors = {}
}) => (
  <div className="col-span-12 md:col-span-5 flex flex-col gap-4">
    {/* Video File Dropzone Card */}
    <div className={`glass-panel p-5 2xl:p-6 rounded-2xl border ${
      fieldErrors.videoFile ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10'
    } flex flex-col gap-3 transition-colors shadow-xl`}>
      <div className="flex items-center justify-between">
        <span className="text-xs 2xl:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Film className="w-4 h-4 text-[#FF2E7E]" />
          1. Video File Stream *
        </span>
        {fieldErrors.videoFile && (
          <span className="text-[10px] text-rose-400 font-semibold">{fieldErrors.videoFile}</span>
        )}
      </div>

      {videoFile ? (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#FF0055]/20 border border-[#FF0055]/40 flex items-center justify-center text-[#FF2E7E] shrink-0">
              <FileVideo className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{videoFile.name}</span>
              <span className="text-[10px] text-neutral-400">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB • Ready</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveVideo}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="border-2 border-dashed border-white/15 hover:border-[#FF0055]/60 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF0055]/20 to-[#7928CA]/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform text-[#FF2E7E]">
            <Film className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs 2xl:text-sm font-bold text-white">Drag & drop or click to upload video</span>
            <span className="text-[10px] 2xl:text-xs text-neutral-400">Supports MP4, MOV, MKV up to 100MB</span>
          </div>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
          />
        </label>
      )}
    </div>

    {/* Thumbnail Image Card */}
    <div className={`glass-panel p-5 2xl:p-6 rounded-2xl border ${
      fieldErrors.thumbnail ? 'border-rose-500/80 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-white/10'
    } flex flex-col gap-3 transition-colors shadow-xl`}>
      <div className="flex items-center justify-between">
        <span className="text-xs 2xl:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-pink-400" />
          2. Thumbnail Cover *
        </span>
        {fieldErrors.thumbnail && (
          <span className="text-[10px] text-rose-400 font-semibold">{fieldErrors.thumbnail}</span>
        )}
      </div>

      {thumbnailPreview ? (
        <div className="relative rounded-xl overflow-hidden aspect-video bg-neutral-900 border border-white/10 group">
          <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
            <label className="btn-primary py-1.5 px-3 text-xs cursor-pointer">
              Change
              <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleRemoveThumbnail}
              className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="border-2 border-dashed border-white/15 hover:border-[#FF0055]/60 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform text-pink-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs 2xl:text-sm font-bold text-white">Select High-Res Thumbnail</span>
            <span className="text-[10px] 2xl:text-xs text-neutral-400">1280x720 recommended (.jpg, .png, max 5MB)</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
          />
        </label>
      )}
    </div>

    {/* Action Button Panel */}
    <div className="glass-panel p-5 2xl:p-6 rounded-2xl border border-white/10 flex flex-col gap-3 shadow-xl">
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 2xl:py-3.5 text-sm font-bold gap-2 shadow-xl shadow-[#FF0055]/30 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
            <span>
              {uploadProgress < 100 
                ? `Uploading to Server (${uploadProgress}%)...` 
                : 'Encoding 4K stream on Cloudinary...'}
            </span>
          </>
        ) : (
          <>
            <UploadCloud className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>Publish Video Stream</span>
          </>
        )}
      </button>
      <p className="text-[10px] 2xl:text-xs text-neutral-400 text-center leading-tight">
        By submitting your video, you agree to Sktube Terms of Service.
      </p>
    </div>
  </div>
);

export default UploadMediaDropzone;
