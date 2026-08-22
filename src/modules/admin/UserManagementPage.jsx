import React from 'react';
import Navbar from '../../components/Navbar';
import useUserManagement from './useUserManagement';
import { ALL_ROLES, ROLE_LABELS, effectiveRole } from '../../config/roles';

export default function UserManagementPage() {
  const { users, message, changeRole } = useUserManagement();

  return (
    <div className='bg-slate-50 min-h-screen flex flex-col'>
      <Navbar />

      <div className='max-w-5xl mx-auto w-full px-6 py-10 flex-1'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-slate-900'>User &amp; Role Management</h1>
          <p className='text-sm text-slate-500 mt-1'>
            Grant Translator, Author, Editor or Publisher access to registered users.
          </p>
        </div>

        {message && (
          <div className='mb-6 px-4 py-3 bg-teal-50 border border-teal-200 text-teal-700 text-sm rounded-xl font-medium'>
            {message}
          </div>
        )}

        <div className='bg-white rounded-2xl border border-slate-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-slate-100'>
            <h2 className='font-bold text-slate-900'>
              All Users
              <span className='ml-2 text-sm font-normal text-slate-400'>({users.length} total)</span>
            </h2>
          </div>

          {/* MOBILE VIEW */}
          <div className='sm:hidden divide-y divide-slate-100'>
            {users.map((u) => (
              <div key={u.id} className='p-4'>
                <p className='font-semibold text-sm text-slate-900 truncate'>
                  {u.name}
                  {u.isOwner && <span className='ml-2 text-xs font-medium text-amber-600'>🔒 Owner</span>}
                </p>
                <p className='text-xs text-slate-500 mt-0.5'>{u.email}</p>
                <p className='text-xs text-slate-400 mt-0.5'>Persona: {u.role}</p>
                {u.isOwner ? (
                  <p className='mt-3 w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500'>
                    {ROLE_LABELS[effectiveRole(u)]} — role locked
                  </p>
                ) : (
                  <select
                    value={effectiveRole(u)}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className='mt-3 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                  >
                    {ALL_ROLES.map((role) => (
                      <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW */}
          <div className='hidden sm:block overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-slate-50 border-b border-slate-200'>
                <tr>
                  <th className='text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Name</th>
                  <th className='text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Email</th>
                  <th className='text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide'>Persona</th>
                  <th className='text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide'>System Role</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {users.map((u) => (
                  <tr key={u.id} className='hover:bg-slate-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <p className='font-medium text-sm text-slate-900'>
                        {u.name}
                        {u.isOwner && <span className='ml-2 text-xs font-medium text-amber-600'>🔒 Owner</span>}
                      </p>
                    </td>
                    <td className='px-4 py-4 text-sm text-slate-600'>{u.email}</td>
                    <td className='px-4 py-4'>
                      <span className='text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium'>
                        {u.role}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      {u.isOwner ? (
                        <span className='text-sm text-slate-500' title="The Owner's role can't be changed">
                          {ROLE_LABELS[effectiveRole(u)]} — locked
                        </span>
                      ) : (
                        <select
                          value={effectiveRole(u)}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className='px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                        >
                          {ALL_ROLES.map((role) => (
                            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <p className='px-6 py-10 text-sm text-slate-400 text-center'>No registered users yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
