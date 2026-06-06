import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ClipboardList,
  LogOut,
  Plus,
  X,
  UploadCloud,
  FileVideo,
  MapPin,
  Calendar,
  RefreshCw,
  ChevronRight,
  Inbox,
  TrendingUp,
  User,
  ShieldCheck,
  Eye,
  Info,
  Droplet,
  Zap,
  Trash2,
  Shield,
  Lightbulb,
  Trees,
  Hammer,
  HelpCircle
} from "lucide-react";
import { fetchMyIssues, fetchDistrictIssues, submitCivicIssue } from "../services/api";
import styles from "./UserDashboard.module.css";

/* ------------------------------------------------------------------ */
/*  Constants & Maps                                                    */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  "Road Damage",
  "Water Supply",
  "Drainage",
  "Electricity",
  "Sanitation",
  "Public Safety",
  "Street Lighting",
  "Parks & Recreation",
  "Other",
];

const STATUS_FILTERS = ["All", "Pending", "In Progress", "Resolved", "Rejected"];

const BACKEND_URL = "http://localhost:5000";

const DISTRICT_MAP = {
  EG001: "East Godavari District",
  D001: "Central Metro District",
  D002: "Greater Coastal District",
  D003: "Valley Border District",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function getStatusClass(status) {
  switch (status) {
    case "Pending":     return styles.statusPending;
    case "In Progress": return styles.statusInProgress;
    case "Resolved":    return styles.statusResolved;
    case "Rejected":    return styles.statusRejected;
    default:            return styles.statusPending;
  }
}

function getAccentClass(status) {
  switch (status) {
    case "Pending":     return styles.accentPending;
    case "In Progress": return styles.accentInProgress;
    case "Resolved":    return styles.accentResolved;
    case "Rejected":    return styles.accentRejected;
    default:            return styles.accentPending;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const getMediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Normalize Windows system backslashes to forward slashes
  const normalizedPath = path.replace(/\\/g, "/");
  return `${BACKEND_URL}/${normalizedPath}`;
};

/* ------------------------------------------------------------------ */
/*  Category Icon Map Helper                                          */
/* ------------------------------------------------------------------ */
const getCategoryIcon = (category) => {
  switch (category) {
    case "Road Damage":       return <Hammer size={10} color="white" />;
    case "Water Supply":      return <Droplet size={10} color="white" />;
    case "Drainage":          return <Info size={10} color="white" />;
    case "Electricity":       return <Zap size={10} color="white" />;
    case "Sanitation":        return <Trash2 size={10} color="white" />;
    case "Public Safety":      return <Shield size={10} color="white" />;
    case "Street Lighting":   return <Lightbulb size={10} color="white" />;
    case "Parks & Recreation": return <Trees size={10} color="white" />;
    default:                  return <HelpCircle size={10} color="white" />;
  }
};

/* ------------------------------------------------------------------ */
/*  Interactive GIS Map Component                                     */
/* ------------------------------------------------------------------ */
const InteractiveGISMap = ({ districtId, issues, onSelectIssue }) => {
  const districtName = DISTRICT_MAP[districtId] || "Local District";
  const [mapScope, setMapScope] = useState("district"); // "district" or "my"
  const [mapStatusFilter, setMapStatusFilter] = useState("All");
  const [isScanning, setIsScanning] = useState(false);

  // Trigger scan animation on mount
  useEffect(() => {
    triggerScan();
  }, []);

  const triggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1800);
  };

  // Determine which issues to display on map
  const sourceIssues = mapScope === "district" ? (issues?.district || []) : (issues?.my || []);
  
  // Filter by status
  const visibleIssues = sourceIssues.filter(issue => {
    if (mapStatusFilter === "All") return true;
    return issue.status === mapStatusFilter;
  });

  // Simulated map coordinate points based on unique _id
  const getSimulatedCoordinates = (id, category, index) => {
    if (!id) {
      const seed = (category.length * (index + 1)) % 10;
      return {
        x: `${25 + (seed * 6)}%`,
        y: `${20 + (seed * 7)}%`
      };
    }
    let hashX = 0;
    let hashY = 0;
    for (let i = 0; i < id.length; i++) {
      const charCode = id.charCodeAt(i);
      if (i % 2 === 0) {
        hashX = (hashX + charCode) % 100;
      } else {
        hashY = (hashY + charCode) % 100;
      }
    }
    const x = 12 + (hashX % 76);
    const y = 15 + (hashY % 68);
    return { x: `${x}%`, y: `${y}%` };
  };

  // Status counts for visible set
  const pendingCount = visibleIssues.filter(i => i.status === "Pending").length;
  const progressCount = visibleIssues.filter(i => i.status === "In Progress").length;
  const resolvedCount = visibleIssues.filter(i => i.status === "Resolved").length;

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapHeader}>
        <div className={styles.mapHeaderLeft}>
          <span className={styles.mapLiveBadge}>
            <span className={styles.mapPulse}></span> Live GIS Feed
          </span>
          <h4>Jurisdiction Grievance Plotter ({districtName})</h4>
        </div>
        <div className={styles.mapControls}>
          <div className={styles.mapToggleGroup}>
            <button 
              type="button"
              className={`${styles.mapToggleBtn} ${mapScope === "district" ? styles.mapToggleActive : ""}`}
              onClick={() => { setMapScope("district"); triggerScan(); }}
            >
              District
            </button>
            <button 
              type="button"
              className={`${styles.mapToggleBtn} ${mapScope === "my" ? styles.mapToggleActive : ""}`}
              onClick={() => { setMapScope("my"); triggerScan(); }}
            >
              My Reports
            </button>
          </div>
          <button 
            type="button"
            className={`${styles.mapRefreshBtn} ${isScanning ? styles.mapRefreshing : ""}`}
            onClick={triggerScan}
            title="Refresh Scan"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Map Sub-Header with filters */}
      <div className={styles.mapSubHeader}>
        <div className={styles.mapFilterRow}>
          {["All", "Pending", "In Progress", "Resolved"].map(status => (
            <button
              key={status}
              type="button"
              className={`${styles.mapFilterTab} ${mapStatusFilter === status ? styles.mapFilterTabActive : ""}`}
              onClick={() => setMapStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className={styles.mapStatsSummary}>
          Showing {visibleIssues.length} issues
        </div>
      </div>

      <div className={styles.mapCanvas}>
        <div className={styles.mapGridOverlay}></div>
        
        {/* Radar Sweep Scanner Effect */}
        {isScanning && <div className={styles.mapRadarSweep}></div>}
        {isScanning && <div className={styles.mapScannerGridLine}></div>}
        
        <svg className={styles.mapVectorLines} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M10 20 Q 30 15, 50 35 T 90 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.8" />
          <path d="M30 90 L 50 50 L 70 10" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(16, 79, 158, 0.08)" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* Visible Issue pins */}
        {visibleIssues.map((issue, idx) => {
          const coords = getSimulatedCoordinates(issue._id, issue.category || "Other", idx);
          const statusColor = issue.status === "Resolved" 
            ? "#22c55e" 
            : issue.status === "In Progress" 
            ? "#3b82f6" 
            : issue.status === "Rejected" 
            ? "#ef4444" 
            : "#f97316"; 
            
          return (
            <div 
              key={issue._id || idx} 
              className={styles.mapPin}
              style={{ left: coords.x, top: coords.y }}
              onClick={() => onSelectIssue && onSelectIssue(issue)}
            >
              <div className={styles.mapPinPulse} style={{ backgroundColor: statusColor }}></div>
              <div className={styles.mapPinCore} style={{ backgroundColor: statusColor }}>
                {getCategoryIcon(issue.category)}
              </div>
              <div className={styles.mapPinTooltip}>
                <div className={styles.tooltipHeader}>
                  <strong>{issue.category || "General"}</strong>
                  <span className={styles.tooltipStatus} style={{ color: statusColor }}>{issue.status}</span>
                </div>
                <span className={styles.tooltipTitle}>{issue.title.slice(0, 28)}...</span>
                <span className={styles.tooltipClickHint}>Click to view case file</span>
              </div>
            </div>
          );
        })}
        
        {/* Map scale and information UI */}
        <div className={styles.mapInfoOverlay}>
          <div className={styles.mapScale}>Scale: 1 : 25,000</div>
          <div className={styles.mapStatsLegend}>
            <span className={styles.legendDot} style={{ backgroundColor: "#f97316" }}></span> {pendingCount} P
            <span className={styles.legendDot} style={{ backgroundColor: "#3b82f6" }}></span> {progressCount} IP
            <span className={styles.legendDot} style={{ backgroundColor: "#22c55e" }}></span> {resolvedCount} R
          </div>
          <div className={styles.mapGPS}>GPS: 16.9897° N, 82.2439° E</div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Issue Details Modal & Timeline Component                          */
/* ------------------------------------------------------------------ */
const IssueDetailsModal = ({ issue, onClose }) => {
  const [activeMedia, setActiveMedia] = useState(null); // { type, path }
  
  // Format timeline based on issue's date
  const timelineEvents = [
    {
      title: "Complaint Lodged",
      desc: "Grievance successfully registered on the portal.",
      date: formatDate(issue.createdAt),
      status: "completed",
    },
    {
      title: "Assigned & Under Review",
      desc: `Forwarded to ${DISTRICT_MAP[issue.districtId] || "District"} Nodal Officer for audit verification.`,
      date: issue.status !== "Pending" ? formatDate(issue.updatedAt || issue.createdAt) : "Pending...",
      status: issue.status !== "Pending" ? "completed" : "pending",
    },
    {
      title: "Resolution Actions",
      desc: issue.remarks || "Field inspection and restoration activities are being planned.",
      date: (issue.status === "Resolved" || issue.status === "Rejected") ? formatDate(issue.updatedAt) : "Awaiting Actions...",
      status: (issue.status === "Resolved" || issue.status === "Rejected") ? "completed" : issue.status === "In Progress" ? "active" : "pending",
    }
  ];

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Lightbox for media */}
      {activeMedia && (
        <div className={styles.lightbox} onClick={() => setActiveMedia(null)}>
          <button className={styles.lightboxClose} onClick={() => setActiveMedia(null)}>
            <X size={32} />
          </button>
          {activeMedia.type === "image" ? (
            <img 
              src={getMediaUrl(activeMedia.path)} 
              alt="Evidence Zoom" 
              className={styles.lightboxContent}
              onClick={(e) => e.stopPropagation()} 
            />
          ) : (
            <video 
              src={getMediaUrl(activeMedia.path)} 
              controls 
              autoPlay 
              className={styles.lightboxContent} 
              onClick={(e) => e.stopPropagation()} 
            />
          )}
        </div>
      )}

      <div className={`${styles.modal} ${styles.detailsModal}`} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderText}>
            <div className={styles.detailsModalBadge}>
              <span>Complaint ID: </span>
              <strong className={styles.detailsId}>{issue._id}</strong>
            </div>
            <h2>{issue.title}</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close details">
            <X size={18} />
          </button>
        </div>

        <div className={styles.detailsSplit}>
          {/* Left Column: Complaint Details */}
          <div className={styles.detailsInfoCol}>
            <div className={styles.detailsSection}>
              <h4>Grievance Metadata</h4>
              <div className={styles.detailsMetaGrid}>
                <div className={styles.detailsMetaItem}>
                  <span className={styles.detailsMetaLabel}>Category</span>
                  <span className={styles.detailsMetaVal}>{issue.category}</span>
                </div>
                <div className={styles.detailsMetaItem}>
                  <span className={styles.detailsMetaLabel}>Date Filed</span>
                  <span className={styles.detailsMetaVal}>{formatDate(issue.createdAt)}</span>
                </div>
                <div className={styles.detailsMetaItem}>
                  <span className={styles.detailsMetaLabel}>Status</span>
                  <span className={`${styles.statusBadge} ${getStatusClass(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>
                <div className={styles.detailsMetaItem}>
                  <span className={styles.detailsMetaLabel}>Jurisdiction</span>
                  <span className={styles.detailsMetaVal}>{DISTRICT_MAP[issue.districtId] || issue.districtId}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailsSection}>
              <h4>Description</h4>
              <p className={styles.detailsDescText}>{issue.description}</p>
            </div>

            <div className={styles.detailsSection}>
              <h4>Evidence Uploads ({issue.media?.length || 0})</h4>
              {!issue.media || issue.media.length === 0 ? (
                <p className={styles.detailsNoMediaText}>No supporting media attached to this ticket.</p>
              ) : (
                <div className={styles.detailsMediaGrid}>
                  {issue.media.map((m, idx) => (
                    <div 
                      key={idx} 
                      className={styles.detailsMediaItem}
                      onClick={() => setActiveMedia(m)}
                    >
                      {m.type === "image" ? (
                        <img 
                          src={getMediaUrl(m.path)} 
                          alt={`Evidence ${idx + 1}`} 
                          className={styles.detailsMediaImg}
                          onError={(e) => { e.target.src = "https://placehold.co/150?text=Error+Loading"; }}
                        />
                      ) : (
                        <div className={styles.detailsMediaVid}>
                          <FileVideo size={24} />
                          <span>Video File</span>
                        </div>
                      )}
                      <div className={styles.detailsMediaHover}>
                        <Eye size={16} />
                        <span>View</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timeline & Official Remarks */}
          <div className={styles.detailsTimelineCol}>
            <div className={styles.detailsSection}>
              <h4>Audit Status Timeline</h4>
              <div className={styles.timelineContainer}>
                {timelineEvents.map((event, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.timelineStep} ${
                      event.status === "completed" ? styles.stepCompleted : 
                      event.status === "active" ? styles.stepActive : styles.stepPending
                    }`}
                  >
                    <div className={styles.timelineIndicator}>
                      <div className={styles.timelineDot}></div>
                    </div>
                    <div className={styles.timelineContentBox}>
                      <div className={styles.timelineTitleRow}>
                        <h5>{event.title}</h5>
                        <span className={styles.timelineDate}>{event.date}</span>
                      </div>
                      <p>{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.detailsSection}>
              <h4>Official District Remarks</h4>
              <div className={styles.remarksBox}>
                {issue.remarks && issue.remarks.trim() ? (
                  <p className={styles.remarksText}>"{issue.remarks}"</p>
                ) : (
                  <p className={styles.remarksPendingText}>
                    <Info size={14} /> Awaiting audit review and update from the Nodal Officer of {DISTRICT_MAP[issue.districtId] || "the district"}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Close details
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Report Modal Component                                              */
/* ------------------------------------------------------------------ */
const ReportModal = ({ onClose, onSuccess }) => {
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [category, setCategory]     = useState("");
  const [files, setFiles]           = useState([]);
  const [previews, setPreviews]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef                = useRef(null);

  /* Build object-URL previews whenever files change */
  useEffect(() => {
    const urls = files.map((f) => ({
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith("video"),
      name: f.name,
    }));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
  }, [files]);

  const handleAddFiles = (newFiles) => {
    const combined = [...files, ...Array.from(newFiles)].slice(0, 5);
    setFiles(combined);
  };

  const handleRemoveFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const err = {};
    if (!title.trim())       err.title       = "Title is required";
    if (!description.trim()) err.description = "Description is required";
    if (!category)           err.category    = "Please select a category";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      files.forEach((f) => formData.append("media", f));

      await submitCivicIssue(formData);

      setSuccessMsg("Issue reported successfully! It has been forwarded to your district authority.");
      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit the issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Drag & Drop handlers */
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleAddFiles(e.dataTransfer.files);
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderText}>
            <h2 id="modal-title">Report a Civic Issue</h2>
            <p>Submit a complaint to your district authority for prompt resolution.</p>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className={`${styles.modalAlert} ${styles.modalAlertSuccess}`}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className={`${styles.modalAlert} ${styles.modalAlertError}`}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="issue-title">
                Issue Title <span>*</span>
              </label>
              <input
                id="issue-title"
                className={`${styles.formInput} ${errors.title ? styles.hasError : ""}`}
                type="text"
                placeholder="e.g. Pothole on Main Road near Bus Stop"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                maxLength={120}
                disabled={loading || !!successMsg}
              />
              {errors.title && <span className={styles.formError}><AlertCircle size={12} />{errors.title}</span>}
            </div>

            {/* Category */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="issue-category">
                Category <span>*</span>
              </label>
              <select
                id="issue-category"
                className={`${styles.formSelect} ${errors.category ? styles.hasError : ""}`}
                value={category}
                onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: "" })); }}
                disabled={loading || !!successMsg}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <span className={styles.formError}><AlertCircle size={12} />{errors.category}</span>}
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="issue-description">
                Description <span>*</span>
              </label>
              <textarea
                id="issue-description"
                className={`${styles.formTextarea} ${errors.description ? styles.hasError : ""}`}
                placeholder="Describe the issue in detail — location, severity, how long it has persisted, etc."
                value={description}
                onChange={(e) => { setDesc(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
                rows={4}
                disabled={loading || !!successMsg}
              />
              {errors.description && (
                <span className={styles.formError}><AlertCircle size={12} />{errors.description}</span>
              )}
            </div>

            {/* Media Upload */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Supporting Media <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional, up to 5 files)</span>
              </label>
              <div
                className={`${styles.uploadZone} ${isDragging ? styles.uploadZoneActive : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !loading && !successMsg && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => handleAddFiles(e.target.files)}
                  disabled={loading || !!successMsg}
                />
                <UploadCloud size={32} color="#94a3b8" />
                <p className={styles.uploadZoneText}>
                  <strong>Click to upload</strong> or drag & drop files here
                </p>
                <p className={styles.uploadZoneHint}>Images & videos accepted • Max 5 files</p>
              </div>

              {/* Preview Strip */}
              {previews.length > 0 && (
                <div className={styles.previewStrip}>
                  {previews.map((p, idx) => (
                    <div key={idx} className={styles.previewItem}>
                      {p.isVideo ? (
                        <div className={styles.previewVideo} title={p.name}>
                          <FileVideo size={22} />
                        </div>
                      ) : (
                        <img src={p.url} alt={p.name} className={styles.previewImg} />
                      )}
                      <button
                        type="button"
                        className={styles.previewRemove}
                        onClick={() => handleRemoveFile(idx)}
                        disabled={loading}
                        aria-label="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className={styles.modalFooter}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !!successMsg}
            >
              {loading ? (
                <><span className={styles.spinner} style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting...</>
              ) : (
                <><Plus size={16} /> Submit Issue</>
              )}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Issue Card Component                                                */
/* ------------------------------------------------------------------ */
const IssueCard = ({ issue, onClick }) => {
  const hasMedia   = issue.media && issue.media.length > 0;
  const hasRemarks = issue.remarks && issue.remarks.trim().length > 0;

  return (
    <div className={styles.issueCard} onClick={onClick}>
      <div className={`${styles.cardAccent} ${getAccentClass(issue.status)}`} />
      <div className={styles.cardBody}>
        {/* Top meta row */}
        <div className={styles.cardMeta}>
          <span className={styles.categoryTag}>
            <MapPin size={11} />
            {issue.category || "General"}
          </span>
          <span className={`${styles.statusBadge} ${getStatusClass(issue.status)}`}>
            {issue.status}
          </span>
        </div>

        {/* Title */}
        <h3 className={styles.cardTitle}>{issue.title}</h3>

        {/* Description */}
        <p className={styles.cardDescription}>{issue.description}</p>

        {/* Admin Remarks */}
        {hasRemarks && (
          <div className={styles.cardRemarks}>
            <span className={styles.cardRemarksLabel}>Official Remarks:</span>
            {issue.remarks}
          </div>
        )}

        {/* Media thumbnails */}
        {hasMedia && (
          <div className={styles.cardMedia}>
            {issue.media.slice(0, 4).map((m, idx) =>
              m.type === "image" ? (
                <img
                  key={idx}
                  src={getMediaUrl(m.path)}
                  alt="Issue media"
                  className={styles.mediaThumbnail}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <div key={idx} className={styles.mediaVideoIcon} title="Video file">
                  <FileVideo size={20} />
                </div>
              )
            )}
            {issue.media.length > 4 && (
              <div className={styles.mediaVideoIcon} style={{ background: "#475569", fontSize: 12, fontWeight: 600 }}>
                +{issue.media.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>
          <Calendar size={12} />
          {formatDate(issue.createdAt)}
        </span>
        <span className={styles.viewDetailsText}>
          View Details <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main UserDashboard Page Component                                   */
/* ------------------------------------------------------------------ */
const UserDashboard = () => {
  const navigate = useNavigate();

  /* --- Auth --- */
  const userData    = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const citizenName = userData?.name || "Citizen";

  /* --- State --- */
  const [issues, setIssues]                 = useState([]);
  const [districtIssues, setDistrictIssues] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [loadError, setLoadError]           = useState("");
  const [activeFilter, setFilter]           = useState("All");
  const [modalOpen, setModalOpen]           = useState(false);
  const [selectedIssue, setSelectedIssue]   = useState(null);

  /* --- Load issues --- */
  const loadIssues = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [myIssuesRes, districtIssuesRes] = await Promise.allSettled([
        fetchMyIssues(),
        fetchDistrictIssues()
      ]);

      if (myIssuesRes.status === "fulfilled") {
        setIssues(myIssuesRes.value.issues || []);
      } else {
        const err = myIssuesRes.reason;
        if (err.message?.includes("expired") || err.message?.includes("token")) {
          localStorage.clear();
          navigate("/user/login");
          return;
        }
        throw err;
      }

      if (districtIssuesRes.status === "fulfilled") {
        setDistrictIssues(districtIssuesRes.value.issues || []);
      } else {
        console.error("Failed to fetch district issues:", districtIssuesRes.reason);
      }
    } catch (err) {
      setLoadError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/user/login"); return; }
    loadIssues();
  }, [loadIssues, navigate]);

  /* --- Stats --- */
  const total      = issues.length;
  const pending    = issues.filter((i) => i.status === "Pending").length;
  const inProgress = issues.filter((i) => i.status === "In Progress").length;
  const resolved   = issues.filter((i) => i.status === "Resolved").length;

  /* --- Filtered list --- */
  const filtered = activeFilter === "All"
    ? issues
    : issues.filter((i) => i.status === activeFilter);

  /* --- Logout --- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/user/login");
  };

  /* --- Modal success callback --- */
  const handleReportSuccess = () => {
    setModalOpen(false);
    loadIssues();
  };

  return (
    <div className={styles.page}>
      {/* ── Hero Header ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <ClipboardList size={12} />
              Civic Issue Reporting Portal
            </div>
            <h1>Welcome back, {citizenName}</h1>
            <p>Track your reported issues and submit new complaints to your district authority.</p>
          </div>
          <div className={styles.heroActions}>
            <button id="open-report-modal" className={styles.reportBtn} onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Report an Issue
            </button>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconTotal}`}>
            <ClipboardList size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{total}</span>
            <span className={styles.statLabel}>Total Issues</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconPending}`}>
            <Clock size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconProgress}`}>
            <TrendingUp size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{inProgress}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconResolved}`}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resolved}</span>
            <span className={styles.statLabel}>Resolved</span>
          </div>
        </div>
      </div>

      {/* ── Citizen Identity & GIS Map Section ── */}
      <div className={styles.identitySection}>
        <InteractiveGISMap 
          districtId={userData?.districtId} 
          issues={{ my: issues, district: districtIssues }} 
          onSelectIssue={setSelectedIssue}
        />
      </div>

      {/* ── Issues Content ── */}
      <div className={styles.content}>
        {/* Section header + filters */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <Inbox size={20} />
            My Complaints
            <span className={styles.sectionCount}>{filtered.length}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className={styles.filterRow}>
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  id={`filter-${f.toLowerCase().replace(" ", "-")}`}
                  className={`${styles.filterBtn} ${activeFilter === f ? styles.filterBtnActive : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              className={styles.filterBtn}
              onClick={loadIssues}
              title="Refresh"
              id="refresh-issues"
              style={{ padding: "6px 10px" }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {loadError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px", color: "#b91c1c", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} /> {loadError}
          </div>
        )}

        {/* Grid */}
        <div className={styles.issuesGrid}>
          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <span>Loading your issues...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Inbox size={38} />
              </div>
              <h3>
                {activeFilter === "All"
                  ? "No issues submitted yet"
                  : `No ${activeFilter} issues`}
              </h3>
              <p>
                {activeFilter === "All"
                  ? "Report a civic issue in your area and help improve your community."
                  : `You don't have any issues with status "${activeFilter}" at the moment.`}
              </p>
              {activeFilter === "All" && (
                <button className={styles.emptyReportBtn} onClick={() => setModalOpen(true)}>
                  <Plus size={16} />
                  Report Your First Issue
                </button>
              )}
            </div>
          ) : (
            filtered.map((issue) => (
              <IssueCard 
                key={issue._id} 
                issue={issue} 
                onClick={() => setSelectedIssue(issue)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Report Modal ── */}
      {modalOpen && (
        <ReportModal
          onClose={() => setModalOpen(false)}
          onSuccess={handleReportSuccess}
        />
      )}

      {/* ── Issue Details Modal ── */}
      {selectedIssue && (
        <IssueDetailsModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
