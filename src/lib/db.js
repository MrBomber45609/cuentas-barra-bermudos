import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida. Configura tu .env.local con la URL de Neon.');
}

export const sql = neon(process.env.DATABASE_URL);
