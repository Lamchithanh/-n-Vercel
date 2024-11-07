import { useState, useEffect } from "react";
import "./Header.scss";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import avatar from "../../assets/img/avarta.png";
import CourseSearch from "./Search.jsx";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, [location]);

  const handleLogout = () => {
    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleLogoClick = () => {
    console.log("Navigating to home");
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header__logo" onClick={handleLogoClick}>
        <span className="logo-icon">
          <img
            width="50"
            height="50"
            src="https://img.icons8.com/bubbles/50/classroom.png"
            alt="classroom"
          />
        </span>
        <span className="logo-text">Làm để qua đồ án</span>
      </div>

      <div className="header__search">
        <CourseSearch />
      </div>

      <div className="header__actions">
        {user ? (
          <div className="user-menu">
            <button className="user-avatar">
              <img
                src={user.avatarUrl || avatar}
                alt="User Avatar"
                className="avatar-img"
                style={{ width: "30px", borderRadius: "50%" }}
              />
              <span>{user.username}</span>
            </button>
            <button onClick={handleLogout} className="btn btn--logout">
              <img
                width="32"
                height="32"
                src="https://img.icons8.com/stencil/32/exit.png"
                alt="exit"
              />
            </button>
          </div>
        ) : (
          <>
            <NavLink to="/register">
              <button
                style={{
                  backgroundColor: "#4caf50",
                  borderColor: "#4caf50",
                  color: "#fff",
                }}
                className="btn btn--outline"
              >
                Đăng ký
              </button>
            </NavLink>
            <NavLink to="/login">
              <button
                style={{ backgroundColor: "#4caf50", borderColor: "#4caf50" }}
                className="btn btn--primary"
              >
                Đăng nhập
              </button>
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
