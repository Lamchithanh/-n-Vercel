import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./ForgotPassword.scss"; // You'll need to create this file for styling

const ForgotPassword = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:9000/api/forgot-password",
                { email }
            );
            toast.success(
                "If an account with that email exists, we have sent password reset instructions."
            );
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className="container">
            <button className="btn-signin" onClick={() => navigate(-1)}>
                Quay lại
            </button>
            <form className="form-forgot-password" onSubmit={handleSubmit}>
                <h2>Forgot Password</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Reset Password</button>
                <p>
                    Remember your password? <a href="/">Log in</a>
                </p>
            </form>
        </div>
    );
};

export default ForgotPassword;
