import React, { useState, useRef } from 'react';
import { 
  Edit3, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  Save 
} from 'lucide-react';

const EditVideoModal = ({ video, onClose, onSave }) => {
  const [title, setTitle] = useState(video?.title || '');
  const [description, setDescription] = useState(video?.description || '');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(video?.thumbnail || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Thumbnail image must be under 10MB');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    setSaving(true);
    setError('');
    try {
      let payload;
      if (thumbnailFile) {
        payload = new FormData();
        payload.append('title', title.trim());
        payload.append('description', description.trim());
        payload.append('thumbnail', thumbnailFile);
      } else {
        payload = {
          title: title.trim(),
          description: description.trim()
        };
      }

      await onSave(video._id, payload);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update video. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c0c14] border border-white/15 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF0055]/10 text-[#FF2E7E]">
              <Edit3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-white">Edit Video Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-300">Video Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
              className="bg-white/5 border border-white/10 focus:border-[#FF0055]/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none transition-colors"
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video..."
              rows={4}
              className="bg-white/5 border border-white/10 focus:border-[#FF0055]/60 rounded-xl p-3.5 text-xs sm:text-sm text-white outline-none transition-colors resize-none"
            />
          </div>

          {/* Thumbnail Preview & Change */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-300">Thumbnail Preview</label>
            <div className="flex items-center gap-4">
              <div className="relative aspect-video w-36 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                <img
                  src={thumbnailPreview || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=350&fit=crop"}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleThumbnailChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-[#FF2E7E]" />
                  <span>Change Thumbnail</span>
                </button>
                <span className="text-[10px] text-neutral-500">Supports JPG, PNG, WEBP (Max 10MB)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-5 py-2 text-xs font-bold gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideoModal;
