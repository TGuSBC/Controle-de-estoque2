const canvas = document.getElementById("graficoMovimentacoes");
const ctx = canvas.getContext("2d");

const dados = [50, 120, 80, 150, 100];
const larguraBarra = 50;
const espacamento = 20;

dados.forEach((valor, i) => {
    const x = i * (larguraBarra + espacamento);
    const y = canvas.height - valor;

    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x, y, larguraBarra, valor);
});