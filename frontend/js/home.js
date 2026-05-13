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

    window.location.href = "./profile.html";
});
