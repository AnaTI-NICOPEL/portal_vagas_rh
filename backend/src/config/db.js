import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Garante que o .env seja lido mesmo se esse arquivo for importado primeiro
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false }
});

export const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS vagas (
        id BIGSERIAL PRIMARY KEY, 
        titulo TEXT NOT NULL, 
        setor TEXT NOT NULL, 
        atividades TEXT NOT NULL, 
        beneficios TEXT NOT NULL, 
        pipefy_record_id TEXT, 
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS newsletter (
        id BIGSERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    console.log("✅ Banco Postgres pronto");
  } finally {
    client.release();
  }
};

export default pool;
