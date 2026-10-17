import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { loadAllDishes } from '../api/dishes';
import { getErrorMessage, isConflict } from '../api/errors';
import { getUser } from '../auth';
import { formatDate, mealTypes } from '../labels';
import DishRow from '../components/DishRow';
import MenuPicker from '../components/MenuPicker';
import ChatPanel from '../components/ChatPanel';
import RecipesPanel from '../components/RecipesPanel';

export default function MealDetailsPage() {
  const { mealId } = useParams();
  const currentUserId = getUser()?.id;

  const [meal, setMeal] = useState(null);
  const [mealDishes, setMealDishes] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [status, setStatus] = useState('all');
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState('');
  const [success, setSuccess] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');

  const loadMeal = useCallback(() => {
    return api.get(`/api/meals/${mealId}`)
      .then((response) => setMeal(response.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, [mealId]);

  const loadMealDishes = useCallback(() => {
    return api.get(`/api/meals/${mealId}/dishes`, { params: { status } })
      .then((response) => setMealDishes(response.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, [mealId, status]);

  useEffect(() => { loadMeal(); }, [loadMeal]);
  useEffect(() => { loadMealDishes(); }, [loadMealDishes]);
  useEffect(() => { loadAllDishes().then(setDishes).catch(() => {}); }, []);

  function clearMessages() {
    setError('');
    setConflict('');
    setSuccess('');
  }

  // הטיפול ב-409: הודעה בולטת, ואחריה רענון הנתונים כדי להציג את הכמות העדכנית
  async function handleError(err) {
    if (isConflict(err)) {
      setConflict(`המנה נלקחה או עודכנה על ידי משתתפת אחרת. הנתונים רועננו. (${getErrorMessage(err)})`);
      await loadMealDishes();
    } else {
      setError(getErrorMessage(err));
    }
  }

  async function handleTake(mealDish, quantity, specifiedDishId) {
    clearMessages();
    try {
      await api.post(`/api/meals/${mealId}/dishes/${mealDish.id}/assignments`, { quantity, specifiedDishId });
      setSuccess(`נרשמת להכין ${quantity}`);
      await Promise.all([loadMealDishes(), loadMeal()]);
    } catch (err) {
      await handleError(err);
    }
  }

  async function handleCancel(assignmentId) {
    clearMessages();
    try {
      await api.delete(`/api/meals/${mealId}/assignments/${assignmentId}`);
      await loadMealDishes();
    } catch (err) {
      await handleError(err);
    }
  }

  async function handleRemoveDish(mealDishId) {
    clearMessages();
    try {
      await api.delete(`/api/meals/${mealId}/dishes/${mealDishId}`);
      await loadMealDishes();
    } catch (err) {
      await handleError(err);
    }
  }

  async function handleAddDish(item) {
    clearMessages();
    try {
      await api.post(`/api/meals/${mealId}/dishes`, { dishId: item.dishId, category: item.category });
      await Promise.all([loadMealDishes(), loadMeal()]);
    } catch (err) {
      await handleError(err);
    }
  }

  async function handleAddParticipant(e) {
    e.preventDefault();
    clearMessages();
    try {
      await api.post(`/api/meals/${mealId}/participants`, { email: participantEmail });
      setParticipantEmail('');
      await loadMeal();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!meal) {
    return error ? <div className="error">{error}</div> : <p>טוען...</p>;
  }

  return (
    <div className="layout">
      <main>
        <h1>{meal.name}</h1>
        <p>
          ארוחה {mealTypes[meal.mealType]} · {formatDate(meal.eventDate)} · {meal.guestsCount} אורחים ·
          בעלת הארוחה: {meal.ownerName}
        </p>
        <p className="muted">
          משתתפות: {meal.participants.map((p) => p.fullName).join(', ') || 'אין עדיין'}
        </p>

        {conflict && <div className="conflict">{conflict}</div>}
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="row">
          <label style={{ margin: 0 }}>
            <input type="radio" checked={status === 'all'} onChange={() => setStatus('all')} /> הכול
          </label>
          <label style={{ margin: 0 }}>
            <input type="radio" checked={status === 'open'} onChange={() => setStatus('open')} /> פתוחות בלבד
          </label>
          <button onClick={() => { clearMessages(); loadMealDishes(); }}>רענון</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>סוג</th>
              <th>מאכל</th>
              <th>נדרש</th>
              <th>נלקח</th>
              <th>נותר</th>
              <th>מי מכינה</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mealDishes.map((md) => (
              <DishRow
                key={md.id}
                mealDish={md}
                mealType={meal.mealType}
                dishes={dishes}
                currentUserId={currentUserId}
                isOwner={meal.isOwner}
                onTake={handleTake}
                onCancel={handleCancel}
                onRemove={handleRemoveDish}
              />
            ))}
          </tbody>
        </table>

        {meal.isOwner && (
          <>
            <div className="card" style={{ marginTop: 16 }}>
              <h3>הוספת מאכלים</h3>
              <MenuPicker dishes={dishes} mealType={meal.mealType} onAdd={handleAddDish} />
            </div>
            <form className="card row" onSubmit={handleAddParticipant}>
              <b>הוספת משתתפת:</b>
              <input type="email" placeholder="אימייל" value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)} required />
              <button type="submit">הוספה</button>
            </form>
          </>
        )}
      </main>

      {/* ב-RTL הרכיב השני ב-flex מוצג משמאל */}
      <aside>
        <ChatPanel mealId={mealId} />
        <RecipesPanel mealId={mealId} meal={meal} currentUserId={currentUserId} />
      </aside>
    </div>
  );
}
