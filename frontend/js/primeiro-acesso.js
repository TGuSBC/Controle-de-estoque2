const API = "http://localhost:7007"

function token(){
return localStorage.getItem("token")
}

function sair(){
localStorage.removeItem("token")
window.location="../index.html"
}

if(!token()){
window.location="../index.html"
}

async function trocar(){
const senhaAtual=document.getElementById("senha_atual").value
const novaSenha=document.getElementById("nova_senha").value

const r=await fetch(`${API}/trocar-senha-inicial`,{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":`Bearer ${token()}`
},
body:JSON.stringify({senha_atual:senhaAtual,nova_senha:novaSenha})
})

if(r.status===401){
sair()
return
}

const d=await r.json()
if(!r.ok){
document.getElementById("res").innerText=d.detail || "Falha ao trocar senha"
return
}

document.getElementById("res").innerText="Senha alterada com sucesso. Redirecionando..."
setTimeout(()=>{window.location="dashboard.html"},800)
}

document.getElementById("btn-trocar").addEventListener("click",trocar)
document.getElementById("btn-sair").addEventListener("click",sair)
