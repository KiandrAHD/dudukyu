const storedUser = JSON.parse(localStorage.getItem("user") || "null");
const profileButton = document.getElementById("profileButton");

if (storedUser?.name) {
    profileButton.textContent = storedUser.name;
}

profileButton?.addEventListener("click", () => {
    if (!storedUser) {
        window.location.href = "./login.html";
        return;
    }

    const shouldLogout = window.confirm(`Login sebagai ${storedUser.name}. Keluar dari akun?`);

    if (shouldLogout) {
        localStorage.removeItem("user");
        window.location.href = "./login.html";
    }
});
