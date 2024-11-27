import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import FirstLoginHandler from "../Page/Login/NewMemberWelcomeModal";
import "./User.scss";
import { API_URL } from "../../../server/src/config/config";
import axios from "axios";

export default function User() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
  }, []);

  const handleUpdateFirstLogin = async () => {
    try {
      // Gọi API để cập nhật trạng thái first login trên server
      const response = await axios.post(
        `${API_URL}/update-first-login`,
        { userId: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Cập nhật trạng thái local
        const updatedUser = { ...user, is_first_login: false };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Lỗi cập nhật first login:", error);
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
