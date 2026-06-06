import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldAlert, KeyRound, HelpCircle, CheckCircle } from "lucide-react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { verifyAdminCredentials, generateAdminJwt } from "../services/api";
import { auth } from "../config/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import styles from "./AdminLogin.module.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  // State values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Firebase auth confirmation object
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Phase Control
  const [isVerified, setIsVerified] = useState(false);
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
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
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

  // Field validation helper
  const validateInitialForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
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

  // Step 1: Login & verify credentials on Backend + Send OTP
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateInitialForm()) return;

    setLoading(true);
    setErrors({});
    setSuccessMsg("");

    try {
      // 1. Verify credentials with the backend
      const response = await verifyAdminCredentials(email, password);
      
      const adminPhone = response.phoneNumber;
      if (!adminPhone) {
        throw new Error("No phone number registered for this admin account");
      }

      // 2. Setup ReCAPTCHA
      initRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      // 3. Format to E.164 (e.g. +91 for India)
      const formattedPhone = adminPhone.startsWith("+") ? adminPhone : `+91${adminPhone}`;

      // 4. Trigger Firebase SMS OTP
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      setConfirmationResult(confirmation);
      setIsVerified(true);
      setSuccessMsg(`Credentials Verified. OTP sent to +91 ******${adminPhone.slice(-4)}`);
    } catch (err) {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      setErrors({ global: err.message || "Invalid credentials. Ensure they are correct." });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP verify with Firebase and request Backend JWT
  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      setErrors({ otp: "OTP code is required" });
      return;
    } else if (otp.length !== 6) {
      setErrors({ otp: "OTP must be exactly 6 digits" });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      // 1. Verify OTP via Firebase
      await confirmationResult.confirm(otp);

      // 2. Request custom backend JWT
      const tokenResponse = await generateAdminJwt(email);

      // Store token in localStorage
      localStorage.setItem("token", tokenResponse.token);
      localStorage.setItem("admin", JSON.stringify(tokenResponse.admin));

      setSuccessMsg("Identity verified and token generated successfully!");
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      setErrors({ otp: err.message || "Incorrect or expired verification code. Please try again." });
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
            <ShieldAlert size={14} />
            <span>Authorized Officials Only</span>
          </div>
          <h2 className={styles.title}>Official Login</h2>
          <p className={styles.subtitle}>
            Administrative access portal for Civic Issue Resolving Officers & Staff.
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

        <form className={styles.form} onSubmit={isVerified ? handleOtpSubmit : handleLoginSubmit}>
          {/* Email Input */}
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="officer@domain.gov.in"
            error={errors.email}
            icon={Mail}
            required={true}
            disabled={isVerified || loading}
          />

          {/* Password Input */}
          <InputField
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            error={errors.password}
            icon={Lock}
            required={true}
            disabled={isVerified || loading}
          />

          {/* Conditional OTP Input */}
          {isVerified && (
            <div className={styles.otpSection}>
              <InputField
                label="Enter 6-Digit Admin OTP"
                type="text"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="6-digit verification code"
                error={errors.otp}
                icon={KeyRound}
                required={true}
                maxLength={6}
                disabled={loading}
              />
            </div>
          )}

          {/* Action Button */}
          <div className={styles.actionSection}>
            {!isVerified ? (
              <Button type="submit" variant="primary" loading={loading}>
                Verify Credentials
              </Button>
            ) : (
              <div className={styles.otpActions}>
                <Button type="submit" variant="primary" loading={loading}>
                  Verify OTP & Login
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsVerified(false);
                    setSuccessMsg("");
                    setOtp("");
                  }}
                  disabled={loading}
                >
                  Change Credentials
                </Button>
              </div>
            )}
          </div>
        </form>

        <div className={styles.securityBanner}>
          <strong>Security Warning:</strong> Unauthorized access to this system is prohibited by cyber law and subject to prosecution.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
