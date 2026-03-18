import pool from "../config/db.js";

export const inscrever = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "E-mail é obrigatório" });
    
    await pool.query(
      "INSERT INTO newsletter (email) VALUES ($1) ON CONFLICT (email) DO NOTHING",
      [email]
    );
    res.json({ message: "Inscrito com sucesso!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const desinscrever = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).send("E-mail não fornecido.");
    
    await pool.query("DELETE FROM newsletter WHERE email = $1", [email]);
    
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>Inscrição Cancelada</h1>
        <p>O e-mail <strong>${email}</strong> foi removido da nossa lista de novidades.</p>
        <a href="/">Voltar ao Portal</a>
      </div>
    `);
  } catch (e) {
    res.status(500).send("Erro ao processar descadastro.");
  }
};
