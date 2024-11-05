import { useState, useEffect } from "react";
import "./Header.scss";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import avatar from "../../assets/img/avarta.png";
// import axios from "axios"; // Sử dụng axios để gửi yêu cầu API
import CourseSearch from "./Search.jsx";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // Điều hướng về trang chủ khi click vào logo
  const handleLogoClick = () => {
    console.log("Navigating to home");
    navigate("/");
  };

  // // Xử lý khi người dùng thay đổi từ khóa tìm kiếm
  // const handleSearchChange = (e) => {
  //   setSearchQuery(e.target.value);
  // };

  // // Xử lý tìm kiếm khi người dùng nhấn Enter hoặc bấm nút tìm kiếm
  // const handleSearchSubmit = async (e) => {
  //   if (e.key === "Enter" || e.type === "click") {
  //     if (searchQuery.trim() !== "") {
  //       try {
  //         // Gửi yêu cầu tìm kiếm tới API
  //         const response = await axios.get(`/api/courses/search`, {
  //           params: { query: searchQuery },
  //         });

  //         // Điều hướng tới trang kết quả tìm kiếm và truyền dữ liệu tìm kiếm qua
  //         navigate("/search", { state: { results: response.data } });
  //       } catch (error) {
  //         console.error("Lỗi khi tìm kiếm khóa học:", error);
  //       }
  //     }
  //   }
  // };

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
              <button style={{ backgroundColor: '#4caf50', borderColor: '#4caf50' }} className="btn btn--outline">Đăng ký</button>
            </NavLink>
            <NavLink to="/login">
              <button style={{ backgroundColor: '#4caf50', borderColor: '#4caf50' }} className="btn btn--primary">Đăng nhập</button>
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
