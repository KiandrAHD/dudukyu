const user = JSON.parse(localStorage.getItem("user") || "null");
const reservation = JSON.parse(localStorage.getItem("lastReservation") || "null");
const profileButton = document.getElementById("profileButton");
const detailBox = document.getElementById("reservationDetail");

if (!user) {
    window.location.href = "./login.html";
}

if (!reservation) {
    window.location.href = "./index.html";
}

if (profileButton && user?.name) {
    profileButton.textContent = user.name;
}

profileButton?.addEventListener("click", () => {
    const shouldLogout = window.confirm(`Login sebagai ${user.name}. Keluar dari akun?`);

    if (shouldLogout) {
        localStorage.removeItem("user");
        window.location.href = "./login.html";
    }
});

function addDetail(label, value) {
    const row = document.createElement("div");
    row.className = "detail-row";
    row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    detailBox.appendChild(row);
}

if (reservation && detailBox) {
    addDetail("Nama Pemesan", reservation.user_name || user.name);
    addDetail("Restoran", reservation.restaurant_name);
    addDetail("Tanggal", reservation.date_label || reservation.reservation_date);
    addDetail("Jam", reservation.reservation_time);
    addDetail("Jumlah Orang", `${reservation.people_count} Orang`);
    addDetail("Tempat Duduk", `Meja ${reservation.table_number} (${reservation.seat_type})`);
    addDetail("Status", "Confirmed");
}
