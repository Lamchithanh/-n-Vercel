import { useState, useEffect } from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import FirstLoginHandler from "../Page/Login/NewMemberWelcomeModal";
import "./User.scss";
import { API_URL } from "../../../server/src/config/config";
import axios from "axios";
import { useNavigate, Outlet } from "react-router-dom";

export default function User() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const handleUpdateFirstLogin = async () => {
    // Kiểm tra user và token trước khi gọi API
    if (!user || !token) {
      console.error("Missing user or token");
      return;
    }

    try {
      console.log("Attempting to update first login:", {
        userId: user.id,
        currentFirstLogin: user.is_first_login,
        token: token ? "Present" : "Missing",
      });

      const response = await axios.post(
        `${API_URL}/update-first-login`,
        {
          userId: user.id,
          // Thêm các trường khác nếu cần
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", response.data);

      // Kiểm tra chi tiết phản hồi
      if (response.data && response.data.success) {
        // Ưu tiên cập nhật từ dữ liệu server
        const updatedUser = response.data.user || {
          ...user,
          is_first_login: false,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        console.log("Updated user:", updatedUser);

        navigateBasedOnRole(updatedUser);
      } else {
        console.error("Update failed:", response.data);
      }
    } catch (error) {
      console.error("Error in update process:", {
        message: error.message,
        serverResponse: error.response?.data,
        status: error.response?.status,
      });
    }
  };
  // Thêm hàm navigateBasedOnRole vào User component
  const navigateBasedOnRole = (user) => {
    if (user.role === "instructor") {
      navigate("/instructor");
    } else if (user.role === "student") {
      navigate("/");
    } else {
      navigate("/");
    }
  };

  return (
    <>
      {user && user.is_first_login && token && (
        <FirstLoginHandler
          user={user}
          token={token}
          onUpdateFirstLogin={handleUpdateFirstLogin}
          setUser={setUser}
        />
      )}

      <div className="user-page-wrapper">
        <header className="user-header">
          <Header />
        </header>

        <main className="user-main">
          <Outlet />
        </main>

        <footer className="user-footer">
          <Footer />
        </footer>
      </div>
    </>
  );
}
