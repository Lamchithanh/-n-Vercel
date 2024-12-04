import React, { useEffect } from "react";
import { Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInButton"),
          { theme: "outline", size: "large", text: "signin_with" }
        );
      };
    };

    loadGoogleScript();

    return () => {
      // Optional: Clean up script if needed
      const script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (script) script.remove();
    };
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store user and token in localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        toast.success(`Chào mừng ${data.user.username || "bạn"}!`);

        // Navigate based on role
        if (data.user.role === "instructor") {
          navigate("/instructor");
        } else if (data.user.role === "student") {
          navigate("/");
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.error || "Đăng nhập Google thất bại");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("Có lỗi xảy ra khi đăng nhập");
    }
  };

  return (
    <div
      className="google-login-container"
      style={{ marginTop: "20px", textAlign: "center" }}
    >
      <div id="googleSignInButton"></div>
    </div>
  );
};

export default GoogleLoginButton;
