import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  AlertCircle, 
  BarChart3, 
  FilePieChart, 
  User, 
  LogOut, 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  ChevronLeft, 
  Building2,
  ShieldCheck
} from "lucide-react";
import NotificationPanel from "../components/NotificationPanel";
import styles from "./AdminLayout.module.css";

const DISTRICT_MAP = {
  ASR001: "Alluri Sitharama Raju",
  AKP001: "Anakapalli",
  ATP001: "Anantapuramu",
  ANM001: "Annamayya",
  BPT001: "Bapatla",
  CTR001: "Chittoor",
  KSM001: "Dr. B. R. Ambedkar Konaseema",
  EG001: "East Godavari",
  ELR001: "Eluru",
  GNT001: "Guntur",
  KKD001: "Kakinada",
  KRS001: "Krishna",
  KNL001: "Kurnool",
  NDL001: "Nandyal",
  NTR001: "NTR",
  PLD001: "Palnadu",
  PMY001: "Parvathipuram Manyam",
  PKM001: "Prakasam",
  NLP001: "Sri Potti Sriramulu Nellore",
  SSS001: "Sri Sathya Sai",
  SKM001: "Srikakulam",
  TPT001: "Tirupati",
  VSP001: "Visakhapatnam",
  VZM001: "Vizianagaram",
  WG001: "West Godavari",
  YSR001: "YSR Kadapa"
};

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar collapsible state
  const [collapsed, setCollapsed] = useState(false);

  // Profile dropdown and Notification panel state
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Dark Mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("admin-theme") === "dark";
  });

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // State values for Admin
  const [adminName, setAdminName] = useState("Officer");
  const [districtName, setDistrictName] = useState("Collectorate");

  // Notifications list state
  const [notifications, setNotifications] = useState([
    { id: 1, type: "info", message: "New Road Damage complaint received (ISS-2026-005)", time: "Just now", unread: true },
    { id: 2, type: "success", message: "Water Leakage complaint (ISS-2026-003) resolved successfully", time: "1 hour ago", unread: true },
    { id: 3, type: "danger", message: "SLA Warning: Drainage issue (ISS-2026-004) approaching breach time", time: "3 hours ago", unread: true },
    { id: 4, type: "info", message: "System backup completed successfully", time: "1 day ago", unread: false }
  ]);

  // Auth protection check
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const adminStr = sessionStorage.getItem("admin");

    if (!token || !adminStr) {
      navigate("/admin/login");
      return;
    }

    try {
      const adminData = JSON.parse(adminStr);
      setAdminName(adminData.name || "Officer");

      // Extract districtId from token
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      const distId = decoded.districtId || "D001";
      setDistrictName(DISTRICT_MAP[distId] || `${distId} District`);
    } catch (e) {
      console.error("Error decoding token details", e);
    }
  }, [navigate]);

  // Handle theme toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("admin-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("admin-theme", "light");
    }
  }, [darkMode]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/admin/login");
  };

  // Notification panel helpers
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Nav menu lists
  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Issues Grid", path: "/admin/issues", icon: AlertCircle },
    { name: "Reports & Logs", path: "/admin/reports", icon: FilePieChart }
  ];

  return (
    <div className={styles.layoutContainer}>
      {/* Collapsible Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          {!collapsed ? (
            <div className={styles.brand}>
              <Building2 className={styles.brandIcon} size={22} />
              <span>Civic Issue Reporting System</span>
            </div>
          ) : (
            <Building2 className={styles.brandIcon} size={22} style={{ margin: "0 auto" }} />
          )}
          <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft size={18} style={{ transform: collapsed ? "rotate(180deg)" : "none" }} />
          </button>
        </div>

        <ul className={styles.menu}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`${styles.menuItem} ${isActive ? styles.activeMenuItem : ""}`}
                >
                  <Icon size={20} />
                  <span className={`${styles.menuText} ${collapsed ? styles.menuTextHidden : ""}`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span className={`${styles.menuText} ${collapsed ? styles.menuTextHidden : ""}`}>
              Log Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className={styles.mainContent}>
        {/* Flag Decoration Ribbon */}
        <div className="gov-ribbon"></div>

        {/* Top Navbar Header */}
        <nav className={styles.navbar}>
          <div className={styles.navbarLeft}>
            <div className={styles.titleArea}>
              <span className={styles.navTitle}>District Grievance Monitoring System</span>
              <span className={styles.navSubtitle}>
                State e-Governance Command & Control Center
              </span>
            </div>
          </div>

          <div className={styles.navbarRight}>
            {/* Dark Mode toggle */}
            <button
              className={styles.navIconBtn}
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification bell and panel */}
            <div className={styles.profileContainer} ref={notifRef}>
              <button
                className={styles.navIconBtn}
                onClick={() => setNotifOpen(!notifOpen)}
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
              </button>
              {notifOpen && (
                <NotificationPanel
                  notifications={notifications}
                  onMarkAsRead={markNotificationAsRead}
                  onClearAll={clearNotifications}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>

            {/* Profile Menu Section */}
            <div className={styles.profileContainer} ref={profileRef}>
              <button
                className={styles.profileMenuToggle}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className={styles.avatar}>
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.adminInfo}>
                  <span className={styles.adminName}>{adminName}</span>
                  <span className={styles.adminRole}>{districtName}</span>
                </div>
              </button>

              {profileOpen && (
                <div className={styles.dropdownMenu}>
                  <div style={{ padding: "0.6rem 1rem", fontSize: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-dark)" }}>Authorized Session</div>
                    <div style={{ color: "var(--text-light)", textOverflow: "ellipsis", overflow: "hidden" }}>District Admin</div>
                  </div>
                  <Link to="/admin/dashboard" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                    <User size={16} />
                    <span>My Dashboard</span>
                  </Link>
                  <div className={styles.divider}></div>
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={16} style={{ color: "var(--danger-color)" }} />
                    <span style={{ color: "var(--danger-color)" }}>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Dynamic page container */}
        <main className={styles.pageBody}>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
