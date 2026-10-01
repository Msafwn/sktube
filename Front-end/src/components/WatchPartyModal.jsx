import React, { useState } from 'react';
import { Users, Copy, Check, X, Sparkles, Radio, Play } from 'lucide-react';

export const WatchPartyModal = ({
  isOpen,
  onClose,
  activePartyId,
  partyMemberCount,
  onJoinParty,
  onCreateParty,
  onLeaveParty
}) => {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (activePartyId && navigator.clipboard) {
      navigator.clipboard.writeText(activePartyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-3xl border border-white/15 bg-[#0b0b13]/95 p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF0055]/20 border border-[#FF0055]/30 flex items-center justify-center text-[#FF2E7E]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Watch Party</h3>
              <p className="text-[11px] text-neutral-400">Co-watch and sync videos in real-time with friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Party State */}
        {activePartyId ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Party Active
                </span>
                <span className="text-xs text-neutral-300 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#FF2E7E]" />
                  {partyMemberCount} {partyMemberCount === 1 ? 'member' : 'members'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Party Code</span>
                  <span className="text-sm font-mono font-black text-white">{activePartyId}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-neutral-400 text-center leading-relaxed">
              Whenever you play, pause, or seek the video, it will automatically synchronize for all friends in this party room.
            </p>

            <button
              onClick={() => {
                onLeaveParty();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
            >
              Leave Watch Party
            </button>
          </div>
        ) : (
          /* Create or Join Party State */
          <div className="flex flex-col gap-4 py-2">
            {/* Create Option */}
            <button
              onClick={() => onCreateParty()}
              className="btn-primary w-full py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF0055]/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Host New Watch Party</span>
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">OR JOIN WITH CODE</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            {/* Join Option */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Party Code (e.g. SKT-942)"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#12121c] border border-white/10 focus:border-[#FF0055]/60 rounded-xl px-3 h-10 text-xs sm:text-sm text-white placeholder-neutral-500 uppercase font-mono outline-none"
                />
                <button
                  onClick={() => {
                    if (roomCodeInput.trim()) {
                      onJoinParty(roomCodeInput.trim());
                      setRoomCodeInput('');
                      onClose();
                    }
                  }}
                  disabled={!roomCodeInput.trim()}
                  className="px-4 h-10 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPartyModal;
