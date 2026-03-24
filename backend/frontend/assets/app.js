const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
let vagas = [];
let termoPesquisa = "";

const $ = (id) => document.getElementById(id);

function openVacancyModal(v) {
    // Títulos e Subtítulos
    if ($("mTitle")) $("mTitle").textContent = v.titulo;
    
    // Monta o subtítulo com Setor, Experiência e Tipo de Emprego
    const subInfo = [v.setor, v.experiencia, v.tipo_emprego].filter(Boolean).join(" | ");
    if ($("mSub")) $("mSub").textContent = subInfo;

    // CAMPOS COM QUEBRA DE LINHA E OCULTAÇÃO DE BLOCOS VAZIOS
    const formatText = (t) => {
        if (!t) return "";
        // Transforma **texto** em <strong>texto</strong>
        let formatted = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Separa por quebra de linha, limpa espaços e remove linhas vazias
        const lines = formatted.split('\n').map(l => l.trim()).filter(Boolean);
        
        if (lines.length === 0) return "";
        
        // Se houver apenas uma linha e ela não começar com marcador, retorna texto simples (mas em negrito se desejar manter o padrão anterior, porém o usuário pediu "ponto simples")
        // Vou seguir a sugestão do usuário de usar pontos simples para tudo que for lista
        
        return `<ul style="margin: 10px 0; padding-left: 20px; list-style-type: disc; color: var(--text);">` + 
            lines.map(line => {
                // Remove marcadores existentes (- ou *) para evitar duplicidade
                const content = line.replace(/^[-*•]\s*/, "");
                return `<li style="margin-bottom: 5px;">${content}</li>`;
            }).join('') + 
            `</ul>`;
    };

    const setBlock = (id, text) => {
        const p = $(id);
        if (p) {
            p.innerHTML = formatText(text) || "";
            const bloco = p.closest('.vaga-bloco');
            if (bloco) {
                bloco.style.display = text ? 'block' : 'none';
            }
        }
    };

    setBlock("mDescricao", v.atividades);
    setBlock("mRequisitos", v.requisitos);
    setBlock("mCompetencias", v.competencias);
    setBlock("mBeneficios", v.beneficios);

    const pRemun = $("mRemuneracao");
    if (pRemun) {
       pRemun.innerText = v.remuneracao || "A combinar";
       const blocoRemun = pRemun.closest('.vaga-bloco');
       if(blocoRemun) blocoRemun.style.display = 'block';
    }

    // Link Pipefy
    const blocoLink = $("bloco-link-pipefy");
    const linkBtn = $("mLinkPipefy");
    const linkFixo = "https://app.pipefy.com/public/form/o2Oed2xe";

    if (blocoLink && linkBtn) {
        blocoLink.style.display = "block";
        linkBtn.href = linkFixo;
    }

    if ($("backdrop")) $("backdrop").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    if ($("backdrop")) $("backdrop").style.display = "none";
    document.body.style.overflow = "auto";
}

async function load() {
    try {
        const r = await fetch(`${API_BASE}/api/vagas`);
        const data = await r.json();
        vagas = data.vagas || [];
        renderVagas();
    } catch (e) {
        console.error("Erro ao carregar vagas:", e);
    }
}

function renderVagas() {
    const lista = $("lista-vagas");
    if (!lista) return;
    lista.innerHTML = "";
    
    const termo = termoPesquisa.toLowerCase().trim();
    const vagasFiltradas = vagas.filter(v => 
        (v.titulo && v.titulo.toLowerCase().includes(termo)) || 
        (v.setor && v.setor.toLowerCase().includes(termo)) ||
        (v.atividades && v.atividades.toLowerCase().includes(termo)) ||
        (v.funcao && v.funcao.toLowerCase().includes(termo))
    );

    if (vagasFiltradas.length === 0) {
        let msg = "Nenhuma vaga aberta no momento.";
        if (termo) msg = `Nenhuma vaga encontrada para "${termoPesquisa}".`;

        lista.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--muted); background: var(--card); border-radius: 12px; border: 1px dashed var(--border);">
                <div style="width: 60px; height: 60px; margin: 0 auto 10px; opacity: 0.5;">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                </div>
                <h3 style="color: var(--text); margin: 0 0 10px;">Ops!</h3>
                <p style="margin: 0;">${msg}</p>
            </div>
        `;
        return;
    }

    vagasFiltradas.forEach(v => {
        const art = document.createElement("article");
        art.className = "vacancy-card";
        // Mostra Título, Setor e a Função resumida no card
        art.innerHTML = `
            <div>
                <span class="setor">${v.setor || 'Geral'}</span>
                <h3>${v.titulo}</h3>
                <p style="font-size: 0.85rem; color: var(--muted);">${v.funcao || ''}</p>
            </div>
        `;
        art.onclick = () => openVacancyModal(v);
        lista.appendChild(art);
    });
}

// Lógica de observação para auto-abrir os cards ao rolar
function setupAutoOpen() {
    const section = document.querySelector('#institutional');
    const cards = document.querySelectorAll('.card-identidade');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                cards.forEach(card => card.classList.add('aberto'));
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.3 });

    if (section) observer.observe(section);
}

document.addEventListener("DOMContentLoaded", () => {
    // Modal
    if ($("mClose")) $("mClose").onclick = closeModal;
    if ($("backdrop")) {
        $("backdrop").onclick = (e) => { if(e.target.id === "backdrop") closeModal(); };
    }

    const cards = document.querySelectorAll(".card-identidade");
    cards.forEach(card => {
        card.onclick = () => card.classList.toggle("aberto");
    });

    // Pesquisa
    const searchInput = $("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            termoPesquisa = e.target.value;
            renderVagas();
        });
    }

    load();
    setupAutoOpen();
});