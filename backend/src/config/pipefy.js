import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Ajuste técnico para o fetch funcionar nas funções do Pipefy (caso de ambiente)
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

const PIPEFY_CLIENT_ID = process.env.PIPEFY_CLIENT_ID || "";
const PIPEFY_CLIENT_SECRET = process.env.PIPEFY_CLIENT_SECRET || "";
const PIPEFY_TOKEN_URL = "https://app.pipefy.com/oauth/token";
const PIPEFY_VAGAS_TABLE_ID = process.env.PIPEFY_VAGAS_TABLE_ID || "";
const PIPEFY_VAGA_FIELD_CARGO = process.env.PIPEFY_VAGA_FIELD_CARGO || "cargo";
const PIPEFY_VAGA_FIELD_DEPARTAMENTO = process.env.PIPEFY_VAGA_FIELD_DEPARTAMENTO || "departamento";

let pipefyAccessTokenCache = null;
let pipefyAccessTokenExpiresAt = 0;

export async function getPipefyAccessToken() {
  const now = Date.now();
  if (pipefyAccessTokenCache && now < pipefyAccessTokenExpiresAt) return pipefyAccessTokenCache;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: PIPEFY_CLIENT_ID,
    client_secret: PIPEFY_CLIENT_SECRET
  });
  const resp = await fetch(PIPEFY_TOKEN_URL, { method: "POST", body });
  const data = await resp.json();
  pipefyAccessTokenCache = data.access_token;
  pipefyAccessTokenExpiresAt = now + (data.expires_in - 60) * 1000;
  return pipefyAccessTokenCache;
}

export async function pipefyRequest(query) {
  const token = await getPipefyAccessToken();
  const resp = await fetch("https://api.pipefy.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query })
  });
  const data = await resp.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data;
}

function gqlString(value) {
  if (value === null || value === undefined) return "null";
  return JSON.stringify(String(value));
}

export async function createPipefyJobRecord({ titulo, setor }) {
  if (!PIPEFY_VAGAS_TABLE_ID) return null;
  const mutation = `mutation { createTableRecord(input: { table_id: ${gqlString(PIPEFY_VAGAS_TABLE_ID)}, title: ${gqlString(titulo)}, 
    fields_attributes: [{field_id: ${gqlString(PIPEFY_VAGA_FIELD_CARGO)}, field_value: ${gqlString(titulo)}},
    {field_id: ${gqlString(PIPEFY_VAGA_FIELD_DEPARTAMENTO)}, field_value: ${gqlString(setor)}}] }) { table_record { id } } }`;
  const data = await pipefyRequest(mutation);
  return data?.createTableRecord?.table_record?.id || null;
}

export async function updatePipefyJobRecord(pipefyId, { titulo, setor }) {
  if (!pipefyId) return null;
  const mutation = `mutation { updateTableRecord(input: { id: ${gqlString(pipefyId)}, title: ${gqlString(titulo)}, 
    fields: [{field_id: ${gqlString(PIPEFY_VAGA_FIELD_CARGO)}, field_value: ${gqlString(titulo)}},
    {field_id: ${gqlString(PIPEFY_VAGA_FIELD_DEPARTAMENTO)}, field_value: ${gqlString(setor)}}] }) { table_record { id } } }`;
  const data = await pipefyRequest(mutation);
  return data?.updateTableRecord?.table_record?.id || null;
}

export async function deletePipefyJobRecord(pipefyId) {
  if (!pipefyId) return null;
  const mutation = `mutation { deleteTableRecord(input: { id: ${gqlString(pipefyId)} }) { clientMutationId } }`;
  return await pipefyRequest(mutation);
}
