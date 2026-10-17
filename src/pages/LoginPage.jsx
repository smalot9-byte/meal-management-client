import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { getErrorMessage } from '../api/errors';
import { saveAuth } from '../auth';

// מסך אחד להתחברות ולהרשמה
export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const response = isRegister
        ? await api.post('/api/auth/register', { fullName, email, password })
        : await api.post('/api/auth/login', { email, password });
      saveAuth(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.status === 401 ? 'אימייל או סיסמה שגויים' : getErrorMessage(err));
    }
  }

  return (
    <div className="page" style={{ maxWidth: 400 }}>
      <h1>{isRegister ? 'הרשמה' : 'התחברות'}</h1>
      {error && <div className="error">{error}</div>}
      <form className="card" onSubmit={handleSubmit}>
        {isRegister && (
          <label>
            שם מלא
            <br />
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
        )}
        <label>
          אימייל
          <br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          סיסמה
          <br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit">{isRegister ? 'הרשמה' : 'כניסה'}</button>
      </form>
      <button onClick={() => { setIsRegister(!isRegister); setError(''); }}>
        {isRegister ? 'יש לי כבר חשבון: להתחברות' : 'אין לי חשבון: להרשמה'}
      </button>
    </div>
  );
}
