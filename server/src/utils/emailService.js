const nodemailer = require("nodemailer");

exports.sendPasswordResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `http://localhost:5173/forgot-password?token=${token}`;
  const message = `
    <p>Xin chào,</p>
    <p>Nhấn vào liên kết sau để đặt lại mật khẩu của bạn:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Đặt lại mật khẩu",
    html: message,
  });
};
