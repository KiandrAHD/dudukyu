const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let reservationsReady = Promise.resolve();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dudukyu"
});

db.connect((err) => {
    if (err) {
        console.error("Database error:", err.message);
        return;
    }

    console.log("Database connected!");
    reservationsReady = ensureReservationsTable();
});

function query(sql, values = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(result);
        });
    });
}

function buildDefaultName(email) {
    return email.split("@")[0].slice(0, 30) || "User";
}

async function ensureReservationsTable() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS reservations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                restaurant_name VARCHAR(255) NULL,
                table_number VARCHAR(50) NULL,
                reservation_date DATE NULL,
                reservation_time TIME NULL,
                people_count INT NULL,
                seat_type VARCHAR(100) NULL,
                status VARCHAR(50) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const columns = await query("SHOW COLUMNS FROM reservations");
        const columnMap = new Map(columns.map((column) => [column.Field, column]));
        const requiredColumns = [
            ["user_id", "INT NULL"],
            ["restaurant_name", "VARCHAR(255) NULL"],
            ["table_number", "VARCHAR(50) NULL"],
            ["reservation_date", "DATE NULL"],
            ["reservation_time", "TIME NULL"],
            ["people_count", "INT NULL"],
            ["seat_type", "VARCHAR(100) NULL"],
            ["status", "VARCHAR(50) NULL"],
            ["created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"]
        ];

        for (const [name, definition] of requiredColumns) {
            if (!columnMap.has(name)) {
                await query(`ALTER TABLE reservations ADD COLUMN ${name} ${definition}`);
            }
        }

        const legacyColumns = ["restaurant_id", "table_id", "start_time", "end_time"];

        for (const name of legacyColumns) {
            const column = columnMap.get(name);

            if (column && column.Null === "NO") {
                const type = column.Type.toUpperCase();
                await query(`ALTER TABLE reservations MODIFY COLUMN ${name} ${type} NULL`);
            }
        }

        console.log("Reservations table ready!");
    } catch (error) {
        console.error("Failed to prepare reservations table:", error.message);
    }
}

app.get("/", (req, res) => {
    res.send("API DudukYu aktif");
});

app.get("/restaurants", async (req, res) => {
    try {
        const restaurants = await query("SELECT * FROM restaurants");
        res.json(restaurants);
    } catch (error) {
        console.error("Failed to fetch restaurants:", error.message);
        res.status(500).json({ error: "Gagal mengambil data restoran" });
    }
});

app.post("/register", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
        return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: "Format email tidak valid" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Password minimal 6 karakter" });
    }

    try {
        const existingUser = await query(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({ error: "Email sudah digunakan" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const name = buildDefaultName(email);

        await query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: "Akun berhasil dibuat" });
    } catch (error) {
        console.error("Register failed:", error.message);
        res.status(500).json({ error: "Terjadi kesalahan saat membuat akun" });
    }
});

app.post("/login", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
        return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    try {
        const users = await query(
            "SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Password salah" });
        }

        res.json({
            message: "Login berhasil",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login failed:", error.message);
        res.status(500).json({ error: "Terjadi kesalahan saat login" });
    }
});

app.post("/reservations", async (req, res) => {
    const {
        user_id,
        restaurant_name,
        table_number,
        reservation_date,
        reservation_time,
        people_count,
        seat_type
    } = req.body;

    const validSeatTypes = ["Indoor", "Outdoor", "VIP Room", "Non-Smoking"];
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const timePattern = /^\d{2}:\d{2}$/;
    const tablePattern = /^[ABC][1-5]$/;
    const people = Number(people_count);

    if (!user_id || !restaurant_name || !table_number || !reservation_date || !reservation_time || !people_count || !seat_type) {
        return res.status(400).json({ error: "Semua data reservasi wajib diisi" });
    }

    if (!datePattern.test(String(reservation_date))) {
        return res.status(400).json({ error: "Format tanggal tidak valid" });
    }

    if (!timePattern.test(String(reservation_time))) {
        return res.status(400).json({ error: "Format jam tidak valid" });
    }

    if (!Number.isInteger(people) || people < 1 || people > 10) {
        return res.status(400).json({ error: "Jumlah orang harus 1 sampai 10" });
    }

    if (!validSeatTypes.includes(seat_type)) {
        return res.status(400).json({ error: "Tipe tempat duduk tidak valid" });
    }

    if (!tablePattern.test(String(table_number))) {
        return res.status(400).json({ error: "Nomor meja tidak valid" });
    }

    try {
        await reservationsReady;

        const result = await query(
            `INSERT INTO reservations
            (user_id, restaurant_name, table_number, reservation_date, reservation_time, people_count, seat_type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
            [user_id, restaurant_name, table_number, reservation_date, `${reservation_time}:00`, people, seat_type]
        );

        res.status(201).json({
            message: "Booking berhasil",
            reservation: {
                id: result.insertId,
                user_id,
                restaurant_name,
                table_number,
                reservation_date,
                reservation_time,
                people_count: people,
                seat_type,
                status: "confirmed"
            }
        });
    } catch (error) {
        console.error("Reservation failed:", error.message);
        res.status(500).json({
            error: "Gagal menyimpan reservasi",
            detail: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});
