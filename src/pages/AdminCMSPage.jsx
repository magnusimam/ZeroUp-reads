import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { MOCK_BOOKS } from '../utils/mockData';

const LANGUAGES = ["English", "Swahili", "Yoruba", "Zulu", "French", "Hause", "igbo","Pidgin"];
const LEVELS =["Beginner", "Intermediate", "Advance"];
const CATEGORIES = [" Storybook", "Science", "History", "Mathematics", "Technology", "Health", "Arts", "Nature"];

export default function AdminCMSPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState(MOCK_BOOKS);
  const [showForm, setShowForm] = useState(false);
  const [successMSG, setSuccessMSG] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [translateModal, setTranslateModal] = useState("");
  const [translateLang, setTranslateLang] = useState("");
  const [translating, setTranslating] = useState(false);

  const [form, setForm] = useState({
    title:"",
    author:"",
    language:"English",
    level:"Beginner",
    category:"Storybook",
    content:"",
  });

  const[ formError, setFormError] = useState("")

  //REDIRECT IF NOT ADMIN
  if (!user || user.role !== "admin"){
    navigate("/library");
    return null;
  }

  function handleFormChange(e) {
    setForm({...form,  [e.target.name]: e.target.value});
  }

  function handleUpLoad(e) {
    e.preventDefault();
    setFormError("");

    if (!form.title || !form.author || !form.content) {
      setFormError("Please fill in title, author, and content.");
      return;
    }

    const newBook = {
      id: String(books.length + 1),
      title: form.title,
      author: form.author,
      language: form.language,
      level: form.level,
      category: form.category,
      totalPages: Math.ceil(form.content.split(" ").length / 300),
      content: [form.content]
    };
    setBooks([newBook, ...books]);
    setForm({ title: "", author: "", language:"English", level: "Beginner", category:"Storybook", content:""});
    setShowForm(false);
    setSuccessMSG("Book uploaded successfully!");
    setTimeout(() => setSuccessMSG(""), 3000);
  }

  function handleDelete(id) {
    setBooks(books.filter(b => b.id !== id));
    setDeleteConfirm(null);
    setSuccessMSG("Book deleted successfully!");
    setTimeout(() => setSuccessMSG(""), 3000);
  }

  function handleTranslate() {
    if (!translateLang) return;
    setTranslating(true);
  // stub - real Cloudflare Api goes here later
  setTimeout(() => {
    const original = books.find(b => b.id === translateModal);
    const translated = {
      ...original,
      id: String(books.length + 1),
      language: translateLang,
      title: `${original.title} (${translateLang})`,
    };
    setBooks([...books, translated]);
    setTranslating(false);
    setTranslateModal(null);
    setTranslateLang("");
    setSuccessMSG(`Book translated to ${translateLang} and added to library! `);
    setTimeout(() => setSuccessMSG(""), 4000);
  }, 2000);
  }

