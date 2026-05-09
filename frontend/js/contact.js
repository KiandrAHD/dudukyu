const contactForm = document.getElementById("contactForm");
const contactSubmit = document.getElementById("contactSubmit");
const contactMessage = document.getElementById("contactMessage");
const userNameInput = document.getElementById("userName");
const userEmailInput = document.getElementById("userEmail");
const subjectInput = document.getElementById("subject");
const messageInput = document.getElementById("message");

function setContactMessage(message, type = "") {
    contactMessage.textContent = message;
    contactMessage.className = "contact-message";

    if (type) {
        contactMessage.classList.add(`is-${type}`);
    }
}

function getContactPayload() {
    return {
        user_name: userNameInput.value.trim(),
        user_email: userEmailInput.value.trim().toLowerCase(),
        subject: subjectInput.value.trim(),
        message: messageInput.value.trim()
    };
}

contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = getContactPayload();

    if (!payload.user_name || !payload.user_email || !payload.subject || !payload.message) {
        setContactMessage("Semua field wajib diisi", "error");
        return;
    }

    contactSubmit.disabled = true;
    contactSubmit.textContent = "Mengirim...";
    setContactMessage("Sedang mengirim pesan...");

    try {
        const response = await fetch("http://localhost:5000/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            setContactMessage(data.error || "Pesan gagal dikirim", "error");
            return;
        }

        window.alert("Pesan berhasil dikirim. Tim DudukYuk akan segera merespons.");
        contactForm.reset();
        setContactMessage("Pesan berhasil dikirim", "success");
    } catch (error) {
        setContactMessage("Tidak dapat terhubung ke server", "error");
    } finally {
        contactSubmit.disabled = false;
        contactSubmit.textContent = "Kirim Pesan";
    }
});
