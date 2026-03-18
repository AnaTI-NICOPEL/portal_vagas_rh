import 'dotenv/config';
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { initDb } from "./src/config/db.js";
import apiRoutes from "./src/routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors()); // Permite CORS padrão
app.use(express.json());

// Servir arquivos estáticos do frontend (mesma pasta superior)
app.use(express.static(path.join(__dirname, "./frontend"))); 

// Usar rotas da API
app.use("/api", apiRoutes);

// Inicializar banco e servidor
initDb().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`🚀 Servidor rodando em http://localhost:${port}`));
}).catch(console.error);