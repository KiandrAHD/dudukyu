const user = JSON.parse(localStorage.getItem("user") || "null");
const profileButton = document.getElementById("profileButton");
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileEmail = document.querySelector("#profileEmail span");
const bookingList = document.getElementById("bookingList");
const logoutButton = document.getElementById("logoutButton");
const tabs = document.querySelectorAll(".booking-tab");

const statusLabels = {
    upcoming: "Akan Datang",
    completed: "Selesai",
    cancelled: "Dibatalkan"
};

const restaurantImages = {
    "K4RA Dining House": "../assets/home/1.jpg",
    "KPFF Kitchen": "../assets/home/3.jpg",
    "Grill House": "../assets/home/4.jpg",
    "Cafe De Lune": "../assets/home/5.jpg",
    "KIFRA Collective": "../assets/home/6.jpg",
    "Zenvira Dining House": "../assets/home/7.jpg"
};

const restaurantLinks = {
    "K4RA Dining House": "./booking_k4ra.html",
    "KPFF Kitchen": "./booking_kpff.html",
    "Grill House": "./booking_grill.html",
    "Cafe De Lune": "./booking_cafe.html",
    "KIFRA Collective": "./booking_kifra.html",
    "Zenvira Dining House": "./booking_zenvira.html"
};

let reservations = [];
let activeStatus = "upcoming";

if (!user) {
    window.location.replace("./login.html");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getInitials(name) {
    const words = String(name || "DudukYu")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 0) {
        return "DU";
    }

    return words
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

function normalizeDate(value) {
    if (!value) {
        return "";
    }

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toISOString().slice(0, 10);
}

function normalizeStatus(reservation) {
    const status = String(reservation.status || "").toLowerCase();

    if (["cancelled", "canceled", "dibatalkan"].includes(status)) {
        return "cancelled";
    }

    if (["completed", "selesai", "done"].includes(status)) {
        return "completed";
    }

    if (status === "confirmed") {
        return "upcoming";
    }

    const dateValue = normalizeDate(reservation.reservation_date);
    const today = new Date();
    const todayValue = today.toISOString().slice(0, 10);

    return dateValue && dateValue < todayValue ? "completed" : "upcoming";
}

function formatDate(value) {
    const dateValue = normalizeDate(value);

    if (!dateValue) {
        return "Tanggal belum tersedia";
    }

    const date = new Date(`${dateValue}T00:00:00`);

    return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date);
}

function formatTime(value) {
    if (!value) {
        return "Jam belum tersedia";
    }

    return String(value).slice(0, 5);
}

function getRestaurantImage(name) {
    return restaurantImages[name] || "../assets/home/2.png";
}

function getRestaurantLink(name) {
    return restaurantLinks[name] || "./index.html";
}

function setProfile() {
    if (profileButton && user?.name) {
        profileButton.textContent = user.name;
    }

    profileButton?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    if (profileAvatar) {
        profileAvatar.textContent = getInitials(user?.name);
    }

    if (profileName) {
        profileName.textContent = user?.name || "Pengguna DudukYu";
    }

    if (profileEmail) {
        profileEmail.textContent = user?.email || "Email belum tersedia";
    }
}

function setCounts() {
    const counts = {
        upcoming: 0,
        completed: 0,
        cancelled: 0
    };

    reservations.forEach((reservation) => {
        counts[reservation.normalizedStatus] += 1;
    });

    Object.entries(counts).forEach(([status, total]) => {
        const countElement = document.querySelector(`[data-count="${status}"]`);

        if (countElement) {
            countElement.textContent = total;
        }
    });
}

function renderEmptyState() {
    bookingList.innerHTML = `
        <article class="booking-empty">
            <div class="empty-content">
                <div class="empty-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 9H4v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7ZM5 6a1 1 0 0 0-1 1v2h16V7a1 1 0 0 0-1-1H5Z"/></svg>
                </div>
                <h3>Belum ada reservasi</h3>
                <p>Mulai booking restoran favorit Anda sekarang</p>
                <a class="empty-button" href="./index.html">Cari Restoran</a>
            </div>
        </article>
    `;
}

function renderBookings() {
    const filteredReservations = reservations.filter((reservation) => reservation.normalizedStatus === activeStatus);

    if (filteredReservations.length === 0) {
        renderEmptyState();
        return;
    }

    bookingList.innerHTML = filteredReservations.map((reservation) => {
        const restaurantName = reservation.restaurant_name || "Restoran DudukYu";
        const people = Number(reservation.people_count || 0);
        const peopleLabel = people > 0 ? `${people} Orang` : "Jumlah orang belum tersedia";
        const imageSrc = getRestaurantImage(restaurantName);
        const detailUrl = getRestaurantLink(restaurantName);
        const label = statusLabels[reservation.normalizedStatus];

        return `
            <article class="booking-card">
                <img src="${imageSrc}" alt="${escapeHtml(restaurantName)}">
                <div class="booking-info">
                    <h3>${escapeHtml(restaurantName)}</h3>
                    <div class="booking-meta">
                        <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 9H4v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7ZM5 6a1 1 0 0 0-1 1v2h16V7a1 1 0 0 0-1-1H5Z"/></svg>
                            ${escapeHtml(formatDate(reservation.reservation_date))}
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm1 10.59 3.3 3.3-1.4 1.42-3.9-3.9V6h2v6.59Z"/></svg>
                            ${escapeHtml(formatTime(reservation.reservation_time))}
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11a4 4 0 1 0-3.999-4A4 4 0 0 0 16 11Zm-8 0A3 3 0 1 0 8 5a3 3 0 0 0 0 6Zm8 2c-2.7 0-8 1.35-8 4v1h12v-1c0-2.65-5.3-4-8-4ZM8 13c-2.33 0-7 1.17-7 3.5V18h5v-1c0-1.17.72-2.19 1.93-3.02A3.8 3.8 0 0 0 8 13Z"/></svg>
                            ${escapeHtml(peopleLabel)}
                        </span>
                    </div>
                </div>
                <div class="booking-actions">
                    <span class="booking-status is-${reservation.normalizedStatus}">${label}</span>
                    <a class="detail-button" href="${detailUrl}">Lihat Detail</a>
                </div>
            </article>
        `;
    }).join("");
}

async function loadReservations() {
    bookingList.innerHTML = `<p class="booking-message">Memuat reservasi Anda...</p>`;

    try {
        const response = await fetch(`http://localhost:5000/my-reservations/${user.id}`);
        const data = await response.json();

        if (!response.ok) {
            bookingList.innerHTML = `<p class="booking-message">${escapeHtml(data.error || "Gagal mengambil reservasi")}</p>`;
            return;
        }

        reservations = data.map((reservation) => ({
            ...reservation,
            normalizedStatus: normalizeStatus(reservation)
        }));

        setCounts();
        renderBookings();
    } catch (error) {
        bookingList.innerHTML = `<p class="booking-message">Tidak dapat terhubung ke server reservasi.</p>`;
    }
}

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        activeStatus = tab.dataset.status;

        tabs.forEach((item) => {
            const isActive = item === tab;
            item.classList.toggle("is-active", isActive);
            item.setAttribute("aria-selected", String(isActive));
        });

        renderBookings();
    });
});

logoutButton?.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "./login.html";
});

if (user) {
    setProfile();
    loadReservations();
}
