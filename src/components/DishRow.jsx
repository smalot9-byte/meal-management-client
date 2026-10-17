import { useState } from 'react';
import { categories, fitsMeal, units } from '../labels';

// שורה בטבלת המנות: הנתונים, מי מכינה, וכפתור "אני מכינה" עם שדה כמות לפיצול
export default function DishRow({ mealDish, mealType, dishes, currentUserId, isOwner, onTake, onCancel, onRemove }) {
  const [quantity, setQuantity] = useState('');
  const [specifiedDishId, setSpecifiedDishId] = useState('');
  const isUndefined = mealDish.dishId === null;
  const unit = mealDish.unit ? units[mealDish.unit] : '';

  function handleTake() {
    // בלי כמות: לוקחים את כל מה שנותר
    const q = quantity ? Number(quantity) : mealDish.remainingQuantity;
    onTake(mealDish, q, specifiedDishId ? Number(specifiedDishId) : null);
    setQuantity('');
  }

  return (
    <tr>
      <td>{categories[mealDish.category]}</td>
      <td>{isUndefined ? <i>ללא בחירה</i> : mealDish.dishName}</td>
      <td>{mealDish.requiredQuantity ?? '-'} {unit}</td>
      <td>{mealDish.assignedQuantity}</td>
      <td>{mealDish.remainingQuantity ?? '-'}</td>
      <td>
        {mealDish.assignments.map((a) => (
          <div key={a.id}>
            {a.userName}: {a.quantity}{' '}
            {a.userId === currentUserId && (
              <button onClick={() => onCancel(a.id)}>ביטול</button>
            )}
          </div>
        ))}
      </td>
      <td>
        {!mealDish.isFullyAssigned && (
          <div className="row" style={{ marginBottom: 0 }}>
            {isUndefined && (
              <select value={specifiedDishId} onChange={(e) => setSpecifiedDishId(e.target.value)}>
                <option value="">בחירת מאכל...</option>
                {dishes
                  .filter((d) => d.category === mealDish.category && fitsMeal(d, mealType))
                  .map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
              </select>
            )}
            <input type="number" step="0.01" min="0.01" style={{ width: 70 }}
              placeholder={isUndefined ? 'כמות' : String(mealDish.remainingQuantity)}
              value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <button onClick={handleTake}>אני מכינה</button>
          </div>
        )}
        {isOwner && (
          <button onClick={() => onRemove(mealDish.id)}>הסרת המנה</button>
        )}
      </td>
    </tr>
  );
}
