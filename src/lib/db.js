import { neon } from '@neondatabase/serverless';

export const sql = (...args) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida. Por favor, añádela en Vercel > Settings > Environment Variables.');
  }
  const db = neon(process.env.DATABASE_URL);
  return db(...args);
};
