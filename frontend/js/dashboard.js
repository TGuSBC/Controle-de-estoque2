const API = "http://localhost:7007"
const alertasExibidos = new Set()
let grafico = null

function token(){
    return localStorage.getItem("token")
}

function authHeaders(){
    return { "Authorization": `Bearer ${token()}` }
}

function irLogin(){
    localStorage.removeItem("token")
    window.location = "../index.html"
}

function irPrimeiroAcesso(){
    window.location = "primeiro-acesso.html"
}

async function requestJson(url, options = {}){
    const r = await fetch(url, options)
    if(r.status === 401){
        irLogin()
        return null
    }

    const d = await r.json()
    if(!r.ok){
        if(r.status === 403 && d.detail === "troca de senha obrigatoria"){
            irPrimeiroAcesso()
            return null
        }
        throw new Error(d.detail || "Falha na requisição")
    }
    return d
}

async function carregarPerfil(){
    const d = await requestJson(`${API}/me`, { headers: authHeaders() })
    if(!d){
        return
    }

    if(d.must_change_password === true){
        irPrimeiroAcesso()
        return
    }

    const nomeTela = `${d.nome} (${d.email})`
    document.getElementById("usuario-logado").innerText = nomeTela
}

function atualizarGrafico(labels, valores){
    const ctx = document.getElementById("graficoMovimentacoes")

    if(grafico){
        grafico.destroy()
    }

    grafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Quantidade de movimentações",
                data: valores,
                backgroundColor: ["#198754", "#dc3545"],
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
    })
}

async function carregar(){
    const dias = document.getElementById("dias").value
    const d = await requestJson(`${API}/dashboard?dias=${dias}`, { headers: authHeaders() })
    if(!d){
        return
    }

    document.getElementById("produtos").innerText = d.total_produtos
    document.getElementById("mov").innerText = d.total_movimentacoes

    if(d.grafico){
        atualizarGrafico(d.grafico.labels, d.grafico.valores)
    }
}

function classeNivel(nivel){
    return nivel === "CRITICO" ? "danger" : "warning"
}

function atualizarPainel(notificacoes){
    const painel = document.getElementById("painel-notificacoes")

    if(notificacoes.length === 0){
        painel.innerHTML = "<p class='mb-0'>Sem notificações no momento.</p>"
        return
    }

    painel.innerHTML = notificacoes
        .map(n => `<div class='border-bottom py-2'><span class='badge text-bg-${classeNivel(n.nivel)} mb-1'>${n.nivel}</span><br><strong>${n.nome}</strong><br><small>${n.mensagem}</small></div>`)
        .join("")
}

function atualizarBadge(total, criticos){
    const badge = document.getElementById("notificacao-badge")
    const botao = document.getElementById("btn-notificacao")

    badge.innerText = total
    badge.style.display = total > 0 ? "inline-flex" : "none"

    botao.classList.remove("nivel-atencao", "nivel-critico")
    if(criticos > 0){
        botao.classList.add("nivel-critico")
    } else if(total > 0){
        botao.classList.add("nivel-atencao")
    }
}

function mostrarPopup(notificacoes){
    const popup = document.getElementById("popup-alerta")
    const msg = document.getElementById("popup-mensagem")
    const titulo = document.getElementById("popup-titulo")

    const novas = notificacoes.filter(n => !alertasExibidos.has(n.sku))
    if(novas.length === 0){
        return
    }

    novas.forEach(n => alertasExibidos.add(n.sku))

    const temCritico = novas.some(n => n.nivel === "CRITICO")
    titulo.innerText = temCritico ? "Alerta crítico de estoque" : "Atenção: estoque baixo"
    titulo.className = temCritico ? "mb-3 text-danger" : "mb-3 text-warning"

    msg.innerHTML = novas
        .map(n => `<p class='mb-2'><strong>[${n.nivel}]</strong> ${n.mensagem}</p>`)
        .join("")
    popup.style.display = "flex"
}

async function carregarNotificacoes(){
    const d = await requestJson(`${API}/notificacoes?limite=50`, { headers: authHeaders() })
    if(!d){
        return
    }

    atualizarBadge(d.total, d.criticos)
    atualizarPainel(d.notificacoes)
    mostrarPopup(d.notificacoes)
}

function iniciarEventos(){
    document.getElementById("dias").addEventListener("change", carregar)

    document.getElementById("btn-notificacao").addEventListener("click", function(){
        const painel = document.getElementById("painel-notificacoes")
        painel.style.display = painel.style.display === "block" ? "none" : "block"
    })

    document.getElementById("fechar-popup").addEventListener("click", function(){
        document.getElementById("popup-alerta").style.display = "none"
    })

    document.getElementById("btn-sair").addEventListener("click", function(){
        irLogin()
    })
}

async function init(){
    if(!token()){
        irLogin()
        return
    }

    iniciarEventos()
    await carregarPerfil()
    await carregar()
    await carregarNotificacoes()
    setInterval(carregarNotificacoes, 30000)
}

init()
