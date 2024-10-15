import React from "react";
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
import CourseDetail from "./Page/CourseDetail/CourseDetail"; // Nhập CourseDetail

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const App = () => {
    return (
        <Router>
            <div className="app">
                <ToastContainer />
                <Routes>
                    <Route path="/" element={<User />}>
                        <Route index element={<HomePage />} />
                        <Route path="user-info" element={<UserInfo />} />
                        <Route
                            path="change-password"
                            element={<ChangePassword />}
                        />
                        <Route path="my-courses" element={<MyCourses />} />
                        <Route
                            path="account-settings"
                            element={<AccountSettings />}
                        />
                        <Route path="courses/:id" element={<CourseDetail />} />{" "}
                        {/* Thêm route cho khóa học */}
                    </Route>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
