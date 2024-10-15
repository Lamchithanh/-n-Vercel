const db = require("../config/db");

const courseModel = db.execute(
    "CREATE TABLE IF NOT EXISTS courses (id INT AUTO_INCREMENT, title VARCHAR(255), description TEXT, PRIMARY KEY (id))"
);

module.exports = courseModel;
