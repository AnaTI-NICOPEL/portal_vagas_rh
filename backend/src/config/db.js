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
        experiencia TEXT,
        funcao TEXT,
        tipo_emprego TEXT,
        setores_vaga TEXT,
        requisitos TEXT,
        competencias TEXT,
        remuneracao TEXT,
        pipefy_record_id TEXT, 
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Migração: Adiciona colunas se não existirem
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='experiencia') THEN
          ALTER TABLE vagas ADD COLUMN experiencia TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='funcao') THEN
          ALTER TABLE vagas ADD COLUMN funcao TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='tipo_emprego') THEN
          ALTER TABLE vagas ADD COLUMN tipo_emprego TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='setores_vaga') THEN
          ALTER TABLE vagas ADD COLUMN setores_vaga TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='requisitos') THEN
          ALTER TABLE vagas ADD COLUMN requisitos TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='competencias') THEN
          ALTER TABLE vagas ADD COLUMN competencias TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='remuneracao') THEN
          ALTER TABLE vagas ADD COLUMN remuneracao TEXT;
        END IF;
      END $$;

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
