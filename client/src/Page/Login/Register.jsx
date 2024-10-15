import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.scss"; // Bạn sẽ cần tạo file này để định kiểu
import "bootstrap";
import { register } from "../../../../server/src/api";

const Register = () => {
    const [username, setUsername] = useState(""); // Tên người dùng
    const [email, setEmail] = useState(""); // Địa chỉ email
    const [password, setPassword] = useState(""); // Mật khẩu
    const [confirmPassword, setConfirmPassword] = useState(""); // Xác nhận mật khẩu
    const [role, setRole] = useState("student"); // Giá trị mặc định cho vai trò
    const navigate = useNavigate(); // Để chuyển hướng

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }

        try {
            const response = await register({
                username,
                email,
                password,
                role,
            });
            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate("/login");
        } catch (error) {
            toast.error(
                error.response?.data?.error ||
                    "Đã xảy ra lỗi. Vui lòng thử lại."
            );
        }
    };

    return (
        <div className="container">
            <button className="btn-signin" onClick={() => navigate(-1)}>
                Quay lại
            </button>
            <form className="form-Register" onSubmit={handleSubmit}>
                <h2 className="title-Register">Tạo tài khoản</h2>
                <input
                    className="ip_user form-control"
                    type="text"
                    placeholder="Tên người dùng"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                >
                    <option value="student">1. Học viên</option>
                    <option value="instructor">2. Giảng viên</option>
                </select>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <div className="d-flex justify-content-center">
                    <button className="btn-Register" type="submit">
                        Đăng ký
                    </button>
                </div>
                <p>
                    Bạn đã có tài khoản? <a href="/">Đăng nhập</a>
                </p>
            </form>
        </div>
    );
};

export default Register;
