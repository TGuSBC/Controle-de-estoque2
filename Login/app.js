const API = "http://localhost:7007";
const alertasExibidos = new Set();
let grafico = null;

const el = (id) => document.getElementById(id);
const token = () => localStorage.getItem("token");
const authHeaders = (json=false) => ({ ...(json ? {"Content-Type":"application/json"} : {}), "Authorization": `Bearer ${token()}` });

function show(screen){
  el("tela-login").classList.add("hidden");
  el("tela-primeiro-acesso").classList.add("hidden");
  el("tela-app").classList.add("hidden");
  if(screen === "app"){ el("notificacao-wrapper").classList.remove("hidden"); }
  else { el("notificacao-wrapper").classList.add("hidden"); }
  el(`tela-${screen}`).classList.remove("hidden");
}

function sair(){ localStorage.removeItem("token"); show("login"); }

async function requestJson(url, options = {}){
  const r = await fetch(url, options);
  if(r.status === 401){ sair(); return null; }
  const d = await r.json();
  if(!r.ok){ throw new Error(d.detail || "Falha na requisi��o"); }
  return d;
}

async function login(){
  const r = await fetch(`${API}/login`, { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({email:el("email").value, senha:el("senha").value}) });
  const d = await r.json();
  if(!r.ok || !d.token){ el("login-res").innerText = d.detail || "Falha no login"; return; }
  localStorage.setItem("token", d.token);
  if(d.usuario && d.usuario.must_change_password === true){ show("primeiro-acesso"); return; }
  await entrarApp();
}

async function trocarSenhaInicial(){
  const d = await requestJson(`${API}/trocar-senha-inicial`, { method:"POST", headers: authHeaders(true), body: JSON.stringify({ senha_atual: el("senha_atual").value, nova_senha: el("nova_senha").value }) });
  if(!d){ return; }
  el("troca-res").innerText = "Senha alterada com sucesso.";
  await entrarApp();
}

function atualizarGrafico(labels, valores){
  const ctx = el("graficoMovimentacoes");
  if(grafico){ grafico.destroy(); }
  grafico = new Chart(ctx, { type:"bar", data:{ labels, datasets:[{ data: valores, backgroundColor:["#198754", "#dc3545"], borderRadius:6 }] }, options:{ plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true, ticks:{ precision:0 } } } } });
}

async function carregarDashboard(){
  const d = await requestJson(`${API}/dashboard?dias=${el("dias").value}`, { headers: authHeaders() });
  if(!d){ return; }
  el("produtos").innerText = d.total_produtos;
  el("mov").innerText = d.total_movimentacoes;
  if(d.grafico){ atualizarGrafico(d.grafico.labels, d.grafico.valores); }
}

async function movimentar(){
  try {
    const d = await requestJson(`${API}/movimentar`, { method:"POST", headers: authHeaders(true), body: JSON.stringify({ sku: el("m_sku").value, corredor: el("m_corredor").value, tipo: el("m_tipo").value, quantidade: parseInt(el("m_qtd").value) }) });
    if(!d){ return; }
    el("mov-res").innerText = d.msg || "Movimenta��o registrada";
    await carregarDashboard();
    await carregarNotificacoes();
  } catch(e){ el("mov-res").innerText = e.message; }
}

function classeNivel(nivel){ return nivel === "CRITICO" ? "danger" : "warning"; }
function atualizarBadge(total, criticos){
  const badge = el("notificacao-badge");
  const btn = el("btn-notificacao");
  badge.innerText = total;
  badge.style.display = total > 0 ? "inline-flex" : "none";
  btn.classList.remove("nivel-atencao", "nivel-critico");
  if(criticos > 0){ btn.classList.add("nivel-critico"); }
  else if(total > 0){ btn.classList.add("nivel-atencao"); }
}
function atualizarPainel(notificacoes){
  const painel = el("painel-notificacoes");
  if(notificacoes.length === 0){ painel.innerHTML = "<p class='mb-0'>Sem notifica��es no momento.</p>"; return; }
  painel.innerHTML = notificacoes.map(n => `<div class='border-bottom py-2'><span class='badge text-bg-${classeNivel(n.nivel)} mb-1'>${n.nivel}</span><br><strong>${n.nome}</strong><br><small>${n.mensagem}</small></div>`).join("");
}
function mostrarPopup(notificacoes){
  const novas = notificacoes.filter(n => !alertasExibidos.has(n.sku));
  if(novas.length === 0){ return; }
  novas.forEach(n => alertasExibidos.add(n.sku));
  const temCritico = novas.some(n => n.nivel === "CRITICO");
  el("popup-titulo").innerText = temCritico ? "Alerta cr�tico de estoque" : "Aten��o: estoque baixo";
  el("popup-titulo").className = temCritico ? "mb-3 text-danger" : "mb-3 text-warning";
  el("popup-mensagem").innerHTML = novas.map(n => `<p class='mb-2'><strong>[${n.nivel}]</strong> ${n.mensagem}</p>`).join("");
  el("popup-alerta").style.display = "flex";
}

async function carregarNotificacoes(){
  const d = await requestJson(`${API}/notificacoes?limite=50`, { headers: authHeaders() });
  if(!d){ return; }
  atualizarBadge(d.total, d.criticos);
  atualizarPainel(d.notificacoes);
  mostrarPopup(d.notificacoes);
}

async function entrarApp(){
  const me = await requestJson(`${API}/me`, { headers: authHeaders() });
  if(!me){ return; }
  if(me.must_change_password === true){ show("primeiro-acesso"); return; }
  el("usuario-logado").innerText = `${me.nome} (${me.email})`;
  show("app");
  await carregarDashboard();
  await carregarNotificacoes();
}

el("btn-login").addEventListener("click", login);
el("btn-sair").addEventListener("click", sair);
el("btn-sair-1").addEventListener("click", sair);
el("btn-trocar-senha").addEventListener("click", trocarSenhaInicial);
el("btn-mov").addEventListener("click", movimentar);
el("dias").addEventListener("change", carregarDashboard);
el("btn-notificacao").addEventListener("click", () => { const p = el("painel-notificacoes"); p.style.display = p.style.display === "block" ? "none" : "block"; });
el("fechar-popup").addEventListener("click", () => { el("popup-alerta").style.display = "none"; });

if(token()){ entrarApp(); } else { show("login"); }
setInterval(() => { if(token() && !el("tela-app").classList.contains("hidden")){ carregarNotificacoes(); } }, 30000);