return (
  <div className='bg-slate-50 min-h-screen flex flex-col'>
<Navbar />

  <div className='max-w-5xl mx-auto w-full px-6 py-10 flex-1'>

    {/* HEADER */}
    <div className='flex items-center justify-between mb-8'>
      <div>
        <h1 className='text-2xl font-bold  text-slate-900'>Admin Dashboard</h1>
        <p className='text-sm text-slate-500 mt-1'>
          Manage books, uploads, and translations
        </p>
      </div>
      <button
      onClick={() => setShowForm(!showForm)}
      className='bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm'
      >
        {showForm ? "cancel" : "+ Upload Book"}
      </button>
    </div>

    {/* SUCCESS MESSAGE */}
    {successMSG && (
      <div className='mb-6 px-4 py-3 bg-teal-50 border border-teal-200 text-teal-700 text-sm rounded-xl font-medium'>
        {successMSG}
        </div>
    )}

    {/* UPLOAD FORM */}
    {showForm && (
      <div className='bg-white rounded-2xl border border-slate-200 p-6 mb-8'>
        <h2 className='text-lg font-bold text-slate-900 mb-5'>Upload New Book</h2>

        {formError && (
          <div className='mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl'>
            {formError}
            </div>
        )}
        <form onSubmit={handleUpLoad} className='space-y-4'>
          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
             <label className='block text-sm font-medium text-slate-700 mb-1'>
              Book Title
             </label>
             <input
             name='title'
             value={form.title}
             onChange={handleFormChange}
             placeholder='e.g. The Clever Spider'
             className='w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-teal-500'
             />
          </div>

          <div>
             <label className='block text-sm font-medium text-slate-700 mb-1'>
              Author Name
             </label>
             <input
             name='author'
             value={form.author}
             onChange={handleFormChange}
             placeholder='e.g. Ngozi Eze'
             className='w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-teal-500'
             />
          </div>
          </div>

          <div>
             <label className='block text-sm font-medium text-slate-700 mb-1'>
              Language
             </label>
             <select
             name='language'
             value={form.language}
             onChange={handleFormChange}
             className='w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-teal-500'
             >
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
             </select>
          </div>

          <div>
             <label className='block text-sm font-medium text-slate-700 mb-1'>
              Reading Level
             </label>
             <select
             name='level'
             value={form.level}
             onChange={handleFormChange}
             className='w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-teal-500'
             >
              {LEVELS.map(l => <option key={l}>{l}</option>)}
             </select>
          </div>

          <div>
             <label className='block text-sm font-medium text-slate-700 mb-1'>
              Category
             </label>
             <select
             name='category'
             value={form.category}
             onChange={handleFormChange}
             className='w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-teal-500'
             >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
             </select>
          </div>

          <div>
             <label className='block text-sm font-medium text-slate-700 mb-1'>
              Book Content
             </label>
             <textarea
             name='content'
             value={form.content}
             onChange={handleFormChange}
             placeholder='Paste the full book content here...'
             className='w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-teal-500'
             />
          </div>
          <button
          type='submit'
          className='w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors'
          >
            Upload Book to Library
          </button>
        </form>
        </div>
    )}

    {/* BOOK TABLE */}
    <div className='bg-white rounded-2xl border border-slate-200 overflow-hidden'>
      <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between'>
        <h2 className='font-bold text-slate-900'>
          All Books
           <span className='ml-2 text-sm font-normal text-slate-400'>
            ({books.length} total)
           </span>
        </h2>
      </div>

      {/* MOBIE VIEW */}
      <div className='sm:hidden divide-y divide-slate-100'>
        {books.map(book => (
          <div key={book.id} className='p-4'>
            <div className='flex items-start justify-between'>
              <div className='flex-1 min-w-0'>
                <p className='font-semibold text-sm text-slate-900 truncate'>{book.title}</p>
                <p className='text-xs text-slate-500 mt-0.5'>{book.author}</p>
                <div className='flex gap-1 mt-2 flex-wrap'>
                  <span className='text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full'>
                    {book.language}
                  </span>
                  <span className='text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full'>
                    {book.level}
                  </span>
                  {book.category && (
                    <span className='text-[10px] bg-slate-100 text-teal-600 px-2 py-0.5 rounded-full'>
                      {book.category}
                    </span>
                  )}
                  </div>
                </div>
             </div>
             <div className='flex gap-2 mt-3'>
              <button
              onClick={() => setDeleteConfirm(book.id)}
              className='flex-1 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50'
              >
                Delete
              </button>
              <button
              onClick={() => setTranslateModal(book.id)}
              className='flex-1 py-1.5 rounded-lg border border-teal-200 text-teal-600 text-xs font-medium hover:bg-teal-50'
              >
                Translate
              </button>
              </div>
              </div>
        ))}
      </div>

      {/* DESKTOP VIEW */}
      <div className='hidden sm:block overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-slate-50 border-b border-slate-200'>
            <tr>
              <th className='text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Title</th>
              <th className='text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Author</th>
              <th className='text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Language</th>
              <th className='text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Level</th>
              <th className='text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Category</th>
              <th className='text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {books.map(book=> (
              <tr key={book.id} className='hover:bg-slate-50 transition-colors'>
                <td className='px-6 py-4'>
                  <p className='font-medium text-sm text-slate-900 max-w-xs truncate'>{book.title}</p>
                </td>
                <td className='px-4 py-4 text-sm text-slate-600'>{book.author}</td>
                <td className='px-4 py-4'>
                  <span className='text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium'>
                    {book.language}
                  </span>
                </td>
                <td className='px-6 py-4'>
                  <span className='font-medium text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full'>
                    {book.level}
                    </span>
                </td>

                <td className='px-4 py-4'>
                  <span className='text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium'>
                    {book.category || 'Storybook'}
                  </span>
                </td>
                <td className='px-4 py-4'>
                  <div className='flex gap-2'>
                    <button
                    onClick={() => setDeleteConfirm(book.id)}
                    className='px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors'
                    >
                      Delete
                    </button>
                    <button
                    onClick={() => setTranslateModal(book.id)}
                    className='px-3 py-1.5 rounded-lg border border-teal-200 text-teal-600 text-xs font-medium hover:bg-teal-50 transition-colors'
                    >
                      Translate
                    </button>
                  </div>
                </td>
                 </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
     <div className='fixed inset-0 z-50 flex items-center justify-center px-6'>
      <div className='absolute inset-0 bg-black/40' onClick={() => setDeleteConfirm(null)} />
      <div className='relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl'>
        <h3 className='font-bold text-slate-900 text-lg mb-2'>Delete Book</h3>
        <p className='text-sm text-slate-500 mb-6'>
          This will remove the book from the library permanently.
        </p>
        <div className='flex gap-3'>
          <button
          onClick={() => setDeleteConfirm(null)}
          className='flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50'
          >
            Cancel
          </button>
          <button
          onClick={() => handleDelete(deleteConfirm)}
          className='flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors'
          >
            Yes, Delete
          </button>
        </div>
      </div>
      </div>
  )}

  {/* TRANSLATE MODAL */}
  {translateModal && (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-6'>
      <div className='absolute inset-0 bg-black/40' onClick={() => !translating && setTranslateModal(null)} />
      <div className='relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl'>
        <h3 className='font-bold text-slate-900 text-lg mb-2'>Translate Book</h3>
        <p className='text-sm text-slate-500 mb-4'>
          Choose a language to translate this book into.
        </p>
        <select
        value={translateLang}
        onChange={(e) => setTranslateLang(e.target.value)}
        className='w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4'
        >
          <option value="">Select language...</option>
          {LANGUAGES.map(l => <option key={l}>{l}</option>)}
        </select>

        {translating ? (
          <div className='text-center py-4'>
            <div className='w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3' />
            <p className='text-sm text-slate-500'>Translation in progress...</p>
            </div>
        ) : (
          <div className='flex gap-3'>
            <button 
            onClick={() => setTranslateModal(null)}
            className='flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50'
            >
              Cancel
            </button>
            <button
            onClick={handleTranslate}
            disabled={!translateLang}
            className='flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium transition-colors'
            >
              Translate
            </button>
            </div>
        )}
        </div>
        </div>
  )}
  </div>
);
}
