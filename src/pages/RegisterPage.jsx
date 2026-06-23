import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { registerUser } from '../auth/auth';

const roles = [
  { id: 'Teacher', message: 'Great! We will suggest classroom-friendly books for you.' },
  { id: 'Parent', message: 'Welcome! We will help your child find stories they will love.' },
  { id: 'Student', message: 'Awesome! Dive into stories in your own language.' },
  { id: 'Creator', message: 'Great! You can share your own stories with readers.' },
  { id: 'Ed-Tech', message: 'Great! We would love to collaborate with you.' },
  { id: 'Educational Organisation', message: 'Great! Tell us a bit about your organisation.' },
  { id: 'Librarian', message: 'Great! Help your community discover African stories.' },
  { id: 'Story teller', message: 'Great! Your stories deserve to be heard.' },
  { id: 'Other', message: "Welcome! There's something here for everyone." },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const selectedRole = roles.find((r) => r.id === role);

  function handleDetailsSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setStep(2);
  }

  function handleRoleSubmit() {
    setError('');

    if (!role) {
      setError('Please select who you are.');
      return;
    }

    if (role === 'Educational Organisation' && !orgName.trim()) {
      setError('Please enter your organisation name.');
      return;
    }

    const result = registerUser(name, email, password, role, orgName);

    if (result.success) {
      navigate('/library');
    } else {
      setError('Registration failed. Please try again.');
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 text-center">
                Create Your Account
              </h1>
              <p className="text-sm text-slate-500 text-center mt-1 mb-6">
                Join ZeroUp Reads — it’s free
              </p>

              {error && (
                <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </form>

              <p className="text-sm text-slate-500 text-center mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">
                  Sign In
                </Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 text-center">
                Who are you
              </h1>
              <p className="text-sm text-slate-500 text-center mt-1 mb-6">
                Help us personalise your experience
              </p>

              {error && (
                <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-4">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRole(r.id);
                      setOrgName('');
                      setError('');
                    }}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                      role === r.id
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-300 text-slate-700 hover:border-teal-400 hover:text-teal-600'
                    }`}
                  >
                    {r.id}
                  </button>
                ))}
              </div>

              {selectedRole && (
                <div className="mb-4 px-4 py-3 bg-teal-50 border border-teal-200 text-teal-700 text-sm rounded-lg text-center">
                  {selectedRole.message}
                </div>
              )}

              {role === 'Educational Organisation' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Organisation name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Bright Futures Academy"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleRoleSubmit}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Finish and Start Reading
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setRole('');
                  setOrgName('');
                  setError('');
                }}
                className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700"
              >
                Go back
              </button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
