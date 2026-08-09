import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PasswordResetSuccessPage() {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center text-2xl">
            ✅
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Password reset!</h1>
          <p className="text-sm text-slate-500 mt-2">
            Your password has been changed successfully. You can now sign in with your new password.
          </p>

          <Link
            to="/login"
            className="block w-full mt-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
