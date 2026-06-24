import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

//placeholder data - once Firebase is connected, this will be replaced
//  with the real logged-in user's info from firestore.
const user = {
  name: "Ruth Adamu",
  email: "ruth@example.com",
  preferredLanguage: "Yoruba",
};
const stats = [
  { label: "Books completed", value: 0},
  { label: "Bookmarks", value:0},
  { label: "Currently Reading", value:0 },
];


  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-ww-2xl mx-auto w-full px-6 py-12">
        {/*-- PROFILE HEADER---*/}
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-teal-600 text-white text-2xl font-bold flex items-center justify-center">
            {initial}
          </div>

          <h1 className="text-xl font-bold text-slate-900 mt-4">
            {user.name}
          </h1>
          <p className="text-sm text-slate-500">{user.email}</p>

          <span className="inline-block mt-3 text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-medium">
            Reads in {user.preferredLanguage}
          </span>

          <button className="mt-6  px-5 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Edit Profile
          </button>
        </div>

        {/*-- STATS SECTION---*/}
        <div className="grid grid-cols-3  gap-4 mt-6">
          {stats.map((stat) =>(
            <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
              <p className="text-2xl font-bold text-slate-900">{stats.value}</p>
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
      </div>

      <Footer />
    </div>
  );
}
