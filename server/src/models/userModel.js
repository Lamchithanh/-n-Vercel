const db = require("../config/db");

const userModel = db.execute(
    "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT, username VARCHAR(255), email VARCHAR(255), password VARCHAR(255), PRIMARY KEY (id))"
);

module.exports = userModel;
