import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { BOOK_LANGUAGES } from '../../utils/mockData';
import * as settingsService from './settingsService';

const FONT_SIZES = [
  { label: 'Small', value: 14 },
  { label: 'Medium', value: 18 },
  { label: 'Large', value: 24 },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const [settings, setSettings] = useState(() => settingsService.getSettings());

  if (!user) return null;

  function update(patch) {
    setSettings(settingsService.saveSettings(patch));
    toast?.addToast('Settings saved', 'success');
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Settings</h1>
        <p className="text-sm text-slate-500 mb-8">Personalise how ZeroUp Reads works for you</p>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="font-bold text-slate-900 mb-1">Preferred reading language</h2>
          <p className="text-sm text-slate-500 mb-4">
            Used when you start a new story from your dashboard.
          </p>
          <select
            value={settings.preferredLanguage}
            onChange={(e) => update({ preferredLanguage: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">No preference</option>
            {BOOK_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-1">Default reading text size</h2>
          <p className="text-sm text-slate-500 mb-4">
            Applied when you open a new book in the reader.
          </p>
          <div className="flex gap-2">
            {FONT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => update({ readerFontSize: size.value })}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  settings.readerFontSize === size.value
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'border-slate-300 text-slate-700 hover:border-teal-400 hover:text-teal-600'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
