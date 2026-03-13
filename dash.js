const canvas = document.getElementById("graficoMovimentacoes");
const ctx = canvas.getContext("2d");

// Exemplo inicial de valores (atualmente 0 para representar estado vazio)
// Você pode chamar atualizarGrafico([10, 30, 80, ...]) quando tiver os dados reais.
let dados = [0, 0, 0, 0, 0];
const eixoMaximo = 3000;

function ajustarTamanhoCanvas() {
    const larguraDesejada = canvas.parentElement.clientWidth;
    const alturaDesejada = 350;

    canvas.width = larguraDesejada;
    canvas.height = alturaDesejada;
}

function limparCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function desenharEixos() {
    const padding = { top: 20, right: 20, bottom: 30, left: 60 };
    const chartHeight = canvas.height - padding.top - padding.bottom;

    // Escala de Y com passos de 50, 100, 200,... 5000 para ficar legível
    const marcacoes = [ 100, 400, 750, 1500, 2000, 3000];

    ctx.strokeStyle = '#ddd';
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.lineWidth = 1;

    const axisY = canvas.height - padding.bottom;

    // Linha vertical do eixo Y
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, axisY);
    ctx.stroke();

    // Marcações e textos
    marcacoes.forEach(valor => {
        const y = axisY - (Math.min(valor, eixoMaximo) / eixoMaximo) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left - 6, y);
        ctx.lineTo(canvas.width - padding.right, y);
        ctx.stroke();

        const textY = Math.min(y + 4, axisY - 4);
        ctx.fillText(valor.toString(), padding.left - 45, textY);
    });

    // Linha do eixo X
    ctx.beginPath();
    ctx.moveTo(padding.left, canvas.height - padding.bottom);
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
    ctx.stroke();
}

function desenharLinha() {
    const padding = { top: 20, right: 20, bottom: 30, left: 60 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    if (dados.length < 2) return;

    const axisY = canvas.height - padding.bottom;
    const stepX = chartWidth / (dados.length - 1);

    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    dados.forEach((valor, index) => {
        const x = padding.left + index * stepX;
        const y = axisY - (Math.min(valor, eixoMaximo) / eixoMaximo) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Pontos em cada valor
    ctx.fillStyle = '#004085';
    dados.forEach((valor, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + chartHeight - (Math.min(valor, eixoMaximo) / eixoMaximo) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function atualizarGrafico(novosDados) {
    dados = novosDados;
    limparCanvas();
    desenharEixos();
    desenharLinha();
}

function inicializarGrafico() {
    ajustarTamanhoCanvas();
    atualizarGrafico(dados);
}

window.addEventListener('resize', () => {
    ajustarTamanhoCanvas();
    atualizarGrafico(dados);
});

// Inicializa com dados de exemplo (0 por enquanto) e deixa pronta para atualização
inicializarGrafico();

// Exemplo de chamada futura (simule variação de estoque):
// atualizarGrafico([0, 30, 100, 300, 600, 1200, 2200, 3500]);
