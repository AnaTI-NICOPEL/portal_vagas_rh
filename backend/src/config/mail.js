import nodemailer from "nodemailer";

// Configuração do transportador de e-mail usando Nodemailer
// Em produção, isso deve ser configurado no .env com os dados do seu provedor SMTP (Gmail, SendGrid, Hostinger, etc)

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para porta 465, false para outras
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Função para enviar os avisos de novas vagas em cópia oculta (BCC)
export const enviarAvisoNovaVaga = async (listaEmails, tituloVaga, setor) => {
  if (!listaEmails || listaEmails.length === 0) return;

  const mailOptions = {
    from: `"Portal de Vagas Nicopel" <${process.env.SMTP_USER || 'no-reply@nicopel.com'}>`, // remetente
    to: process.env.SMTP_USER || 'no-reply@nicopel.com', // destinatário principal
    bcc: listaEmails.join(','), // lista de candidatos (Cópia Oculta para privacidade)
    subject: `Nova Vaga Aberta: ${tituloVaga}`, // Assunto
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">Temos uma novidade para você!</h2>
        <p>Olá,</p>
        <p>A Nicopel acabou de publicar uma nova oportunidade de carreira que pode ser do seu interesse.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 5px solid #b8e900; margin: 20px 0;">
          <h3 style="margin-top: 0;">${tituloVaga}</h3>
          <p><strong>Departamento:</strong> ${setor}</p>
        </div>

        <p>Acesse o nosso portal para ler as responsabilidades, requisitos e se candidatar pelo Pipefy.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/index.html" style="background-color: #b8e900; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Ver vagas abertas</a></p>

        <p style="margin-top: 30px; font-size: 12px; color: #777;">
          Você está recebendo este e-mail porque se inscreveu na nossa Newsletter de Carreiras.<br>
          Se não deseja mais receber avisos, ignore esta mensagem.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Emails enviados com sucesso: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Erro ao enviar e-mails de aviso:", error);
  }
};
