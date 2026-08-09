import React, { useState } from 'react';
import { Download, Check, X } from 'lucide-react';
import * as offlineService from '../offlineService';
import { useToast } from '../../../context/ToastContext';

// The 4 states from the offline-reading brief: Download / Downloading… /
// Downloaded ✓ Offline Available / Remove Download. Kept as a separate,
// distinctly-labeled action ("Save Offline") from BookDetailPage's existing
// "Download" button, which does an unrelated pre-existing .txt file export.
export default function DownloadButton({ book, variant = 'pill' }) {
  const toast = useToast();
  const [downloaded, setDownloaded] = useState(() => offlineService.isDownloaded(book.id));
  const [downloading, setDownloading] = useState(false);

  function handleDownload(e) {
    e.stopPropagation();
    setDownloading(true);
    setTimeout(() => {
      offlineService.downloadBook(book);
      setDownloading(false);
      setDownloaded(true);
      toast?.addToast(`"${book.title}" saved for offline reading 📥`, 'success');
    }, 700);
  }

  function handleRemove(e) {
    e.stopPropagation();
    offlineService.removeDownload(book.id);
    setDownloaded(false);
    toast?.addToast(`Removed "${book.title}" from downloads`, 'info');
  }

  if (variant === 'icon') {
    if (downloading) {
      return (
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/35"
          aria-label="Downloading for offline reading"
        >
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={downloaded ? handleRemove : handleDownload}
        aria-label={downloaded ? `Remove "${book.title}" from downloads` : `Save "${book.title}" for offline reading`}
        title={downloaded ? 'Offline Available — tap to remove' : 'Save Offline'}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
          downloaded ? 'bg-green text-white' : 'bg-black/35 text-white hover:bg-black/55'
        }`}
      >
        {downloaded ? <Check size={16} /> : <Download size={16} />}
      </button>
    );
  }

  if (downloading) {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center gap-2 rounded-full min-h-[52px] px-6 font-nunito font-bold text-[15px] bg-story-lavender text-story-navy opacity-70"
      >
        <span className="w-4 h-4 border-2 border-story-navy/30 border-t-story-navy rounded-full animate-spin" />
        Downloading…
      </button>
    );
  }

  if (downloaded) {
    return (
      <button
        onClick={handleRemove}
        className="inline-flex items-center justify-center gap-2 rounded-full min-h-[52px] px-6 font-nunito font-bold text-[15px] bg-story-mint text-green hover:bg-story-mint/70 transition-colors"
      >
        <Check size={18} /> Offline Available
        <X size={14} className="opacity-60" />
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center justify-center gap-2 rounded-full min-h-[52px] px-6 font-nunito font-bold text-[15px] bg-story-lavender text-story-navy hover:brightness-95 transition-all duration-200"
    >
      <Download size={18} /> Save Offline
    </button>
  );
}
