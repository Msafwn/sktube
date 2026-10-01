import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Film, 
  UploadCloud, 
  Search, 
  Edit3, 
  Trash2 
} from 'lucide-react';

const DashboardVideoTable = ({ 
  videos, 
  onEdit, 
  onDelete, 
  onTogglePublish, 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <div className="glass-panel p-5 2xl:p-7 rounded-2xl border border-white/10 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h2 className="text-lg 2xl:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Channel Content</span>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-neutral-300 font-semibold">
              {videos.length} Streams
            </span>
          </h2>
          <p className="text-xs 2xl:text-sm text-neutral-400 mt-0.5">
            Manage your uploaded videos, live replays, and visibility status
          </p>
        </div>

        {/* Search filter */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channel videos..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs 2xl:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF0055]/50 transition-all"
          />
        </div>
      </div>

      {/* Videos List / Table */}
      {videos.length === 0 ? (
        <div className="py-16 text-center">
          <Film className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No videos uploaded yet</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Get started by uploading your first stream or video to SkTube Creator Studio.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#FF0055] text-white text-xs font-bold shadow-lg hover:bg-[#FF0055]/80 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload First Video</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] 2xl:text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3 px-3">Video</th>
                <th className="py-3 px-3">Visibility</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Views</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs 2xl:text-sm">
              {videos.map((vid) => (
                <tr key={vid._id} className="hover:bg-white/2 transition-colors group">
                  {/* Thumbnail & Title */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3 min-w-60">
                      <div className="relative aspect-video w-24 2xl:w-28 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                        <img 
                          src={vid.thumbnail || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=350&fit=crop"} 
                          alt={vid.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white truncate group-hover:text-[#FF2E7E] transition-colors">
                          {vid.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate max-w-xs mt-0.5">
                          {vid.description || "No description provided"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Visibility / Status Toggle */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <button
                      onClick={() => onTogglePublish(vid._id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                        vid.isPublished !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${vid.isPublished !== false ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span>{vid.isPublished !== false ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>

                  {/* Upload Date */}
                  <td className="py-3 px-3 text-neutral-400 whitespace-nowrap">
                    {vid.createdAt ? new Date(vid.createdAt).toLocaleDateString() : 'Recent'}
                  </td>

                  {/* Views Count */}
                  <td className="py-3 px-3 text-white font-semibold whitespace-nowrap">
                    {vid.views?.toLocaleString() || "0"}
                  </td>

                  {/* Actions (Edit & Delete) */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => onEdit(vid)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit video title, description & thumbnail"
                      >
                        <Edit3 className="w-4 h-4 text-[#FF2E7E]" />
                      </button>
                      <button 
                        onClick={() => onDelete(vid._id)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete video permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardVideoTable;
