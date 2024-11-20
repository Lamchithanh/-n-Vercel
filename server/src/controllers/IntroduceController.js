const pool = require("../config/pool");

const getDashboardData = async (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM courses) AS total_courses,
      (SELECT COUNT(*) FROM certificates) AS total_certificates,
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') AS total_revenue,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', month_name,
            'students', user_count,
            'courses', course_count,
            'revenue', revenue
          )
        )
        FROM (
          SELECT 
            DATE_FORMAT(m.month_start, '%b') as month_name,
            m.month_start,
            COUNT(DISTINCT u.id) as user_count,
            COUNT(DISTINCT c.id) as course_count,
            COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as revenue
          FROM (
            SELECT DISTINCT
              LAST_DAY(DATE_SUB(CURDATE(), INTERVAL n MONTH)) - INTERVAL DAY(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL n MONTH))) - 1 DAY AS month_start
            FROM (
              SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
            ) months
          ) m
          LEFT JOIN users u ON DATE_FORMAT(u.created_at, '%Y-%m') = DATE_FORMAT(m.month_start, '%Y-%m')
          LEFT JOIN courses c ON DATE_FORMAT(c.created_at, '%Y-%m') = DATE_FORMAT(m.month_start, '%Y-%m')
          LEFT JOIN payments p ON DATE_FORMAT(p.transaction_date, '%Y-%m') = DATE_FORMAT(m.month_start, '%Y-%m')
            AND p.status = 'completed'
          GROUP BY m.month_start
          ORDER BY m.month_start DESC
        ) monthly_stats
      ) AS monthly_data,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', c.title,
            'students', student_count,
            'revenue', total_revenue,
            'payment_methods', payment_methods_json
          )
        )
        FROM (
          SELECT 
            p.course_id,
            COUNT(DISTINCT p.user_id) as student_count,
            COALESCE(SUM(p.amount), 0) as total_revenue,
            JSON_OBJECT(
              'credit_card', COUNT(CASE WHEN payment_method = 'credit_card' THEN 1 END),
              'paypal', COUNT(CASE WHEN payment_method = 'paypal' THEN 1 END),
              'bank_transfer', COUNT(CASE WHEN payment_method = 'bank_transfer' THEN 1 END),
              'ewallet', COUNT(CASE WHEN payment_method = 'ewallet' THEN 1 END)
            ) as payment_methods_json
          FROM payments p
          WHERE p.status = 'completed'
          GROUP BY p.course_id
          ORDER BY total_revenue DESC
          LIMIT 4
        ) top_courses
        JOIN courses c ON c.id = top_courses.course_id
      ) AS top_courses_data,
      (
        SELECT JSON_OBJECT(
          'total_transactions', COUNT(*),
          'payment_methods', JSON_OBJECT(
            'credit_card', COUNT(CASE WHEN payment_method = 'credit_card' THEN 1 END),
            'paypal', COUNT(CASE WHEN payment_method = 'paypal' THEN 1 END),
            'bank_transfer', COUNT(CASE WHEN payment_method = 'bank_transfer' THEN 1 END),
            'ewallet', COUNT(CASE WHEN payment_method = 'ewallet' THEN 1 END)
          ),
          'status_breakdown', JSON_OBJECT(
            'pending', COUNT(CASE WHEN status = 'pending' THEN 1 END),
            'completed', COUNT(CASE WHEN status = 'completed' THEN 1 END),
            'failed', COUNT(CASE WHEN status = 'failed' THEN 1 END),
            'refunded', COUNT(CASE WHEN status = 'refunded' THEN 1 END)
          )
        )
        FROM payments
      ) AS payment_stats
  `;

  try {
    const [results] = await pool.query(query);
    const {
      total_users,
      total_courses,
      total_certificates,
      total_revenue,
      monthly_data,
      top_courses_data,
      payment_stats,
    } = results[0];

    // Handle null values and provide defaults
    const monthlyStats = monthly_data || [];
    const topCourses = top_courses_data || [];
    const paymentStats = payment_stats || {
      total_transactions: 0,
      payment_methods: {
        credit_card: 0,
        paypal: 0,
        bank_transfer: 0,
        ewallet: 0,
      },
      status_breakdown: {
        pending: 0,
        completed: 0,
        failed: 0,
        refunded: 0,
      },
    };

    res.json({
      totals: {
        users: parseInt(total_users, 10) || 0,
        courses: parseInt(total_courses, 10) || 0,
        certificates: parseInt(total_certificates, 10) || 0,
        revenue: parseFloat(total_revenue) || 0,
      },
      monthlyData: monthlyStats,
      topCourses: topCourses,
      paymentStats: {
        totalTransactions: paymentStats.total_transactions,
        paymentMethods: paymentStats.payment_methods,
        statusBreakdown: paymentStats.status_breakdown,
      },
    });
  } catch (err) {
    console.error("Dashboard data error:", err);
    res.status(500).json({ error: "Error querying the database" });
  }
};
module.exports = {
  getDashboardData,
};
