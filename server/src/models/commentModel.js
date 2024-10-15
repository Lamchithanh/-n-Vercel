const db = require("../config/db");

const commentModel = db.execute(
    "CREATE TABLE IF NOT EXISTS comments (id INT AUTO_INCREMENT, content TEXT, userId INT, courseId INT, PRIMARY KEY (id), FOREIGN KEY (userId) REFERENCES users(id), FOREIGN KEY (courseId) REFERENCES courses(id))"
);

module.exports = commentModel;
