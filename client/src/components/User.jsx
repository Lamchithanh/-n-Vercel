import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import "./User.scss";
export default function User() {
    return (
        <>
            <div className="header-container">
                <Header />
            </div>
            <div className="main-container">
                <Outlet />
            </div>
            <div className="footer">
                <Footer />
            </div>
        </>
    );
}
