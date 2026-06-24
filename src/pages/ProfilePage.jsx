import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout} = useAuth();
  const navigate = useNavigate();

  //Protect this page - if no user, redirect to login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  } , [user, navigate]);

  // don't render anything while redirecting
  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();


const stats = [
  { label: "Books completed", value: 0},
  { label: "Bookmarks", value:0},
  { label: "Currently Reading", value:0 },
];


  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        {/*-- PROFILE HEADER---*/}
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-teal-600 text-white text-2xl font-bold flex items-center justify-center">
            {initial}
          </div>

          <h1 className="text-xl font-bold text-slate-900 mt-4">
            {user.name}
          </h1>
          <p className="text-sm text-slate-500">{user.email}</p>
            {/* role badge */}
            {user.role && (
          <span className="inline-block mt-3 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
            {user.role}
          </span>
            )}
            {/* -- ORG NAME  IF EDUCATIONAL ORGANISATION */}
            {user.orgName && (
              <p className="text-sm text-slate-500 mt-1">
                {user.orgName}
              </p>
            )}

          <button 
           onClick={() => {
            logout();
            navigate("/");
           }}
           className='mt-6 px-5 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors'>
            Log Out
           </button>
           </div>

        {/*-- STATS SECTION---*/}
        <div className="grid grid-cols-3  gap-4 mt-6">
          {stats.map((stat) =>(
            <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
          ))}
        </div>

        {/*-- BOOKMARKS SECTION--*/}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">My Bookmarks</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400">
          No bookmarks yet - books you save will show up here.  
          </div>
        </div>

        {/*--- continue reading---*/}
        <div className='mt-6'>
          <h2 className='text-lg font-bold text-slate-900 mb-3'>
            Continue Reading
          </h2>
          <div className='bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400'>
            No reading history yet - start a book and it will appear here.
          </div>
        </div>



      </div>

      <Footer />
    </div>
  );
}
