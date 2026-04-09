document.addEventListener("DOMContentLoaded", () => {
    let tipo = "entrada";
    let travado = false;

    const input = document.getElementById("scanner");
    input.focus();

    document.addEventListener("click", (e) => {
        if (e.target.id !== "scanner") {
            const tagsIgnorar = ["INPUT", "SELECT", "TEXTAREA", "BUTTON"];
            if (!tagsIgnorar.includes(e.target.tagName)) {
                input.focus();
            }
        }
    });

    input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter" && !travado) {
            const codigo = input.value.trim();
            console.log("codigo:", codigo);
            if (!codigo) return;
            travado = true;
            setTimeout(() => travado = false, 300);

            try {
                const res = await fetch("/scan-movimento", {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer SEU_TOKEN"
                    },
                    body: new URLSearchParams({
                        sku: codigo,
                        tipo: tipo,
                        quantidade: 1
                    })
                });

                const data = await res.json();

                const feedback = document.getElementById("scan-feedback");
                feedback.textContent = "✅ " + (data.message || "OK");
                feedback.style.color = "green";
                setTimeout(() => feedback.textContent = "", 2000);

            } catch (err) {
                const feedback = document.getElementById("scan-feedback");
                feedback.textContent = "❌ Erro na leitura";
                feedback.style.color = "red";
                setTimeout(() => feedback.textContent = "", 2000);
            }

            input.value = "";
        }
    });
});