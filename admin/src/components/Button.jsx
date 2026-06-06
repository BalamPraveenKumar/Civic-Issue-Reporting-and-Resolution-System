import React from "react";
import styles from "./Button.module.css";

const Button = ({
  children,
  type = "button",
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles.button} ${styles[variant]} ${className}`}
    >
      {loading ? (
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner}></div>
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
