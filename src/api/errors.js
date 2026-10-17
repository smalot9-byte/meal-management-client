// מוציא הודעה קריאה מתשובת שגיאה של השרת (ProblemDetails או ValidationProblemDetails)
export function getErrorMessage(error) {
  const data = error.response?.data;
  if (!error.response) {
    return 'אין חיבור לשרת. לבדוק שהשרת רץ.';
  }
  if (data?.errors) {
    // שגיאות ולידציה: { errors: { Field: ["הודעה"] } }
    return Object.values(data.errors).flat().join(' ');
  }
  return data?.detail || data?.title || `שגיאה ${error.response.status}`;
}

export function isConflict(error) {
  return error.response?.status === 409;
}
