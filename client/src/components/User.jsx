import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import "./User.scss";
export default function User() {
  return (
    <>
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
