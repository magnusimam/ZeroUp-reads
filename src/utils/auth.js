export function getStoredUsers() {
  const raw = localStorage.getItem('zeroup_users');
  return raw ? JSON.parse(raw) : [];
}

export function saveUsers(users) {
  localStorage.setItem('zeroup_users', JSON.stringify(users));
}

export function registerUser(name, email, password, role, orgName) {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: 'This email is already registered.' };
  }

  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    orgName: orgName.trim(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, user: newUser };
}

export function loginUser(email, password) {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password
  );

  return user ? { success: true, user } : { success: false, message: 'Invalid email or password.' };
}
