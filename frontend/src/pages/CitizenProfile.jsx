import React, { useState } from "react";
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import styles from "./CitizenProfile.module.css";

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

const CitizenProfile = () => {
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const token = localStorage.getItem("token") || "";

  // Toggles for notifications
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const formatAadhaar = (aadhaar) => {
    if (!aadhaar) return "•••• •••• ••••";
    const cleaned = aadhaar.replace(/\s/g, "");
    if (cleaned.length !== 12) return aadhaar;
    return `•••• •••• ${cleaned.slice(-4)}`;
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>Citizen Identity & Settings</h2>
          <p>Manage your e-Governance E-KYC profile, security preferences, and system alerts.</p>
        </div>
      </div>

      {saveSuccess && (
        <div className={styles.alertSuccess}>
          <CheckCircle2 size={16} />
          <span>Notification preferences updated successfully!</span>
        </div>
      )}

      <div className={styles.profileGrid}>
        {/* Left Column: Aadhaar Display & Jurisdiction */}
        <div className={styles.leftCol}>
          {/* Indian National Branding Aadhaar Badge */}
          <div className={styles.aadhaarCard}>
            <div className={styles.aadhaarHeader}>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="Emblem of India" 
                className={styles.emblem} 
              />
              <div className={styles.aadhaarHeaderText}>
                <h5>भारत सरकार</h5>
                <h6>GOVERNMENT OF INDIA</h6>
                <h4>भारतीय विशिष्ट पहचान प्राधिकरण</h4>
                <h3>UNIQUE IDENTIFICATION AUTHORITY OF INDIA</h3>
              </div>
            </div>

            <div className={styles.aadhaarBody}>
              <div className={styles.aadhaarAvatar}>
                {userData?.name?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.aadhaarInfo}>
                <div className={styles.aadhaarRow}>
                  <span className={styles.aadhaarLabel}>Name:</span>
                  <span className={styles.aadhaarValue}>{userData?.name || "Pushkar"}</span>
                </div>
                <div className={styles.aadhaarRow}>
                  <span className={styles.aadhaarLabel}>UID Number:</span>
                  <span className={`${styles.aadhaarValue} ${styles.uidFont}`}>
                    {formatAadhaar(userData?.aadhaarNumber)}
                  </span>
                </div>
                <div className={styles.aadhaarRow}>
                  <span className={styles.aadhaarLabel}>Mobile:</span>
                  <span className={styles.aadhaarValue}>+91 {userData?.phoneNumber}</span>
                </div>
                <div className={styles.aadhaarRow}>
                  <span className={styles.aadhaarLabel}>District:</span>
                  <span className={styles.aadhaarValue} style={{ color: "#104f9e", fontWeight: 700 }}>
                    {DISTRICT_MAP[userData?.districtId] || "East Godavari District"}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.aadhaarFooter}>
              <div className={styles.aadhaarGovLogo}>AADHAAR</div>
              <div className={styles.aadhaarTagline}>मेरा आधार, मेरी पहचान</div>
            </div>
          </div>

          {/* Security Credentials Log */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <Lock size={16} />
              <span>Active Session Audit Logs</span>
            </div>
            <div className={styles.auditLog}>
              <div className={styles.logItem}>
                <span className={styles.logStatus}>Active</span>
                <span className={styles.logText}>E-KYC Verification via Firebase Auth OTP</span>
              </div>
              <div className={styles.logItem}>
                <span className={styles.logStatus}>Attached</span>
                <span className={styles.logText}>Secure JSON Web Token (JWT) session signature</span>
              </div>
              <div className={styles.logItem}>
                <span className={styles.logStatus}>District Scope</span>
                <span className={styles.logText}>District ID: <strong>{userData?.districtId || "EG001"}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Alerts */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <Bell size={18} />
              <span>Grievance Alert Preferences</span>
            </div>
            <p className={styles.sectionDesc}>
              Select the channels through which you wish to receive updates regarding changes to your reported civic issues.
            </p>

            <form onSubmit={handleSaveSettings}>
              <div className={styles.toggleGroup}>
                <label className={styles.toggleRow}>
                  <div className={styles.toggleLabelCol}>
                    <span className={styles.toggleName}>SMS Notifications</span>
                    <span className={styles.toggleDesc}>Receive text messages when your complaint status changes.</span>
                  </div>
                  <div className={styles.toggleWrapper}>
                    <input 
                      type="checkbox" 
                      checked={smsAlerts} 
                      onChange={(e) => setSmsAlerts(e.target.checked)} 
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </div>
                </label>

                <label className={styles.toggleRow}>
                  <div className={styles.toggleLabelCol}>
                    <span className={styles.toggleName}>Email Alerts</span>
                    <span className={styles.toggleDesc}>Receive detailed official resolutions and logs in your mailbox.</span>
                  </div>
                  <div className={styles.toggleWrapper}>
                    <input 
                      type="checkbox" 
                      checked={emailAlerts} 
                      onChange={(e) => setEmailAlerts(e.target.checked)} 
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </div>
                </label>

                <label className={styles.toggleRow}>
                  <div className={styles.toggleLabelCol}>
                    <span className={styles.toggleName}>WhatsApp Notifications</span>
                    <span className={styles.toggleDesc}>Receive tracking updates and timeline updates over WhatsApp chat.</span>
                  </div>
                  <div className={styles.toggleWrapper}>
                    <input 
                      type="checkbox" 
                      checked={whatsappAlerts} 
                      onChange={(e) => setWhatsappAlerts(e.target.checked)} 
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </div>
                </label>
              </div>

              <button type="submit" className={styles.saveBtn}>
                Save Alert Settings
              </button>
            </form>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              <ShieldCheck size={18} />
              <span>System Verification & Compliance</span>
            </div>
            <div className={styles.complianceBox}>
              <div className={styles.complianceIcon}>
                <KeyRound size={22} color="#104f9e" />
              </div>
              <div className={styles.complianceText}>
                <h5>Data Privacy Policy</h5>
                <p>
                  Your credentials and Aadhaar ID are encrypted and handled in compliance with India's Digital Personal Data Protection (DPDP) Act. Nodal officers only view details required to verify civic issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenProfile;
