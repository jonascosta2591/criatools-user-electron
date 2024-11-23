const { ipcRenderer } = require("electron");
const axios = require("axios");
const fs = require("fs").promises;
const minimizeBtn = document.getElementById("minimize-btn");
const closeBtn = document.getElementById("close-btn");
const chatGPT_Id = document.getElementById("chatgpt");
const leonardoIA_Id = document.getElementById("leonardoIA");
const email = document.getElementById("email");
const senha = document.getElementById("password");
const containerLoginLogin = document.querySelector(".container-login-login");
const LoaderSpinner = document.querySelector(".loader");
const btnCadastrar = document.getElementById("btn-cadastrar");

ipcRenderer.on("update_available", () => {
  alert("Uma nova atualização está disponível. Será baixada em breve.");
});

ipcRenderer.on("update_downloaded", () => {
  alert(
    "Atualização baixada. O aplicativo será reiniciado para aplicar a atualização."
  );
  ipcRenderer.send("restart_app");
});

function minimize() {
  ipcRenderer.send("minimize", "minimize");
}
function close() {
  fs.truncate("authtoken.txt", 0);
  ipcRenderer.send("close", "close");
}
async function chatGPT() {
  verifyIfUserIsActive();
  const chatGPT = chatGPT_Id.innerHTML;

  chatGPT_Id.innerHTML = "Carregando...";
  chatGPT_Id.disabled = true;

  ipcRenderer.send("chatgpt", "chatgpt");

  setTimeout(() => {
    chatGPT_Id.innerHTML = "Aguarde...";
  }, 3000);

  setTimeout(() => {
    chatGPT_Id.innerHTML = chatGPT;
    chatGPT_Id.disabled = false;
  }, 12000);
}
async function leonardoIA() {
  const leonardoia = leonardoIA_Id.innerHTML;

  leonardoIA_Id.innerHTML = "Carregando...";

  ipcRenderer.send("leonardoia", "leonardoia");

  setTimeout(() => {
    leonardoIA_Id.innerHTML = leonardoia;
  }, 3000);
}

btnCadastrar.addEventListener("click", () => {
  require("child_process").exec("start https://www.google.com/");
});
minimizeBtn.addEventListener("click", minimize);
closeBtn.addEventListener("click", close);
chatGPT_Id.addEventListener("click", chatGPT);
leonardoIA_Id.addEventListener("click", leonardoIA);

document.getElementById("logout").addEventListener("click", async () => {
  await fs.truncate("authtoken.txt", 0);
  document.getElementById("login").style.display = "flex";
  document.querySelector(".container-login").style.display = "flex";
});

async function init() {
  try {
    const data = await fs.readFile("./authtoken.txt", "utf8");
    if (data) {
      document.getElementById("username").innerHTML = data.split(";")[1];
      localStorage.setItem("authtoken", data);
      document.getElementById("login").style.display = "none";
      document.querySelector(".container-login").style.display = "none";
    } else {
    }
  } catch {
    await fs.writeFile("./authtoken.txt");
    await init();
  }
}
init();

document.getElementById("login").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  LoaderSpinner.style.display = "inline-block";
  containerLoginLogin.style.display = "none";
  setTimeout(async () => {
    if (email.value === "" || senha.value === "") {
      document.querySelector(".errormsg").innerHTML = "Algum campo está vazio";
      containerLoginLogin.style.display = "flex";
      LoaderSpinner.style.display = "none";
    } else {
      const response = await axios.post(`http://localhost:3344/login_user`, {
        email: email.value,
        senha: senha.value,
      });
      if (
        JSON.stringify(response.data).indexOf("usuário ou senha invalidos") > -1
      ) {
        document.querySelector(".errormsg").innerHTML = response.data.error;
      } else {
        if (parseInt(response.data.liberado) === 1) {
          await fs.writeFile(
            "./authtoken.txt",
            response.data.acessToken +
              ";" +
              response.data.nome +
              ";" +
              response.data.uuid_grupo,
            "utf8"
          );
          localStorage.setItem(
            "authtoken",
            response.data.acessToken +
              ";" +
              response.data.nome +
              ";" +
              response.data.uuid_grupo
          );
          localStorage.setItem("uuid_grupo", response.data.uuid_grupo);

          document.getElementById("login").style.display = "none";
          document.querySelector(".container-login").style.display = "none";
        } else {
          document.querySelector(".errormsg").innerHTML =
            "faça o pagamento para continuar usando";
        }
      }
      containerLoginLogin.style.display = "flex";
      LoaderSpinner.style.display = "none";
    }
  }, 2000);
});

async function verifyIfUserIsActive() {
  try {
    const data = await fs.readFile("./authtoken.txt", "utf8");

    let response = await axios.get(
      "http://localhost:3344/verify_if_user_is_active",
      {
        headers: {
          authorization: data.split(";")[0],
        },
      }
    );

    if (parseInt(response.data) === 0) {
      //se usuário não estiver liberado
      //Apaga sessão do usuário
      await fs.truncate("authtoken.txt", 0);
      document.getElementById("login").style.display = "flex";
      document.querySelector(".container-login").style.display = "flex";
    }
    console.log("verificando se usuário está liberado");
  } catch (err) {
    alert(err);
  }
}
