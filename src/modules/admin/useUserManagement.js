import { useState } from 'react';
import * as authService from '../auth/authService';

// Promote/demote state for the User & Role Management admin page — extracted
// out of the page's JSX the same way useBookUpload/useTranslationRequests
// already keep AdminCMSPage presentational.
export default function useUserManagement() {
  const [users, setUsers] = useState(() => authService.getAllUsers());
  const [message, setMessage] = useState('');

  function refresh() {
    setUsers(authService.getAllUsers());
  }

  function changeRole(userId, systemRole) {
    const result = authService.setUserRole(userId, systemRole);
    refresh();
    if (result.success) {
      setMessage(`${result.user.name}'s role is now ${systemRole}.`);
    } else {
      setMessage(result.message || 'Could not update that user\'s role.');
    }
    setTimeout(() => setMessage(''), 4000);
  }

  return { users, message, changeRole };
}
