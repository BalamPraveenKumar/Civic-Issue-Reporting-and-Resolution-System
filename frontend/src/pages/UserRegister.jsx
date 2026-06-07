import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserCheck, Phone, Map, ShieldCheck, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { createCitizenAccount } from "../services/api";
import styles from "./UserRegister.module.css";

const DISTRICT_OPTIONS = [
  { value: "ASR001", label: "Alluri Sitharama Raju (ASR001)" },
  { value: "AKP001", label: "Anakapalli (AKP001)" },
  { value: "ATP001", label: "Anantapuramu (ATP001)" },
  { value: "ANM001", label: "Annamayya (ANM001)" },
  { value: "BPT001", label: "Bapatla (BPT001)" },
  { value: "CTR001", label: "Chittoor (CTR001)" },
  { value: "KSM001", label: "Dr. B. R. Ambedkar Konaseema (KSM001)" },
  { value: "EG001", label: "East Godavari (EG001)" },
  { value: "ELR001", label: "Eluru (ELR001)" },
  { value: "GNT001", label: "Guntur (GNT001)" },
  { value: "KKD001", label: "Kakinada (KKD001)" },
  { value: "KRS001", label: "Krishna (KRS001)" },
  { value: "KNL001", label: "Kurnool (KNL001)" },
  { value: "NDL001", label: "Nandyal (NDL001)" },
  { value: "NTR001", label: "NTR (NTR001)" },
  { value: "PLD001", label: "Palnadu (PLD001)" },
  { value: "PMY001", label: "Parvathipuram Manyam (PMY001)" },
  { value: "PKM001", label: "Prakasam (PKM001)" },
  { value: "NLP001", label: "Sri Potti Sriramulu Nellore (NLP001)" },
  { value: "SSS001", label: "Sri Sathya Sai (SSS001)" },
  { value: "SKM001", label: "Srikakulam (SKM001)" },
  { value: "TPT001", label: "Tirupati (TPT001)" },
  { value: "VSP001", label: "Visakhapatnam (VSP001)" },
  { value: "VZM001", label: "Vizianagaram (VZM001)" },
  { value: "WG001", label: "West Godavari (WG001)" },
  { value: "YSR001", label: "YSR Kadapa (YSR001)" }
];

const UserRegister = () => {
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [phone, setPhone] = useState("");
  const [districtId, setDistrictId] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});

  // Input Handlers
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleAadhaarChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // Digits only
    if (val.length <= 12) {
      setAadhaar(val);
      if (errors.aadhaar) {
        setErrors((prev) => ({ ...prev, aadhaar: "" }));
      }
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // Digits only
    if (val.length <= 10) {
      setPhone(val);
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  const handleDistrictChange = (e) => {
    setDistrictId(e.target.value);
    if (errors.districtId) {
      setErrors((prev) => ({ ...prev, districtId: "" }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!aadhaar) {
      newErrors.aadhaar = "Aadhaar number is required";
    } else if (aadhaar.length !== 12) {
      newErrors.aadhaar = "Aadhaar number must be exactly 12 digits";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!districtId) {
      newErrors.districtId = "Please select your district";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccessMsg("");

    try {
      await createCitizenAccount({
        name: name.trim(),
        aadhaarNumber: aadhaar,
        phoneNumber: phone,
        districtId,
      });

      setSuccessMsg("Citizen account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/user/login");
      }, 1800);
    } catch (err) {
      setErrors({ global: err.message || "Failed to create account. Please check details." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.registerCard}>
        {/* Flag decoration banner */}
        <div className={styles.cardHeaderDecoration}></div>
        
        <div className={styles.cardInfo}>
          <div className={styles.badge}>
            <ShieldCheck size={14} />
            <span>Secure Citizen Registration</span>
          </div>
          <h2 className={styles.title}>Create Citizen Account</h2>
          <p className={styles.subtitle}>
            Register your Aadhaar card and contact details with your district nodal jurisdiction.
          </p>
        </div>

        {errors.global && (
          <div className={styles.alertError}>
            <AlertCircle size={16} style={{ marginRight: 8, flexShrink: 0 }} />
            <span>{errors.global}</span>
          </div>
        )}

        {successMsg && (
          <div className={styles.alertSuccess}>
            <CheckCircle size={18} className={styles.successIcon} />
            <span>{successMsg}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Full Name Input */}
          <InputField
            label="Full Name"
            type="text"
            name="name"
            value={name}
            onChange={handleNameChange}
            placeholder="As written on your Aadhaar card"
            error={errors.name}
            icon={User}
            required={true}
            disabled={loading || !!successMsg}
          />

          {/* Aadhaar UID Input */}
          <InputField
            label="Aadhaar Number (UID)"
            type="text"
            name="aadhaar"
            value={aadhaar}
            onChange={handleAadhaarChange}
            placeholder="12-digit Aadhaar UID number"
            error={errors.aadhaar}
            icon={UserCheck}
            required={true}
            maxLength={12}
            disabled={loading || !!successMsg}
          />

          {/* Mobile Number Input */}
          <InputField
            label="Mobile Number"
            type="text"
            name="phone"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="10-digit primary mobile number"
            error={errors.phone}
            icon={Phone}
            required={true}
            maxLength={10}
            disabled={loading || !!successMsg}
          />

          {/* District Select Input */}
          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>
              District Jurisdiction <span className={styles.required}>*</span>
            </label>
            <div className={`${styles.selectWrapper} ${errors.districtId ? styles.selectWrapperError : ""} ${loading || successMsg ? styles.disabled : ""}`}>
              <Map className={styles.prefixIcon} size={20} />
              <select
                className={styles.select}
                value={districtId}
                onChange={handleDistrictChange}
                disabled={loading || !!successMsg}
                required
              >
                <option value="">Select your local district...</option>
                {DISTRICT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.districtId && <span className={styles.errorText}>{errors.districtId}</span>}
          </div>

          {/* Buttons */}
          <div className={styles.actionSection}>
            <Button type="submit" variant="primary" loading={loading} disabled={!!successMsg}>
              Register Citizen Profile
            </Button>
          </div>
        </form>

        <div className={styles.footerLinks}>
          <button 
            type="button" 
            className={styles.backBtn}
            onClick={() => navigate("/user/login")}
            disabled={loading}
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
