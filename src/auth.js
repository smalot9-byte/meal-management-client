// שמירת ה-JWT ופרטי המשתמשת ב-localStorage
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function saveAuth(authResponse) {
  localStorage.setItem(TOKEN_KEY, authResponse.token);
  localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const json = localStorage.getItem(USER_KEY);
  return json ? JSON.parse(json) : null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
