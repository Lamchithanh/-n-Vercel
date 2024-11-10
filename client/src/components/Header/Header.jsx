import { useState, useEffect } from "react";
import "./Header.scss";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import avatar from "../../assets/img/avarta.png";
import CourseSearch from "./Search.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

    // Hiển thị thông báo thành công
    toast.success("Tạm biệt! Hẹn gặp lại ");

    // Chờ khoảng 1-1.5 giây trước khi điều hướng
    setTimeout(() => {
      navigate("/");
    }, 1500); // Thời gian chờ có thể thay đổi tuỳ theo tốc độ của bạn
  };

  const handleLogoClick = () => {
    if (user) {
      // Nếu người dùng đã đăng nhập và là admin, điều hướng đến trang điều khiển admin
      if (user.role === "admin") {
        navigate("/admin"); // Đảm bảo đường dẫn đúng với trang admin của bạn
      } else {
        // Nếu không phải admin, điều hướng đến trang thông tin cá nhân
        navigate("/user-info");
      }
    }
  };

  return (
    <header className="header">
      <NavLink className="header__logo" to="/">
        <span className="logo-icon">
          <img
            width="50"
            height="50"
            src="https://img.icons8.com/bubbles/50/classroom.png"
            alt="classroom"
          />
        </span>
        <span className="logo-text">Làm để qua đồ án</span>
      </NavLink>
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
      </div>{" "}
    </header>
  );
};

export default Header;
