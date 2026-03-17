import pool from "../config/db.js";
import { createPipefyJobRecord } from "../config/pipefy.js";
import { enviarAvisoNovaVaga } from "../config/mail.js";

export const listarVagas = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM vagas ORDER BY id DESC");
    res.json({ vagas: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const criarVaga = async (req, res) => {
  try {
    const { titulo, setor, atividades, beneficios } = req.body;
    
    let pipefyRecordId = null;
    try {
      pipefyRecordId = await createPipefyJobRecord({ titulo, setor });
    } catch (err) {
      console.error("Erro ao criar record no Pipefy:", err);
    }
    
    const { rows } = await pool.query(
      "INSERT INTO vagas (titulo, setor, atividades, beneficios, pipefy_record_id) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [titulo, setor, atividades, beneficios, pipefyRecordId]
    );
    
    res.json({ ok: true, id: rows[0].id, pipefyRecordId });

    // --- Disparo de Email Asíncrono (não trava a resposta ao Admin) ---
    try {
      const { rows: inscritos } = await pool.query("SELECT email FROM newsletter");
      if (inscritos && inscritos.length > 0) {
        const listaEmails = inscritos.map(row => row.email);
        console.log(`Disparando email sobre a vaga "${titulo}" para ${listaEmails.length} inscritos.`);
        enviarAvisoNovaVaga(listaEmails, titulo, setor); // Fire-and-forget
      }
    } catch (emailError) {
      console.error("Erro ao buscar e-mails para disparar avisos:", emailError);
    }
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const editarVaga = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, setor, atividades, beneficios } = req.body;
    
    await pool.query(
      "UPDATE vagas SET titulo=$1, setor=$2, atividades=$3, beneficios=$4 WHERE id=$5",
      [titulo, setor, atividades, beneficios, id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const excluirVaga = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM vagas WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
