const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});
