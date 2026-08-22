import { useEffect, useState } from 'react';
import * as authService from '../auth/authService';

// Promote/demote state for the User & Role Management admin page — extracted
// out of the page's JSX the same way useBookUpload/useTranslationRequests
// already keep AdminCMSPage presentational. authService.getAllUsers()/
// setUserRole() are async (Stage 10: they call the real API directly when
// enabled, no localStorage cache in between), so this loads via effect
// rather than a useState initializer.
export default function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  async function refresh() {
    setUsers(await authService.getAllUsers());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function changeRole(userId, systemRole) {
    const result = await authService.setUserRole(userId, systemRole);
    await refresh();
    if (result.success) {
      setMessage(`${result.user.name}'s role is now ${systemRole}.`);
    } else {
      setMessage(result.message || 'Could not update that user\'s role.');
    }
    setTimeout(() => setMessage(''), 4000);
  }

  return { users, message, changeRole };
}
