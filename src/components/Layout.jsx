import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { getToken, getUser, logout } from '../auth';

// מסגרת לכל המסכים שדורשים התחברות. בלי token מעבירה למסך ההתחברות.
export default function Layout() {
  const navigate = useNavigate();
  const user = getUser();

  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <div className="topbar">
        <Link to="/">דף הבית</Link>
        <span>
          שלום, {user?.fullName}{' '}
          <button onClick={handleLogout}>יציאה</button>
        </span>
      </div>
      <div className="page">
        <Outlet />
      </div>
    </>
  );
}
