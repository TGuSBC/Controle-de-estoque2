async function login(){

const email=document.getElementById("email").value
const senha=document.getElementById("senha").value

const r=await fetch("http://localhost:7007/login",{
method:"POST",
headers:{"Content-Type":"application/x-www-form-urlencoded"},
body:new URLSearchParams({email,senha})
})

const data=await r.json()

if(!r.ok || !data.token){
alert(data.detail || "Falha no login")
return
}

localStorage.setItem("token",data.token)

const forcarTroca = data.usuario && data.usuario.must_change_password === true
const caminho=window.location.pathname.toLowerCase()

if(caminho.includes("/frontend/")){
window.location = forcarTroca ? "primeiro-acesso.html" : "dashboard.html"
}else{
window.location = forcarTroca ? "frontend/primeiro-acesso.html" : "frontend/dashboard.html"
}
}
