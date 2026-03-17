import jwt from 'jsonwebtoken';

export const login = (req, res) => {
  const { usuario, senha } = req.body;

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("FATAL: JWT_SECRET não está definido no ambiente.");
    return res.status(500).json({ error: "Erro interno de configuração do servidor." });
  }

  if (usuario === ADMIN_USER && senha === ADMIN_PASSWORD) {
    const token = jwt.sign({ username: usuario }, secret, { expiresIn: '12h' });
    return res.json({ ok: true, token });
  }
  
  res.status(401).json({ error: "Credenciais inválidas" });
};
