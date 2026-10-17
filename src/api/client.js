import axios from 'axios';
import { getToken, logout } from '../auth';

// שכבת ה-API היחידה של הלקוח: כל הקריאות לשרת עוברות דרך המופע הזה
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// לפני כל בקשה: מוסיפים את ה-token השמור
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// אחרי כל תשובה: 401 (token חסר או שפג תוקפו) מעביר למסך ההתחברות.
// בקשות ההתחברות וההרשמה עצמן לא מעבירות, כדי שתוצג שם הודעת השגיאה.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    if (status === 401 && !url.includes('/api/auth/')) {
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
