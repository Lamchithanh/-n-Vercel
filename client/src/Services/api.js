const express = require("express");
const mysql = require("mysql");
const app = express();

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "MyDatabase",
});

app.use(express.json());

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(query, [email, password], (error, results) => {
        if (error) {
            res.status(500).json({
                error: "An error occurred. Please try again.",
            });
        } else if (results.length === 0) {
            res.status(401).json({ error: "Invalid email or password." });
        } else {
            res.json({ message: "Login successful!" });
        }
    });
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
