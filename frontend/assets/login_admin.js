const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
const ADMIN_AUTH_KEY = "portal_vagas_admin_logged";

const loginForm = document.getElementById("loginForm");
const usuarioInput = document.getElementById("usuario");
const senhaInput = document.getElementById("senha");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

if (sessionStorage.getItem(ADMIN_AUTH_KEY)) {
  window.location.href = "./admin.html";
}

function showError(message) {
  loginError.textContent = message;
  loginError.style.display = "block";
}

function hideError() {
  loginError.textContent = "";
  loginError.style.display = "none";
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const usuario = usuarioInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!usuario || !senha) {
    showError("Informe usuário e senha.");
    return;
  }

  try {
    loginBtn.disabled = true;

    const r = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ usuario, senha })
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok || !data.ok || !data.token) {
      throw new Error(data.error || "Credenciais inválidas.");
    }

    // Armazena o JWT Token recebido da API
    sessionStorage.setItem(ADMIN_AUTH_KEY, data.token);
    window.location.href = "./admin.html";
  } catch (err) {
    console.error(err);
    showError(err.message || "Não foi possível realizar o login.");
  } finally {
    loginBtn.disabled = false;
  }
});


// Espera o documento carregar para evitar erro de 'elemento não encontrado'
document.addEventListener("DOMContentLoaded", () => {
    const btnSair = document.getElementById("btnLogout");

    if (btnSair) {
        btnSair.addEventListener("click", () => {
            console.log("Botão Sair clicado!"); // Isso TEM que aparecer no console agora
            
            // Limpa as sessões
            localStorage.clear();
            sessionStorage.clear();
            
            // Redireciona
            window.location.href = "index.html";
        });
    } else {
        console.error("Erro: O botão btnLogout não foi encontrado no HTML.");
    }
});