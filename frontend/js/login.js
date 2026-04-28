const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("email");
const loginPassword = document.getElementById("password");
const loginMessage = document.getElementById("formMessage");
const loginSubmitButton = document.getElementById("submitButton");

function setMessage(message, type = "") {
    loginMessage.textContent = message;
    loginMessage.className = "form-message";

    if (type) {
        loginMessage.classList.add(`is-${type}`);
    }
}

async function login(event) {
    if (event) {
        event.preventDefault();
    }

    const email = loginEmail.value.trim().toLowerCase();
    const password = loginPassword.value.trim();

    if (!email || !password) {
        setMessage("Email dan password wajib diisi", "error");
        return;
    }

    loginSubmitButton.disabled = true;
    loginSubmitButton.textContent = "Memproses...";
    setMessage("Sedang login...");

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            setMessage(data.error || "Login gagal", "error");
            return;
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Login berhasil, mengarahkan ke home...", "success");

        window.setTimeout(() => {
            window.location.href = "./index.html";
        }, 700);
    } catch (error) {
        setMessage("Tidak dapat terhubung ke server", "error");
    } finally {
        loginSubmitButton.disabled = false;
        loginSubmitButton.textContent = "Masuk";
    }
}

function goRegister() {
    window.location.href = "./buat_akun.html";
}

loginForm?.addEventListener("submit", login);
