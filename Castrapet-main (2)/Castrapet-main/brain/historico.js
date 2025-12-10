let db;

function abrirIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("castrapetDB", 2); // mesma versão!

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

function carregarAgendamentos(filtroEspecie = null) {
    const lista = document.getElementById("lista-agendamentos");
    lista.innerHTML = "";

    const transaction = db.transaction(["agendamentos"], "readonly");
    const store = transaction.objectStore("agendamentos");

    const request = store.openCursor();

    request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            const item = cursor.value;

            if (filtroEspecie && item.especie !== filtroEspecie) {
                cursor.continue();
                return;
            }

            const div = document.createElement("div");
            div.className = "pet-agenda";

            div.innerHTML = `
                <label>${item.petNome || "Pet"}</label>
                <input type="text" value="${formatarData(item.data)}" readonly />
            `;

            lista.appendChild(div);

            cursor.continue();
        }
    };
}

function formatarData(dataStr) {
    const d = new Date(dataStr);
    if (isNaN(d)) return dataStr;
    return d.toLocaleDateString("pt-BR");
}

document.addEventListener("DOMContentLoaded", async () => {
    await abrirIndexedDB();

    carregarAgendamentos();

    const botoes = document.querySelectorAll(".buttons button");

    botoes[0].addEventListener("click", () => carregarAgendamentos("gato"));
    botoes[1].addEventListener("click", () => carregarAgendamentos("cao"));
});
