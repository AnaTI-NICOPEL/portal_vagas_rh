const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
let vagas = [];
let termoPesquisa = "";

const $ = (id) => document.getElementById(id);

function startIntermediaryLoading() {
    const overlay = $("loading-overlay");
    const bar = $("progress-bar");
    const text = $("progress-text");
    const loadingLogo = $("loading-site-logo");
    const linkFixo = "https://app.pipefy.com/public/form/o2Oed2xe";

    if (!overlay || !bar || !text) return;

    // Sincronizar logo com o tema atual
    if (loadingLogo) {
        const isDark = document.body.classList.contains("dark");
        const logoLight = "https://i.ibb.co/zWJstk81/logo-nicopel-8.png";
        const logoDark = "https://i.ibb.co/nLkLD0f/GRUPO-NICOPEL-1.png";
        loadingLogo.src = isDark ? logoDark : logoLight;
    }

    overlay.style.display = "flex";
    bar.style.width = "0%";
    text.textContent = "Preparando formulário... 0%";

    const duration = 4000; // 3000ms = 3s
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
        elapsed += interval;
        const progress = Math.min((elapsed / duration) * 100, 100);
        bar.style.width = `${progress}%`;
        text.textContent = `Preparando formulário... ${Math.round(progress)}%`;

        if (progress >= 100) {
            clearInterval(timer);

            // Mostrar o link manual caso o redirecionamento automático falhe
            const fallback = $("loading-fallback");
            if (fallback) fallback.style.display = "block";

            // Tenta abrir em nova aba. Se falhar, usa window.location.href (mesma aba)
            try {
                const newWindow = window.open(linkFixo, "_blank");
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    window.location.href = linkFixo;
                }
            } catch (err) {
                window.location.href = linkFixo;
            }

            text.textContent = "Redirecionando...";

            setTimeout(() => {
                overlay.style.display = "none";
                closeModal();
            }, 3000);
        }
    }, interval);
}

function openVacancyModal(v) {
    if ($("mTitle")) $("mTitle").textContent = v.titulo;

    const subInfo = [v.setor, v.experiencia, v.tipo_emprego].filter(Boolean).join(" | ");
    if ($("mSub")) $("mSub").textContent = subInfo;

    const container = $("mDescricaoCompleta");
    if (container) {
        const fullText = v.atividades || "";
        const lines = fullText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        
        let htmlContent = "";
        let inList = false;
        const keywords = ["responsabilidades", "requisitos", "competências", "benefícios", "remuneração", "atividades", "o que buscamos", "o que oferecemos"];

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            
            // Verifica se a linha começa com uma palavra-chave seguida de dois pontos (ex: "Remuneração: a combinar")
            let keywordFound = null;
            for (const kw of keywords) {
                if (lowerLine.startsWith(kw + ":") || lowerLine.startsWith(kw + " :")) {
                    keywordFound = kw;
                    break;
                }
            }

            // É cabeçalho se termina com : OU é uma das palavras chave em linha curta OU está toda em maiúsculo
            const isHeaderLine = line.endsWith(":") || 
                                (keywordFound && line.length < keywordFound.length + 15) ||
                                keywords.some(kw => lowerLine === kw) ||
                                (line.length > 3 && line === line.toUpperCase() && line.length < 40);

            if (isHeaderLine || (keywordFound && line.includes(":"))) {
                if (inList) {
                    htmlContent += "</ul>";
                    inList = false;
                }

                if (keywordFound && line.includes(":") && !line.endsWith(":")) {
                    // Caso "Remuneração: a combinar"
                    const parts = line.split(":");
                    const headerText = parts[0].trim();
                    const remainingText = parts.slice(1).join(":").trim();
                    
                    htmlContent += `<h3>${headerText}</h3>`;
                    if (remainingText) {
                        htmlContent += `<ul><li>${remainingText}</li>`;
                        inList = true;
                    }
                } else {
                    // Caso cabeçalho normal
                    const headerText = line.replace(/:$/, "");
                    htmlContent += `<h3>${headerText}</h3>`;
                }
            } else {
                if (!inList) {
                    htmlContent += `<ul>`;
                    inList = true;
                }
                const cleanLine = line.replace(/^[-*•]\s*/, "");
                htmlContent += `<li>${cleanLine}</li>`;
            }
        });

        if (inList) htmlContent += "</ul>";
        container.innerHTML = htmlContent;
    }

    // Link Pipefy
    const blocoLink = $("bloco-link-pipefy");
    const linkBtn = $("mLinkPipefy");

    if (blocoLink && linkBtn) {
        blocoLink.style.display = "block";
        linkBtn.onclick = (e) => {
            e.preventDefault();
            startIntermediaryLoading();
        };
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
        $("backdrop").onclick = (e) => { if (e.target.id === "backdrop") closeModal(); };
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