const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
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
        console.log("Database error:", err);
    } else {
        console.log("Database connected!");
    }
});

// test route
app.get("/", (req, res) => {
    res.send("API DudukYu aktif 🚀");
});

// ambil restoran
app.get("/restaurants", (req, res) => {
    db.query("SELECT * FROM restaurants", (err, result) => {
        if (err) return res.json(err);
        res.json(result);
    });
});

app.listen(5000, () => {
    console.log("Server jalan di http://localhost:5000");
});