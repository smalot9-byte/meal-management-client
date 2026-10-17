import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { getErrorMessage } from '../api/errors';
import { formatDate, mealTypes } from '../labels';

const PAGE_SIZE = 5;

// רשימת ארוחות עם pagination אמיתי: כל מעבר עמוד שולח page לשרת
export default function MealsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get('role') === 'participant' ? 'participant' : 'owner';
  const page = Number(searchParams.get('page')) || 1;

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api
      .get('/api/meals', { params: { role, page, pageSize: PAGE_SIZE, sortBy: 'date' } })
      .then((response) => setResult(response.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, [role, page]);

  function goToPage(newPage) {
    setSearchParams({ role, page: newPage });
  }

  return (
    <>
      <h1>{role === 'owner' ? 'ארוחות שבבעלותי' : 'ארוחות ששותפתי בהן'}</h1>
      {error && <div className="error">{error}</div>}
      {result && (
        <>
          {result.items.length === 0 ? (
            <p>אין ארוחות להצגה.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>שם</th>
                  <th>תאריך</th>
                  <th>סוג</th>
                  <th>אורחים</th>
                  <th>בעלת הארוחה</th>
                  <th>נלקח</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((meal) => (
                  <tr key={meal.id} className="clickable" onClick={() => navigate(`/meals/${meal.id}`)}>
                    <td>{meal.name}</td>
                    <td>{formatDate(meal.eventDate)}</td>
                    <td>{mealTypes[meal.mealType]}</td>
                    <td>{meal.guestsCount}</td>
                    <td>{meal.ownerName}</td>
                    <td>{Math.round(meal.coveragePercent)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="row" style={{ marginTop: 12 }}>
            <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>הקודם</button>
            <span>
              עמוד {result.page} מתוך {Math.max(result.totalPages, 1)} ({result.totalCount} ארוחות)
            </span>
            <button disabled={page >= result.totalPages} onClick={() => goToPage(page + 1)}>הבא</button>
          </div>
        </>
      )}
    </>
  );
}
