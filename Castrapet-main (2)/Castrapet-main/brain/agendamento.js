let db;

function abrirIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("castrapetDB", 2);

        request.onerror = () => reject("Erro ao abrir IndexedDB");

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains("agendamentos")) {
                db.createObjectStore("agendamentos", { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("usuarios")) {
                db.createObjectStore("usuarios", { keyPath: "email" });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
    });
}

function salvarAgendamento(dados) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["agendamentos"], "readwrite");
        const store = transaction.objectStore("agendamentos");

        const request = store.add(dados);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject("Erro ao salvar dados no IndexedDB");
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await abrirIndexedDB(); // abre o banco antes de tudo

    const btn = document.querySelector(".btn-salvar");

    btn.addEventListener("click", async (e) => {
        e.preventDefault();

        // Seleção dos campos
        const petNome = document.getElementById("petNome");
        const especie = document.getElementById("especie");
        const porte = document.getElementById("porte");
        const sexo = document.getElementById("sexo");
        const vacinacao = document.getElementById("vacinacao");
        const idade = document.querySelector("input[placeholder='Ex: 6 meses']");
        const peso = document.querySelector("input[placeholder='Ex: 5.2']");
        const data = document.querySelector("input[type='date']");
        const observacoes = document.querySelector("input[placeholder='Condições específicas, medicações entre outros']");

        let erros = [];


        if (especie.value === "") erros.push("Selecione a espécie.");
        if (porte.value === "") erros.push("Selecione o porte.");
        if (sexo.value === "") erros.push("Selecione o sexo.");
        if (vacinacao.value === "") erros.push("Informe a vacinação.");
        if (idade.value.trim() === "") erros.push("Informe a idade do pet.");
        if (petNome.value.trim() === "") erros.push("Informe o nome do pet.");

        if (peso.value.trim() === "" || isNaN(peso.value.replace(",", ".")))
            erros.push("Informe um peso válido.");

        if (data.value === "") erros.push("Selecione a data de agendamento.");

        if (erros.length > 0) {
            alert("Corrija os erros:\n\n" + erros.join("\n"));
            return;
        }


        const dados = {
            petNome: petNome.value.trim(),
            especie: especie.value,
            porte: porte.value,
            sexo: sexo.value,
            vacinacao: vacinacao.value,
            idade: idade.value.trim(),
            peso: parseFloat(peso.value.replace(",", ".")),
            data: data.value,
            observacoes: observacoes ? observacoes.value.trim() : ""
        };

        try {
            await salvarAgendamento(dados);
            alert("Dados validados e salvos com sucesso!");
            window.location.href = "historico.html";
            
        } catch (erro) {
            alert("Erro ao salvar no IndexedDB: " + erro);
        }
    });
});
