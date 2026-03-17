const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
const ADMIN_KEY_STORAGE = "portal_vagas_admin_logged";

if (!sessionStorage.getItem(ADMIN_KEY_STORAGE)) {
  window.location.href = "./login_admin.html";
}

const form = document.getElementById("form");
const adminList = document.getElementById("adminList");
const vagaIdInput = document.getElementById("vagaId");
const tituloInput = document.getElementById("titulo");
const setorInput = document.getElementById("setor");
const atividadesInput = document.getElementById("atividades");
const beneficiosInput = document.getElementById("beneficios");
const submitBtn = document.getElementById("submitBtn");

let vagas = [];
const getToken = () => sessionStorage.getItem(ADMIN_KEY_STORAGE) || "";

async function carregarVagas() {
  const r = await fetch(`${API_BASE}/api/vagas`);
  const data = await r.json();
  vagas = data.vagas || [];
  renderAdmin();
}

function renderAdmin() {
  adminList.innerHTML = vagas.map(v => `
    <div class="jobRow">
      <div><h3>${v.titulo}</h3><small>${v.setor}</small></div>
      <div class="job-actions">
        <button onclick="fillForm(${v.id})">✏️</button>
        <button onclick="deleteVaga(${v.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

window.fillForm = (id) => {
  const v = vagas.find(x => x.id == id);
  vagaIdInput.value = v.id;
  tituloInput.value = v.titulo;
  setorInput.value = v.setor;
  atividadesInput.value = v.atividades;
  beneficiosInput.value = v.beneficios;
  submitBtn.textContent = "Salvar alterações";
  window.scrollTo(0,0);
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = vagaIdInput.value;
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_BASE}/api/vagas/${id}` : `${API_BASE}/api/vagas`;

  const resp = await fetch(url, {
    method,
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${getToken()}` 
    },
    body: JSON.stringify({
      titulo: tituloInput.value,
      setor: setorInput.value,
      atividades: atividadesInput.value,
      beneficios: beneficiosInput.value
    })
  });

  if (resp.ok) {
    form.reset();
    vagaIdInput.value = "";
    submitBtn.textContent = "Publicar vaga";
    carregarVagas();
    alert("Vaga salva com sucesso!");
  } else {
    // Caso de token vencido/inválido
    if (resp.status === 401) {
       alert("Sua sessão expirou. Faça login novamente.");
       sessionStorage.clear();
       window.location.href = "./login_admin.html";
    } else {
       alert("Erro ao salvar vaga no servidor.");
    }
  }
});

window.deleteVaga = async (id) => {
  const confirmDelete = confirm("Tem certeza que deseja excluir esta vaga?");
  if (!confirmDelete) return;
  
  const resp = await fetch(`${API_BASE}/api/vagas/${id}`, {
    method: "DELETE",
    headers: { 
       "Authorization": `Bearer ${getToken()}` 
    }
  });
  
  if (resp.ok) {
     carregarVagas();
  } else {
     if (resp.status === 401) {
       alert("Sua sessão expirou. Faça login novamente.");
       sessionStorage.clear();
       window.location.href = "./login_admin.html";
    } else {
       alert("Falha ao excluir a vaga.");
    }
  }
};

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
            window.location.href = "login_admin.html";
        });
    } else {
        console.error("Erro: O botão btnLogout não foi encontrado no HTML.");
    }
});

carregarVagas();