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
const requisitosInput = document.getElementById("requisitos");
const competenciasInput = document.getElementById("competencias");
const remuneracaoInput = document.getElementById("remuneracao");
const beneficiosInput = document.getElementById("beneficios");

// Novos inputs adicionados
const experienciaInput = document.getElementById("experiencia");
const funcaoInput = document.getElementById("funcao");
const tipoEmpregoInput = document.getElementById("tipo_emprego");
const setoresVagaInput = document.getElementById("setores_vaga");

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
        <button onclick="fillForm(${v.id})" title="Editar">
          <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        </button>
        <button onclick="deleteVaga(${v.id})" title="Excluir">
          <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
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
  requisitosInput.value = v.requisitos || "";
  competenciasInput.value = v.competencias || "";
  remuneracaoInput.value = v.remuneracao || "";
  beneficiosInput.value = v.beneficios;
  
  // Novos campos
  experienciaInput.value = v.experiencia || "";
  funcaoInput.value = v.funcao || "";
  tipoEmpregoInput.value = v.tipo_emprego || "";
  setoresVagaInput.value = v.setores_vaga || "";

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
      requisitos: requisitosInput.value,
      competencias: competenciasInput.value,
      remuneracao: remuneracaoInput.value,
      beneficios: beneficiosInput.value,
      experiencia: experienciaInput.value,
      funcao: funcaoInput.value,
      tipo_emprego: tipoEmpregoInput.value,
      setores_vaga: setoresVagaInput.value
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