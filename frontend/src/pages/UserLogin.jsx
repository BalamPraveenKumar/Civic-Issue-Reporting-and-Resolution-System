import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Phone, ShieldCheck, KeyRound, HelpCircle, CheckCircle } from "lucide-react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { verifyCitizenCredentials, generateCitizenJwt } from "../services/api";
import { auth } from "../config/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import styles from "./UserLogin.module.css";

const UserLogin = () => {
  const navigate = useNavigate();

  // State values
  const [aadhaar, setAadhaar] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Firebase auth confirmation object
  const [confirmationResult, setConfirmationResult] = useState(null);

  // UI / Phase States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Validation Errors
  const [errors, setErrors] = useState({});

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Input Handlers
  const handleAadhaarChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // Allow only digits
    if (val.length <= 12) {
      setAadhaar(val);
      if (errors.aadhaar) {
        setErrors((prev) => ({ ...prev, aadhaar: "" }));
      }
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // Allow only digits
    if (val.length <= 10) {
      setPhone(val);
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 6) {
      setOtp(val);
      if (errors.otp) {
        setErrors((prev) => ({ ...prev, otp: "" }));
      }
    }
  };

  // Form Validation helper
  const validateInitialForm = () => {
    const newErrors = {};
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Initialize Firebase Invisible ReCAPTCHA
  const initRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
        }
      );
    } catch (err) {
      console.error("Error setting up reCAPTCHA verifier", err);
    }
  };

  // Step 1: Backend Credentials check + Send Firebase OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateInitialForm()) return;

    setLoading(true);
    setErrors({});
    setSuccessMsg("");

    try {
      // 1. Validate on actual backend
      const response = await verifyCitizenCredentials(aadhaar, phone);
      
      // If user exists, we use the registered phone number returned or entered phone
      const targetPhone = response.phoneNumber || phone;

      // 2. Setup ReCAPTCHA
      initRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      // 3. Format to E.164 (e.g., +91 for India)
      const formattedPhone = targetPhone.startsWith("+") ? targetPhone : `+91${targetPhone}`;

      // 4. Trigger Firebase SMS OTP
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
      setSuccessMsg(`OTP has been successfully sent to +91 ******${targetPhone.slice(-4)}`);
    } catch (err) {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      setErrors({ global: err.message || "Failed to initiate verification. Ensure details are correct." });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Firebase OTP and request Backend JWT
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setErrors({ otp: "OTP code is required" });
      return;
    } else if (otp.length !== 6) {
      setErrors({ otp: "OTP must be a 6-digit code" });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      // 1. Verify code with Firebase
      await confirmationResult.confirm(otp);
      
      // 2. Request custom backend JWT
      const tokenResponse = await generateCitizenJwt(phone);
      
      // Store token in localStorage
      localStorage.setItem("token", tokenResponse.token);
      localStorage.setItem("user", JSON.stringify(tokenResponse.user));

      setSuccessMsg("Identity verified and token generated successfully!");
      setTimeout(() => {
        navigate("/user/dashboard");
      }, 1000);
    } catch (err) {
      setErrors({ otp: err.message || "Invalid verification code. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.loginCard}>
        {/* Invisible container for Firebase reCAPTCHA */}
        <div id="recaptcha-container"></div>

        {/* Flag decoration banner */}
        <div className={styles.cardHeaderDecoration}></div>
        
        <div className={styles.cardInfo}>
          <div className={styles.badge}>
            <ShieldCheck size={14} />
            <span>Secure Digital Identity</span>
          </div>
          <h2 className={styles.title}>Citizen Authentication</h2>
          <p className={styles.subtitle}>
            Access the Civic Issue Resolution Portal using your registered Aadhaar identity.
          </p>
        </div>

        {errors.global && (
          <div className={styles.alertError}>
            <span>{errors.global}</span>
          </div>
        )}

        {successMsg && (
          <div className={styles.alertSuccess}>
            <CheckCircle size={18} className={styles.successIcon} />
            <span>{successMsg}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
          {/* Aadhaar Number Input */}
          <InputField
            label="Aadhaar Number (UID)"
            type="text"
            name="aadhaar"
            value={aadhaar}
            onChange={handleAadhaarChange}
            placeholder="12-digit UID number"
            error={errors.aadhaar}
            icon={UserCheck}
            required={true}
            maxLength={12}
            disabled={isOtpSent || loading}
          />

          {/* Phone Number Input */}
          <InputField
            label="Mobile Number"
            type="text"
            name="phone"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="10-digit registered mobile"
            error={errors.phone}
            icon={Phone}
            required={true}
            maxLength={10}
            disabled={isOtpSent || loading}
          />

          {/* Conditional OTP Input */}
          {isOtpSent && (
            <div className={styles.otpSection}>
              <InputField
                label="Enter 6-Digit OTP"
                type="text"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit code"
                error={errors.otp}
                icon={KeyRound}
                required={true}
                maxLength={6}
                disabled={loading}
              />
            </div>
          )}

          {/* Buttons */}
          <div className={styles.actionSection}>
            {!isOtpSent ? (
              <Button type="submit" variant="primary" loading={loading}>
                Send Verification OTP
              </Button>
            ) : (
              <div className={styles.otpActions}>
                <Button type="submit" variant="primary" loading={loading}>
                  Verify OTP & Proceed
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsOtpSent(false);
                    setSuccessMsg("");
                    setOtp("");
                  }}
                  disabled={loading}
                >
                  Edit Credentials
                </Button>
              </div>
            )}
          </div>
        </form>

        <div className={styles.footerLinks}>
          <a href="#" onClick={(e) => e.preventDefault()} className={styles.link}>
            <HelpCircle size={14} /> Need Help?
          </a>
          <span className={styles.divider}>•</span>
          <a href="#" onClick={(e) => e.preventDefault()} className={styles.link}>
            Privacy & Terms
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
