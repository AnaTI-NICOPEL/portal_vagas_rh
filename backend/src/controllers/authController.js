import jwt from 'jsonwebtoken';

export const login = (req, res) => {
  const { usuario, senha } = req.body;

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  // Verificação de segurança para configuração do servidor
  if (!secret || !ADMIN_USER || !ADMIN_PASSWORD) {
    console.error("DEBUG RENDER: ADMIN_USER:", !!ADMIN_USER, "ADMIN_PASSWORD:", !!ADMIN_PASSWORD, "JWT_SECRET:", !!secret);
    return res.status(500).json({ 
      error: "Erro de configuração no servidor. Verifique o painel do Render (Environment)." 
    });
  }

  if (usuario === ADMIN_USER && senha === ADMIN_PASSWORD) {
    const token = jwt.sign({ username: usuario }, secret, { expiresIn: '12h' });
    return res.json({ ok: true, token });
  }
  
  console.warn(`Tentativa de login falhou. Recebido: [${usuario}], Esperado (length): [${ADMIN_USER?.length}]`);
  res.status(401).json({ error: "Credenciais inválidas" });
};
