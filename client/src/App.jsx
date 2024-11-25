import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Page/Login/Login";
import Register from "./Page/Login/Register";
import ForgotPassword from "./Page/Login/ForgotPassword";
import HomePage from "./Page/Home/HomePage";
import AdminDashboard from "../../server/src/Admin/AdminDashboard";
import User from "./components/User";
import UserInfo from "./Page/UserInfo/UserInfo";
import ChangePassword from "./Page/ChangePassword/ChangePassword";
import MyCourses from "./Page/MyCourses/MyCourses";
import AccountSettings from "./Page/AccountSettings/AccountSettings";
import CourseDetail from "./Page/CourseDetail/CourseDetail";
import PropTypes from "prop-types";
import PaymentPage from "./Page/PaymentPage/PaymentPage ";
import CertificatesPage from "./Page/CertificatesPage/CertificatesPage";
import BlogPage from "./Page/BlogPage/BlogPage";
import Introduce from "./Page/Introduce/Introduce";
import CertificateNotification from "./Page/CertificatesPage/CertificateNotification";
import MyCoupons from "./components/Coupon/MyCouponsPage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// Wrapper component để chứa CertificateNotification và children
const NotificationWrapper = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      {user && <CertificateNotification />}{" "}
      {/* Chỉ hiển thị khi có user đăng nhập */}
      {children}
    </>
  );
};

NotificationWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

const App = () => {
  return (
    <Router>
      <NotificationWrapper>
        <div className="app">
          <Routes>
            <Route path="/" element={<User />}>
              <Route index element={<Introduce />} />
              <Route path="allcourses" element={<HomePage />} />
              <Route path="user-info" element={<UserInfo />} />
              <Route path="payment/:id" element={<PaymentPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="account-settings" element={<AccountSettings />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="/blogpage" element={<BlogPage />} />
              <Route path="/MyCoupons" element={<MyCoupons />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </NotificationWrapper>
    </Router>
  );
};

export default App;
