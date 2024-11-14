// controllers/IntroduceController.js
const pool = require("../config/pool");

const getDashboardData = async (req, res) => {
  const query = `
      SELECT 
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM courses) AS total_courses,
        (SELECT COUNT(*) FROM certificates) AS total_certificates
    `;

  try {
    // Use promise-based query execution
    const [results] = await pool.query(query);

    const { total_users, total_courses, total_certificates } = results[0];
    res.json({ total_users, total_courses, total_certificates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error querying the database" });
  }
};

module.exports = { getDashboardData };
