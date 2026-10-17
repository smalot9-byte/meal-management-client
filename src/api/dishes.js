import api from './client';

// טוען את כל המאגר, עמוד אחרי עמוד (השרת מחזיר לכל היותר 50 בעמוד)
export async function loadAllDishes() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await api.get('/api/dishes', { params: { page, pageSize: 50, sortBy: 'name' } });
    all.push(...response.data.items);
    totalPages = response.data.totalPages;
    page++;
  } while (page <= totalPages);
  return all;
}
