import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <h1>ניהול ארוחות</h1>
      <div className="row home-buttons">
        <button onClick={() => navigate('/meals/new')}>הוספת ארוחה</button>
        <button onClick={() => navigate('/meals?role=owner')}>ארוחות שבבעלותי</button>
        <button onClick={() => navigate('/meals?role=participant')}>ארוחות ששותפתי בהן</button>
      </div>
    </>
  );
}
