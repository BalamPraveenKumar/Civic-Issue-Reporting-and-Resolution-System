import React from "react";
import { Info, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import styles from "./NotificationPanel.module.css";

const NotificationPanel = ({ notifications, onMarkAsRead, onClearAll, onClose }) => {
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <div className={`${styles.iconContainer} ${styles.successIcon}`}>
            <CheckCircle2 size={16} />
          </div>
        );
      case "danger":
        return (
          <div className={`${styles.iconContainer} ${styles.dangerIcon}`}>
            <AlertTriangle size={16} />
          </div>
        );
      case "info":
      default:
        return (
          <div className={`${styles.iconContainer} ${styles.infoIcon}`}>
            <Info size={16} />
          </div>
        );
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>District Notifications</span>
        {notifications.length > 0 && (
          <button className={styles.clearBtn} onClick={onClearAll}>
            Clear All
          </button>
        )}
      </div>
      <ul className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>No new notifications. All clear!</div>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              className={`${styles.item} ${n.unread ? styles.unread : ""}`}
              onClick={() => onMarkAsRead(n.id)}
            >
              {getIcon(n.type)}
              <div className={styles.content}>
                <span className={styles.message}>{n.message}</span>
                <span className={styles.time}>{n.time}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationPanel;
