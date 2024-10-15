import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "../Login/Login.scss";
import "bootstrap";
import { login } from "../../../../server/src/api"; // Import hàm login từ api.js (đã điều chỉnh)

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // Hàm xử lý sự kiện khi người dùng gửi form
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            console.log("Sending login request..."); // Log trước khi gửi yêu cầu
            const response = await login(email, password);
            console.log("Response received:", response); // Log phản hồi từ API

            toast.success("Đăng nhập thành công!");

            localStorage.setItem("user", JSON.stringify(response.user));
            localStorage.setItem("token", response.token);

            if (response.user.role === "admin") {
                navigate("/admin");
            } else if (response.user.role === "instructor") {
                navigate("/instructor");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Login error:", error); // Log lỗi nếu xảy ra
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

            <form className="form-signin container" onSubmit={handleSubmit}>
                <p className="title-signin">Đăng nhập vào tài khoản của bạn</p>

                <input
                    className="ipemail"
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    className="ippassword"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button className="btn-signin" type="submit">
                    Đăng nhập
                </button>

                <p>
                    <Link to="/register">Tạo tài khoản mới</Link> |{" "}
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </p>
            </form>
            <ToastContainer />
        </div>
    );
};

export default Login;
