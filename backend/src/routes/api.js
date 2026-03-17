import { Router } from "express";
import { login } from "../controllers/authController.js";
import { listarVagas, criarVaga, editarVaga, excluirVaga } from "../controllers/vagasController.js";
import { inscreverNewsletter } from "../controllers/newsletterController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Rota Pública
router.post("/login", login);
router.post("/newsletter", inscreverNewsletter);
router.get("/vagas", listarVagas);

// Rotas Protegidas (Exigem Token JWT)
router.post("/vagas", authMiddleware, criarVaga);
router.put("/vagas/:id", authMiddleware, editarVaga);
router.delete("/vagas/:id", authMiddleware, excluirVaga);

export default router;
