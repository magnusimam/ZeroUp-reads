import React from 'react';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); //

  
  
  function handleSubmit(e) {
    e.preventDefault();
    setError("")
    
    //Basic validation
    if(!email || !password){
      setError("Please fill in all fields.");
      return;
    }

    const result = loginUser(email, password);

    if (result.success)  {
      login({ name: email.split("@")[0], email, role:"reader"});
      navigate("/library");
    } else {
      setError("Login failed.  please try again");
    }
  }
    
  function handleGoogleLogIn() {
    // Google sign in - coming when cloudflare API is ready
    console.log('Google sign-in coming soon');
  }
  
  return (
    <div className="bg-slate50 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 text-center mt-1 mb-6">
            Sign in to continue reading
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">
            <div >
                <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="you@example.com"
              />
            </div>


            <div>
              <label className="block-text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your password"
              />
            </div>


            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              Sign in
            </button>
          </form>

          {/*--DIVIDER--*/}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/*--GOOGLE SIGN-IN PLACEHOLDER--*/}
          <button
            onClick={handleGoogleLogIn}
            className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg transition-colors"
          >
            <span className="text-lg">G</span>
            Sign in with Google
          </button>

          <p className="text-sm text-slate-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-600 font-medium hover:text-teal-700">
              Register here
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
    
  );
}

