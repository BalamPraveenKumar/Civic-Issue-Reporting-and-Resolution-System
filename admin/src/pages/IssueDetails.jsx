import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Image as ImageIcon, 
  Video, 
  ShieldAlert, 
  History,
  CheckCircle,
  AlertTriangle,
  Play,
  X,
  ThumbsUp
} from "lucide-react";
import { useIssues } from "../hooks/useIssues";
import styles from "./IssueDetails.module.css";

const DISTRICT_MAP = {
  D001: "Central Metro District",
  D002: "Greater Coastal District",
  D003: "Valley Border District"
};

const getMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Normalize Windows system backslashes to forward slashes
  const normalizedPath = path.replace(/\\/g, "/");
  return `http://localhost:5000/${normalizedPath}`;
};

const IssueDetails = () => {
  const { id } = useParams();
  const [districtId, setDistrictId] = useState("D001");

  // Read districtId from token
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        setDistrictId(decoded.districtId || "D001");
      } catch (e) {
        console.error("Error decoding token", e);
      }
    }
  }, []);

  const { issues, loading, updateStatus } = useIssues(districtId);

  // Find target issue
  const issue = issues.find((i) => i._id === id);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  // Modal and Lightbox states
  const [showModal, setShowModal] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null); // { type, path }

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState("");

  // Populate local form fields on issue load
  useEffect(() => {
    if (issue) {
      setSelectedStatus(issue.status);
      setRemarks(issue.remarks || "");
    }
  }, [issue]);

  if (loading) {
    return <div className={styles.container}><div style={{ textAlign: "center", padding: "3rem" }}>Loading Grievance Details...</div></div>;
  }

  if (!issue) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <h2 style={{ color: "var(--danger-color)", marginBottom: "1rem" }}>Grievance Not Found</h2>
          <p style={{ marginBottom: "1.5rem" }}>The requested issue does not exist or you do not have permission to view it.</p>
          <Link to="/admin/issues" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Back to Grievances</span>
          </Link>
        </div>
      </div>
    );
  }

  // Priority chip style helper
  const getPriorityChipClass = (priority) => {
    switch (priority) {
      case "Low":
        return styles.chipLow;
      case "Medium":
        return styles.chipMedium;
      case "High":
        return styles.chipHigh;
      case "Critical":
        return styles.chipCritical;
      default:
        return "";
    }
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmUpdate = async () => {
    setShowModal(false);
    try {
      const response = await updateStatus(issue._id, selectedStatus, remarks);
      setToastMessage(response.message || "Grievance status updated successfully!");
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    } catch (err) {
      setToastMessage("Error: " + err.message);
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }
  };

  return (
    <div className={styles.container}>
      {/* Toast Banner Alert */}
      {toastMessage && (
        <div className={styles.toast}>
          <CheckCircle size={18} style={{ color: "var(--success-color)" }} />
          <span className={styles.toastText}>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>Confirm Status Change</div>
            <div className={styles.modalBody}>
              <p style={{ marginBottom: "0.5rem" }}>
                Are you sure you want to promote the status of this grievance from{" "}
                <strong style={{ color: "var(--primary-color)" }}>{issue.status}</strong> to{" "}
                <strong style={{ color: "var(--success-color)" }}>{selectedStatus}</strong>?
              </p>
              {remarks && (
                <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-color)", borderRadius: "6px", fontSize: "0.8rem", color: "var(--text-light)" }}>
                  <strong>Remarks:</strong> "{remarks}"
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className={styles.btnConfirm} onClick={handleConfirmUpdate}>
                Confirm & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxMedia && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxMedia(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxMedia(null)}>
            <X size={32} />
          </button>
          {lightboxMedia.type === "image" ? (
            <img src={getMediaUrl(lightboxMedia.path)} alt="Zoom Preview" className={styles.lightboxContent} onClick={(e) => e.stopPropagation()} />
          ) : (
            <video src={getMediaUrl(lightboxMedia.path)} controls autoPlay className={styles.lightboxContent} onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}

      {/* Top Controls Area */}
      <Link to="/admin/issues" className={styles.backBtn}>
        <ArrowLeft size={16} />
        <span>Back to Grievances</span>
      </Link>

      {/* Detail Split Layout */}
      <div className={styles.detailGrid}>
        {/* Left Hand Card Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Main info card */}
          <div className="card">
            <div className={styles.sectionTitle}>
              <FileText size={18} />
              <span>Grievance Summary Information</span>
            </div>

            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Grievance ID</span>
                <span className={`${styles.metaValue} ${styles.complaintNum}`} style={{ fontSize: "1rem" }}>{issue._id}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Citizen Endorsements</span>
                <span className={styles.metaValue} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ThumbsUp size={14} color="#104f9e" />
                  <strong>{issue.upvotes?.length || 0} Citizens Supported</strong>
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Priority Flag</span>
                <span className={styles.metaValue}>
                  <span className={`${styles.chip} ${getPriorityChipClass(issue.priority)}`} style={{ padding: "0.3rem 0.6rem" }}>
                    {issue.priority}
                  </span>
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Grievance Status</span>
                <span className={styles.metaValue}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary-color)" }}>{issue.status}</span>
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category</span>
                <span className={styles.metaValue}>{issue.category}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Created Date</span>
                <span className={styles.metaValue}>
                  {new Date(issue.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Last Updated</span>
                <span className={styles.metaValue}>
                  {new Date(issue.updatedAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <span className={styles.metaLabel}>Grievance Description</span>
              <p className={styles.descriptionBox}>{issue.description}</p>
            </div>
          </div>

          {/* Citizen information card */}
          <div className="card">
            <div className={styles.sectionTitle}>
              <User size={18} />
              <span>Citizen Filing Details</span>
            </div>
            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Citizen Name</span>
                <span className={styles.metaValue}>{issue.userId?.name || "Anonymous Resident"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Phone Number</span>
                <span className={styles.metaValue} style={{ fontFamily: "monospace" }}>{issue.userId?.phoneNumber || "Not Provided"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Assigned Jurisdiction</span>
                <span className={styles.metaValue}>{DISTRICT_MAP[issue.districtId] || `${issue.districtId} Administration`}</span>
              </div>
            </div>
          </div>

          {/* Uploaded media previews */}
          <div className="card">
            <div className={styles.sectionTitle}>
              <ImageIcon size={18} />
              <span>Evidence Uploads ({issue.media?.length || 0})</span>
            </div>
            {!issue.media || issue.media.length === 0 ? (
              <div style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>
                No attachments uploaded by the citizen for this grievance.
              </div>
            ) : (
              <div className={styles.mediaGrid}>
                {issue.media.map((med, index) => (
                  <div key={index} className={styles.mediaItem}>
                    {med.type === "image" ? (
                      <img
                        src={getMediaUrl(med.path)}
                        alt={`Evidence ${index + 1}`}
                        className={styles.mediaImg}
                        onClick={() => setLightboxMedia({ type: "image", path: med.path })}
                      />
                    ) : (
                      <div 
                        style={{ width: "100%", height: "100%", position: "relative", cursor: "pointer", display: "flex", alignItems: "center", justify: "center" }}
                        onClick={() => setLightboxMedia({ type: "video", path: med.path })}
                      >
                        <video src={getMediaUrl(med.path)} className={styles.mediaVid} muted />
                        <div className={styles.mediaIconOverlay}>
                          <Play size={16} fill="white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Hand Card Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Status Update Form */}
          <div className="card">
            <div className={styles.sectionTitle}>
              <ShieldAlert size={18} />
              <span>Resolve & Escalate Actions</span>
            </div>
            <form onSubmit={handleUpdateClick}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Promote Status</label>
                <select
                  className={styles.select}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="Pending">Pending Audit</option>
                  <option value="In Progress">Move to In-Progress</option>
                  <option value="Resolved">Mark as Resolved</option>
                  <option value="Rejected">Reject Grievance</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Action Remarks / Explanation</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Enter official resolution details or audit logs for the citizen to view..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                Update Grievance Status
              </button>
            </form>
          </div>

          {/* Action Log History */}
          <div className="card">
            <div className={styles.sectionTitle}>
              <History size={18} />
              <span>Audit logs & Timeline</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ borderLeft: "2px solid var(--border-color)", paddingLeft: "1rem", position: "relative" }}>
                <div style={{ position: "absolute", left: "-6px", top: "5px", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--primary-color)" }}></div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>Grievance Processed</div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-light)", marginTop: "0.2rem" }}>
                  Current State: <strong>{issue.status}</strong>
                </p>
                {issue.remarks && (
                  <p style={{ fontSize: "0.75rem", backgroundColor: "var(--bg-color)", padding: "0.4rem", borderRadius: "4px", marginTop: "0.25rem", color: "var(--text-dark)", borderLeft: "2px solid var(--primary-color)" }}>
                    "{issue.remarks}"
                  </p>
                )}
                <span style={{ fontSize: "0.65rem", color: "var(--text-light)", fontWeight: 500 }}>
                  Updated: {new Date(issue.updatedAt).toLocaleString("en-IN")}
                </span>
              </div>

              <div style={{ borderLeft: "2px solid var(--border-color)", paddingLeft: "1rem", position: "relative" }}>
                <div style={{ position: "absolute", left: "-6px", top: "5px", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--text-light)" }}></div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>Complaint Lodged</div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>Ticket registered via citizen portal.</p>
                <span style={{ fontSize: "0.65rem", color: "var(--text-light)", fontWeight: 500 }}>
                  Lodged: {new Date(issue.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
