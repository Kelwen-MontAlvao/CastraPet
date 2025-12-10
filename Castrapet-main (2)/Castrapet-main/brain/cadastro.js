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

function buscarUsuarioPorEmail(email) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["usuarios"], "readonly");
    const store = transaction.objectStore("usuarios");
    const req = store.get(email);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject("Erro ao buscar usuário");
  });
}

function salvarUsuario(dados) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["usuarios"], "readwrite");
    const store = transaction.objectStore("usuarios");
    const request = store.put(dados); // put aceita inserção/atualização
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject("Erro ao salvar usuário");
  });
}

function getInput(name, placeholder) {
  return document.querySelector(`input[name="${name}"]`) ||
         document.querySelector(`input[placeholder="${placeholder}"]`);
}


function validarEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validarTelefone(tel) {
  if (!tel) return false;
  const digits = tel.replace(/\D/g, "");
  return digits.length === 11; 
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");

    if (cpf.length !== 11) return false;

  
    if (/^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    
    for (let i = 1; i <= 9; i++)
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    
    soma = 0;
    for (let i = 1; i <= 10; i++)
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(cpf.substring(10, 11));
}

function marcarErro(inputEl) {
  if (!inputEl) return;
  inputEl.classList.add("input-error");
}
function limparErros(form) {
  form.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
}


document.addEventListener("DOMContentLoaded", async () => {
  await abrirIndexedDB();

  const form = document.querySelector("form");
  const msg = document.getElementById("msg-sucesso");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErros(form);

    
    const inputNome     = getInput("nome", 'Ex: Maria Eduarda');
    const inputCPF      = getInput("cpf", '000.000.000-00');
    const inputTel      = getInput("telefone", '(00) 9 9999-9999');
    const inputEmail    = getInput("email", 'seunome@exemplo.com');

    const nome   = inputNome ? inputNome.value.trim() : "";
    const cpf    = inputCPF ? inputCPF.value.trim() : "";
    const tel    = inputTel ? inputTel.value.trim() : "";
    const email  = inputEmail ? inputEmail.value.trim().toLowerCase() : "";

    const erros = [];

    if (!nome) {
      erros.push("Nome é obrigatório.");
      marcarErro(inputNome);
    }
    if (!cpf) {
      erros.push("CPF é obrigatório.");
      marcarErro(inputCPF);
    } else if (!validarCPF(cpf)) {
      erros.push("CPF inválido.");
      marcarErro(inputCPF);
    }
    if (!tel) {
      erros.push("Telefone é obrigatório.");
      marcarErro(inputTel);
    } else if (!validarTelefone(tel)) {
      erros.push("Telefone inválido. Informe DDD + número (ex: (11) 9 9123-4567).");
      marcarErro(inputTel);
    }
    if (!email) {
      erros.push("E-mail é obrigatório.");
      marcarErro(inputEmail);
    } else if (!validarEmail(email)) {
      erros.push("E-mail inválido.");
      marcarErro(inputEmail);
    }

    if (erros.length > 0) {
      alert("Corrija os erros:\n\n" + erros.join("\n"));
      return;
    }

    try {
      const existente = await buscarUsuarioPorEmail(email);
      if (existente) {
        alert("Este e-mail já está cadastrado.");
        marcarErro(inputEmail);
        return;
      }

      const dadosUsuario = {
        nome,
        cpf,
        telefone: tel,
        email
      };

      await salvarUsuario(dadosUsuario);

      if (msg) msg.classList.remove("d-none");
      form.reset();

      
      window.location.href = "agendamento.html";
    } catch (err) {
      alert("Erro ao salvar cadastro: " + err);
    }
  });
});
