import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Landmark, 
  Users, 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  Megaphone, 
  BarChart3, 
  HelpCircle, 
  User 
} from "lucide-react";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname.includes("/admin");

  // Fetch authentication status
  const token = localStorage.getItem("token");
  const adminData = localStorage.getItem("admin") ? JSON.parse(localStorage.getItem("admin")) : null;
  const userData = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const userDisplayName = adminData ? adminData.name : (userData ? userData.name : "");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("user");
    
    // Redirect to appropriate login page
    if (isAdminPath || adminData) {
      navigate("/admin/login");
    } else {
      navigate("/user/login");
    }
  };

  const isCitizen = token && userData && !isAdminPath;

  return (
    <header className={styles.header}>
      {/* Tricolor top strip */}
      <div className={styles.tricolorStrip}>
        <div className={styles.saffron}></div>
        <div className={styles.white}></div>
        <div className={styles.green}></div>
      </div>

      <div className={styles.navContainer}>
        {/* Government Branding logo/title */}
        <div className={styles.logoSection}>
          <div className={styles.emblemIcon}>
            <Landmark size={28} className={styles.emblemSymbol} />
          </div>
          <div className={styles.brandingText}>
            <span className={styles.govText}>GOVERNMENT OF INDIA</span>
            <h1 className={styles.appTitle}>Civic Issue Reporting & Resolution Portal</h1>
          </div>
        </div>

        {/* Dynamic Portal Navigation / Logout actions */}
        <nav className={styles.navLinks}>
          {isCitizen ? (
            <>
              <Link
                to="/user/dashboard"
                className={`${styles.navLink} ${location.pathname === "/user/dashboard" ? styles.activeLink : ""}`}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/user/feed"
                className={`${styles.navLink} ${location.pathname === "/user/feed" ? styles.activeLink : ""}`}
              >
                <Megaphone size={15} />
                <span>Public Feed</span>
              </Link>
              <Link
                to="/user/analytics"
                className={`${styles.navLink} ${location.pathname === "/user/analytics" ? styles.activeLink : ""}`}
              >
                <BarChart3 size={15} />
                <span>District Stats</span>
              </Link>
              <Link
                to="/user/help"
                className={`${styles.navLink} ${location.pathname === "/user/help" ? styles.activeLink : ""}`}
              >
                <HelpCircle size={15} />
                <span>Helpdesk</span>
              </Link>
              <Link
                to="/user/profile"
                className={`${styles.navLink} ${location.pathname === "/user/profile" ? styles.activeLink : ""}`}
              >
                <User size={15} />
                <span>Profile</span>
              </Link>
              
              <button onClick={handleLogout} className={styles.logoutBtn} style={{ marginLeft: "8px" }}>
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : token ? (
            <>
              <span className={styles.userBadge}>
                Welcome, {userDisplayName || "Official"}
              </span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/user/login"
                className={`${styles.navLink} ${!isAdminPath ? styles.activeLink : ""}`}
              >
                <Users size={16} />
                <span>Citizen Portal</span>
              </Link>
              <Link
                to="/admin/login"
                className={`${styles.navLink} ${isAdminPath ? styles.activeLink : ""}`}
              >
                <ShieldCheck size={16} />
                <span>Official Login</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
