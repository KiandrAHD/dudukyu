const registerForm = document.getElementById("registerForm");
const registerEmail = document.getElementById("email");
const registerPassword = document.getElementById("password");
const registerMessage = document.getElementById("formMessage");
const registerSubmitButton = document.getElementById("submitButton");

function setRegisterMessage(message, type = "") {
    registerMessage.textContent = message;
    registerMessage.className = "form-message";

    if (type) {
        registerMessage.classList.add(`is-${type}`);
    }
}

async function register(event) {
    if (event) {
        event.preventDefault();
    }

    const email = registerEmail.value.trim().toLowerCase();
    const password = registerPassword.value.trim();

    if (!email || !password) {
        setRegisterMessage("Email dan password wajib diisi", "error");
        return;
    }

    if (password.length < 6) {
        setRegisterMessage("Password minimal 6 karakter", "error");
        return;
    }

    registerSubmitButton.disabled = true;
    registerSubmitButton.textContent = "Membuat akun...";
    setRegisterMessage("Sedang menyimpan akun...");

    try {
        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            setRegisterMessage(data.error || "Registrasi gagal", "error");
            return;
        }

        setRegisterMessage("Akun berhasil dibuat, mengarahkan ke login...", "success");

        window.setTimeout(() => {
            window.location.href = "./login.html";
        }, 900);
    } catch (error) {
        setRegisterMessage("Tidak dapat terhubung ke server", "error");
    } finally {
        registerSubmitButton.disabled = false;
        registerSubmitButton.textContent = "Buat Akun";
    }
}

function goLogin() {
    window.location.href = "./login.html";
}

registerForm?.addEventListener("submit", register);
