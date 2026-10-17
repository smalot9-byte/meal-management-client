import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { loadAllDishes } from '../api/dishes';
import { getErrorMessage } from '../api/errors';
import { categories, fitsMeal } from '../labels';
import MenuPicker from '../components/MenuPicker';
import NewDishForm from '../components/NewDishForm';

export default function NewMealPage() {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [mealType, setMealType] = useState('Dairy');
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guestsCount, setGuestsCount] = useState('10');
  const [menuItems, setMenuItems] = useState([]);
  const [emails, setEmails] = useState('');
  const [error, setError] = useState('');
  const [participantErrors, setParticipantErrors] = useState([]);
  const [createdMealId, setCreatedMealId] = useState(null);

  useEffect(() => {
    loadAllDishes().then(setDishes).catch((err) => setError(getErrorMessage(err)));
  }, []);

  // שינוי סוג הארוחה מסיר מהתפריט מאכלים שכבר לא מתאימים לה
  function changeMealType(newType) {
    setMealType(newType);
    setMenuItems(menuItems.filter((item) =>
      item.dishId === null || fitsMeal(dishes.find((d) => d.id === item.dishId), newType)));
  }

  function addMenuItem(item) {
    if (item.dishId !== null && menuItems.some((m) => m.dishId === item.dishId)) {
      setError(`${item.name} כבר נמצא בתפריט`);
      return;
    }
    setError('');
    setMenuItems([...menuItems, item]);
  }

  function removeMenuItem(index) {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  }

  function handleDishCreated(dish) {
    setDishes([...dishes, dish]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setParticipantErrors([]);
    try {
      const response = await api.post('/api/meals', {
        name,
        mealType,
        eventDate: new Date(eventDate).toISOString(), // השרת עובד ב-UTC
        guestsCount: Number(guestsCount),
        menuItems: menuItems.map((m) => ({ dishId: m.dishId, category: m.category })),
      });
      const mealId = response.data.id;

      // הוספת המשתתפות אחת אחת. אימייל שלא קיים במערכת לא מבטל את הארוחה.
      const failed = [];
      const list = emails.split(/[\s,;]+/).filter((x) => x);
      for (const email of list) {
        try {
          await api.post(`/api/meals/${mealId}/participants`, { email });
        } catch (err) {
          failed.push(`${email}: ${getErrorMessage(err)}`);
        }
      }

      if (failed.length === 0) {
        navigate(`/meals/${mealId}`);
      } else {
        setCreatedMealId(mealId);
        setParticipantErrors(failed);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (createdMealId) {
    return (
      <>
        <div className="success">הארוחה נוצרה.</div>
        <div className="error">
          חלק מהמשתתפות לא נוספו:
          <ul>{participantErrors.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <button onClick={() => navigate(`/meals/${createdMealId}`)}>מעבר לארוחה</button>
      </>
    );
  }

  return (
    <>
      <h1>הוספת ארוחה</h1>
      {error && <div className="error">{error}</div>}
      <form className="card" onSubmit={handleSubmit}>
        <div className="row">
          סוג:
          <label style={{ margin: 0 }}>
            <input type="radio" checked={mealType === 'Dairy'} onChange={() => changeMealType('Dairy')} /> חלבית
          </label>
          <label style={{ margin: 0 }}>
            <input type="radio" checked={mealType === 'Meat'} onChange={() => changeMealType('Meat')} /> בשרית
          </label>
        </div>
        <div className="row">
          <input placeholder="שם הארוחה" value={name} onChange={(e) => setName(e.target.value)} required />
          תאריך:
          <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          אורחים:
          <input type="number" min="1" max="1000" style={{ width: 80 }}
            value={guestsCount} onChange={(e) => setGuestsCount(e.target.value)} required />
        </div>

        <h3>תפריט</h3>
        <MenuPicker dishes={dishes} mealType={mealType} onAdd={addMenuItem} />
        {menuItems.length > 0 && (
          <ul>
            {menuItems.map((item, i) => (
              <li key={i}>
                {categories[item.category]}: {item.name}{' '}
                <button type="button" onClick={() => removeMenuItem(i)}>הסרה</button>
              </li>
            ))}
          </ul>
        )}

        <h3>משתתפות</h3>
        <label>
          אימיילים (אחד בכל שורה)
          <br />
          <textarea rows="3" cols="40" value={emails} onChange={(e) => setEmails(e.target.value)} />
        </label>

        <button type="submit">יצירת הארוחה</button>
      </form>

      <NewDishForm defaultKashrut={mealType} onCreated={handleDishCreated} />
    </>
  );
}
