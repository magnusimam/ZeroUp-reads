import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import BookCoverArt from '../books/BookCoverArt';
import * as offlineService from './offlineService';

export default function DownloadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [entries, setEntries] = useState(() => offlineService.getDownloadEntries());

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  function handleRemove(entry) {
    offlineService.removeDownload(entry.book.id);
    setEntries(offlineService.getDownloadEntries());
    toast?.addToast(`Removed "${entry.book.title}" from downloads`, 'info');
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream font-nunito-sans">
      <Navbar />

      <div className="max-w-content mx-auto w-full px-4 sm:px-6 py-12 flex-1">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="font-playfair font-extrabold text-3xl text-cocoa">📥 My Downloads</h1>
            <p className="text-charcoal/60 mt-2">Read these anytime, even without an internet connection.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-card px-5 py-3 text-center">
            <p className="font-playfair font-bold text-xl text-cocoa">{offlineService.getStorageUsedLabel()}</p>
            <p className="text-xs text-charcoal/50">Storage Used</p>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-card p-12 text-center">
            <span className="text-5xl inline-block mb-3" aria-hidden="true">📭</span>
            <h2 className="font-playfair font-bold text-xl text-cocoa mb-2">No downloads yet</h2>
            <p className="text-charcoal/60 text-sm max-w-sm mx-auto">
              Open any book and tap "Save Offline" to keep it here for offline reading.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-card divide-y divide-gold/10 overflow-hidden">
            {entries.map((entry) => (
              <div key={entry.book.id} className="flex items-center gap-4 p-4 sm:p-5">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/book/${entry.book.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/book/${entry.book.id}`)}
                  className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 cursor-pointer"
                >
                  <BookCoverArt category={entry.book.category} style={{ position: 'absolute', inset: 0 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito font-bold text-sm text-charcoal truncate">{entry.book.title}</p>
                  <p className="text-xs text-charcoal/50 mt-0.5">
                    {entry.book.author} · Downloaded {new Date(entry.downloadedAt).toLocaleDateString()}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-green bg-green/10 rounded-full px-2.5 py-0.5">
                    ✓ Offline Available
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/read/${entry.book.id}`)}
                    className="text-xs font-bold text-coral hover:text-cocoa transition-colors"
                  >
                    Read →
                  </button>
                  <button
                    onClick={() => handleRemove(entry)}
                    className="text-xs font-bold text-charcoal/40 hover:text-red-500 transition-colors"
                  >
                    Remove Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
