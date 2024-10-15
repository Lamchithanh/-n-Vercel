const db = require("../config/db");

const quizModel = db.execute(
    "CREATE TABLE IF NOT EXISTS quizzes (id INT AUTO_INCREMENT, title VARCHAR(255), description TEXT, PRIMARY KEY (id))"
);

module.exports = quizModel;
