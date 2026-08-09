import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import { BOOK_CATEGORIES, BOOK_LANGUAGES, BOOK_LEVELS } from '../../utils/mockData';
import * as publishingService from './publishingService';

const EMPTY_FORM = {
  title: '',
  language: BOOK_LANGUAGES[0],
  level: BOOK_LEVELS[0],
  category: BOOK_CATEGORIES[0],
  content: '',
};

export default function NewDraftPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title || !form.content) {
      setError('Please fill in a title and some content.');
      return;
    }

    const submission = publishingService.createDraft(
      { title: form.title, category: form.category, language: form.language, level: form.level, content: [form.content] },
      { id: user.id, name: user.name }
    );
    navigate(`/publishing/${submission.id}`);
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-2xl mx-auto w-full px-6 py-10 flex-1">
        <Link to="/publishing" className="inline-block text-sm text-teal-600 hover:text-teal-700 mb-6">
          ← Back to Publishing Studio
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h1 className="text-lg font-bold text-slate-900 mb-5">New Draft</h1>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. The Clever Spider"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                <select name="language" value={form.language} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-teal-500">
                  {BOOK_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reading Level</label>
                <select name="level" value={form.level} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-teal-500">
                  {BOOK_LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-teal-500">
                  {BOOK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={8}
                placeholder="Write the story here…"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Save Draft
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
