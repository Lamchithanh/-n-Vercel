import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import avatar from "../../assets/img/avarta.png";
import CourseSearch from "./Search.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Header.scss";
import logo from "../../assets/img/Logo.png";
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Tạm biệt! Hẹn gặp lại ");
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  const handleLogoClick = () => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user-info");
      }
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <NavLink className="header__logo" to="/">
        <span className="logo-icon">
          <img src={logo} alt="classroom" />
        </span>
        <span className="logo-text">QT Learning</span>
      </NavLink>

      <button className="menu-toggle" onClick={toggleMobileMenu}>
        <img
          width="24"
          height="24"
          src="https://img.icons8.com/material-outlined/24/menu.png"
          alt="menu"
        />
      </button>

      <div className="header__search">
        <CourseSearch />
      </div>

      <div className="header__actions">
        {user ? (
          <div className="user-menu">
            <button className="user-avatar" onClick={handleLogoClick}>
              <img
                src={user.avatarUrl || avatar}
                alt="User Avatar"
                className="avatar-img"
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
              <button className="btn btn--outline">Đăng ký</button>
            </NavLink>
            <NavLink to="/login">
              <button className="btn btn--primary">Đăng nhập</button>
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
