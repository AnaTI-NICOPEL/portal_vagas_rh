import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { initDb } from "./src/config/db.js";
import apiRoutes from "./src/routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors()); // Permite CORS padrão
app.use(express.json());

// Servir arquivos estáticos do frontend (mesma pasta superior)
app.use(express.static(path.join(__dirname, "../frontend"))); 

// Usar rotas da API
app.use("/api", apiRoutes);

// Inicializar banco e servidor
initDb().then(() => {
  const POrt = process.env.PORT || 3000;
  app.listen(POrt, () => console.log(`🚀 Servidor rodando em http://localhost:${POrt}`));
}).catch(console.error);