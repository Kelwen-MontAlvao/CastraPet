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

function verificarUsuario(email, telefone) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["usuarios"], "readonly");
    const store = transaction.objectStore("usuarios");

    const request = store.get(email);

    request.onsuccess = (event) => {
      const usuario = event.target.result;
      if (usuario && usuario.telefone === telefone) {
        resolve(true);
      } else {
        resolve(false);
      }
    };

    request.onerror = () => reject("Erro ao verificar usuário no IndexedDB");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await abrirIndexedDB();

  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value.trim();
    const telefone = document.querySelector('input[type="tel"]').value.trim();

    if (!email || !telefone) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const usuarioExiste = await verificarUsuario(email, telefone);
      if (usuarioExiste) {
        window.location.href = "agendamento.html";
      } else {
        alert("Usuário não encontrado. Por favor, cadastre-se primeiro.");
      }
    } catch (erro) {
      alert("Erro ao verificar login: " + erro);
    }
  });
});
