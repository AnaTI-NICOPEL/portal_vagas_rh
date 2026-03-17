import pool from "../config/db.js";

export const inscreverNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    // Tenta inserir, se já existir o email (UNIQUE constraint), vai cair no catch
    await pool.query("INSERT INTO newsletter (email) VALUES ($1)", [email]);
    
    res.status(201).json({ ok: true, message: "E-mail inscrito com sucesso!" });
  } catch (error) {
    if (error.code === '23505') { // Postgres error code for unique violation
      return res.status(409).json({ error: "Este e-mail já está inscrito para receber avisos." });
    }
    console.error("Erro na inscrição da newsletter:", error);
    res.status(500).json({ error: "Não foi possível concluir a inscrição no servidor." });
  }
};
