import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// הלקוח רץ על פורט 5173, הכתובת שמוגדרת ב-CORS של השרת
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
