const user = JSON.parse(localStorage.getItem("user") || "null");
const profileButton = document.getElementById("profileButton");
const bookingPage = document.getElementById("bookingPage");
const dateOptions = document.getElementById("dateOptions");
const timeOptions = document.getElementById("timeOptions");
const seatOptions = document.getElementById("seatOptions");
const tableMap = document.getElementById("tableMap");
const decreaseButton = document.getElementById("decreasePeople");
const increaseButton = document.getElementById("increasePeople");
const peopleCountText = document.getElementById("peopleCountText");
const selectedDateText = document.getElementById("selectedDateText");
const selectedTableText = document.getElementById("selectedTableText");
const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");
const confirmButton = document.getElementById("confirmButton");

const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const times = ["17:00", "18:00", "19:00", "20:00", "21:00"];
const seatTypes = ["Indoor", "Outdoor", "VIP Room", "Non-Smoking"];
const bookedTables = ["A5", "B4", "B5"];
const tables = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5", "C1", "C2", "C3", "C4", "C5"];

let state = {
    date: "",
    dateLabel: "",
    time: "19:00",
    people: 2,
    seatType: "Indoor",
    tableNumber: "B3"
};

if (!user) {
    window.location.href = "./login.html";
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

function formatDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDateLabel(date) {
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function updateSummary() {
    document.querySelectorAll("[data-summary='restaurant']").forEach((element) => {
        element.textContent = bookingPage.dataset.restaurant;
    });
    document.querySelectorAll("[data-summary='date']").forEach((element) => {
        element.textContent = state.dateLabel;
    });
    document.querySelectorAll("[data-summary='time']").forEach((element) => {
        element.textContent = state.time;
    });
    document.querySelectorAll("[data-summary='people']").forEach((element) => {
        element.textContent = `${state.people} Orang`;
    });
    document.querySelectorAll("[data-summary='seat']").forEach((element) => {
        element.textContent = `Meja ${state.tableNumber} (${state.seatType})`;
    });

    peopleCountText.textContent = `${state.people} Orang`;
    selectedDateText.textContent = state.dateLabel;
    selectedTableText.textContent = `${state.tableNumber} (${state.seatType})`;
}

function renderDates() {
    const today = new Date();

    dateOptions.innerHTML = "";

    for (let index = 0; index < 7; index += 1) {
        const date = new Date(today);
        date.setDate(today.getDate() + index);

        const value = formatDateValue(date);
        const button = document.createElement("button");
        button.className = "choice-button";
        button.type = "button";
        button.dataset.date = value;
        button.innerHTML = `<span>${days[date.getDay()]}</span><strong>${date.getDate()}</strong><span>${months[date.getMonth()]}</span>`;

        if (index === 2) {
            state.date = value;
            state.dateLabel = formatDateLabel(date);
            button.classList.add("is-active");
        }

        button.addEventListener("click", () => {
            state.date = value;
            state.dateLabel = formatDateLabel(date);
            document.querySelectorAll("[data-date]").forEach((item) => item.classList.remove("is-active"));
            button.classList.add("is-active");
            updateSummary();
        });

        dateOptions.appendChild(button);
    }
}

function renderTimes() {
    timeOptions.innerHTML = "";

    times.forEach((time) => {
        const button = document.createElement("button");
        button.className = "choice-button time-button";
        button.type = "button";
        button.dataset.time = time;
        button.textContent = time;

        if (time === state.time) {
            button.classList.add("is-active");
        }

        button.addEventListener("click", () => {
            state.time = time;
            document.querySelectorAll("[data-time]").forEach((item) => item.classList.remove("is-active"));
            button.classList.add("is-active");
            updateSummary();
        });

        timeOptions.appendChild(button);
    });
}

function renderSeatTypes() {
    seatOptions.innerHTML = "";

    seatTypes.forEach((seatType) => {
        const button = document.createElement("button");
        button.className = "seat-button";
        button.type = "button";
        button.dataset.seatType = seatType;
        button.textContent = seatType;

        if (seatType === state.seatType) {
            button.classList.add("is-active");
        }

        button.addEventListener("click", () => {
            state.seatType = seatType;
            document.querySelectorAll("[data-seat-type]").forEach((item) => item.classList.remove("is-active"));
            button.classList.add("is-active");
            updateSummary();
        });

        seatOptions.appendChild(button);
    });
}

function renderTables() {
    tableMap.innerHTML = "";

    tables.forEach((table) => {
        const button = document.createElement("button");
        button.className = "table-button";
        button.type = "button";
        button.textContent = table;
        button.dataset.table = table;

        if (bookedTables.includes(table)) {
            button.classList.add("is-booked");
            button.disabled = true;
        }

        if (table === state.tableNumber) {
            button.classList.add("is-selected");
        }

        button.addEventListener("click", () => {
            if (bookedTables.includes(table)) {
                return;
            }

            state.tableNumber = table;
            document.querySelectorAll("[data-table]").forEach((item) => item.classList.remove("is-selected"));
            button.classList.add("is-selected");
            updateSummary();
        });

        tableMap.appendChild(button);
    });
}

function setPeople(nextValue) {
    state.people = Math.min(10, Math.max(1, nextValue));
    updateSummary();
}

function setMessage(message, isError = true) {
    formMessage.textContent = message;
    formMessage.style.color = isError ? "#dc2626" : "#16a34a";
}

decreaseButton?.addEventListener("click", () => setPeople(state.people - 1));
increaseButton?.addEventListener("click", () => setPeople(state.people + 1));

bookingForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("");

    if (!state.tableNumber) {
        setMessage("Pilih meja terlebih dahulu");
        return;
    }

    const payload = {
        user_id: user.id,
        restaurant_name: bookingPage.dataset.restaurant,
        table_number: state.tableNumber,
        reservation_date: state.date,
        reservation_time: state.time,
        people_count: state.people,
        seat_type: state.seatType
    };

    confirmButton.disabled = true;
    confirmButton.textContent = "Memproses...";

    try {
        const response = await fetch("http://localhost:5000/reservations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            setMessage(data.detail ? `${data.error}: ${data.detail}` : data.error || "Reservasi gagal disimpan");
            return;
        }

        localStorage.setItem("lastReservation", JSON.stringify({
            ...payload,
            date_label: state.dateLabel,
            user_name: user.name,
            status: data.reservation?.status || "confirmed"
        }));

        setMessage("Reservasi berhasil. Mengarahkan...", false);
        window.setTimeout(() => {
            window.location.href = "./selesai_booking.html";
        }, 600);
    } catch (error) {
        setMessage("Tidak dapat terhubung ke server");
    } finally {
        confirmButton.disabled = false;
        confirmButton.textContent = "Konfirmasi Reservasi";
    }
});

renderDates();
renderTimes();
renderSeatTypes();
renderTables();
updateSummary();
