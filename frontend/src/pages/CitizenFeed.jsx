import React, { useState, useEffect, useCallback } from "react";
import { 
  Megaphone, 
  Search, 
  Filter, 
  X, 
  ThumbsUp, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  RefreshCw, 
  Inbox, 
  Eye, 
  FileVideo, 
  Info,
  AlertCircle
} from "lucide-react";
import { fetchDistrictIssues, toggleIssueUpvote } from "../services/api";
import styles from "./CitizenFeed.module.css";

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
  const normalizedPath = path.replace(/\\/g, "/");
  return `${BACKEND_URL}/${normalizedPath}`;
};

const maskPhone = (phone) => {
  if (!phone) return "N/A";
  if (phone.length <= 4) return "****";
  return `******${phone.slice(-4)}`;
};

/* ------------------------------------------------------------------ */
/*  Shared Issue Details Modal Component                              */
/* ------------------------------------------------------------------ */
const IssueDetailsModal = ({ issue, onClose }) => {
  const [activeMedia, setActiveMedia] = useState(null);

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
      {activeMedia && (
        <div className={styles.lightbox} onClick={() => setActiveMedia(null)}>
          <button className={styles.lightboxClose} onClick={() => setActiveMedia(null)}>
            <X size={32} />
          </button>
          {activeMedia.type === "image" ? (
            <img src={getMediaUrl(activeMedia.path)} alt="Evidence Zoom" className={styles.lightboxContent} onClick={(e) => e.stopPropagation()} />
          ) : (
            <video src={getMediaUrl(activeMedia.path)} controls autoPlay className={styles.lightboxContent} onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}

      <div className={`${styles.modal} ${styles.detailsModal}`}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderText}>
            <div className={styles.detailsModalBadge}>
              <span>Complaint ID: </span>
              <strong className={styles.detailsId}>{issue._id}</strong>
            </div>
            <h2>{issue.title}</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.detailsSplit}>
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
                <div className={styles.detailsMetaItem}>
                  <span className={styles.detailsMetaLabel}>Mandal</span>
                  <span className={styles.detailsMetaVal}>{issue.mandal || "N/A"}</span>
                </div>
                <div className={styles.detailsMetaItem}>
                  <span className={styles.detailsMetaLabel}>Village / Town</span>
                  <span className={styles.detailsMetaVal}>{issue.village || "N/A"}</span>
                </div>
                <div className={styles.detailsMetaItem}>
                  <span className={styles.detailsMetaLabel}>Area / Locality</span>
                  <span className={styles.detailsMetaVal}>{issue.area || "N/A"}</span>
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
                    <div key={idx} className={styles.detailsMediaItem} onClick={() => setActiveMedia(m)}>
                      {m.type === "image" ? (
                        <img src={getMediaUrl(m.path)} alt={`Evidence ${idx + 1}`} className={styles.detailsMediaImg} onError={(e) => { e.target.src = "https://placehold.co/150?text=Error+Loading"; }} />
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

          <div className={styles.detailsTimelineCol}>
            <div className={styles.detailsSection}>
              <h4>Audit Status Timeline</h4>
              <div className={styles.timelineContainer}>
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className={`${styles.timelineStep} ${event.status === "completed" ? styles.stepCompleted : event.status === "active" ? styles.stepActive : styles.stepPending}`}>
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
/*  Main CitizenFeed Page Component                                   */
/* ------------------------------------------------------------------ */
const CitizenFeed = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  
  const currentUserId = userData?.id || "";

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDistrictIssues();
      setIssues(data.issues || []);
    } catch (err) {
      setError(err.message || "Failed to load district feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleUpvote = async (e, issueId) => {
    e.stopPropagation(); // Prevent opening modal
    try {
      const data = await toggleIssueUpvote(issueId);
      if (data && data.success) {
        // Update local state to show updated upvotes
        setIssues(prevIssues => 
          prevIssues.map(issue => 
            issue._id === issueId ? { ...issue, upvotes: data.upvotes } : issue
          )
        );
        // If the selected modal is active, update its upvotes too
        if (selectedIssue && selectedIssue._id === issueId) {
          setSelectedIssue(prev => ({ ...prev, upvotes: data.upvotes }));
        }
      }
    } catch (err) {
      console.error("Upvote failed:", err.message);
    }
  };

  const filteredIssues = issues.filter(issue => {
    // 1. Search Query
    if (searchQuery && 
        !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !issue.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 2. Category
    if (categoryFilter && issue.category !== categoryFilter) {
      return false;
    }
    // 3. Status Tab
    if (statusFilter !== "All" && issue.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>Public Grievance Feed</h2>
          <p>
            Explore active civic complaints registered in <strong>{DISTRICT_MAP[userData?.districtId] || "your district"}</strong>. 
            Upvote issues to raise their priority flag.
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={loadFeed} disabled={loading}>
          <RefreshCw size={14} className={loading ? styles.spin : ""} />
        </button>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Controls Card */}
      <div className={styles.controlsCard}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search keywords in title or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearSearchBtn} onClick={() => setSearchQuery("")}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.filterBox}>
          <Filter size={16} className={styles.filterIcon} />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className={styles.tabsMenu}>
        {STATUS_FILTERS.map(f => (
          <button 
            key={f} 
            className={`${styles.tabBtn} ${statusFilter === f ? styles.tabBtnActive : ""}`}
            onClick={() => setStatusFilter(f)}
          >
            {f === "All" ? "All District Issues" : f}
          </button>
        ))}
      </div>

      {/* Feed Grid */}
      <div className={styles.feedGrid}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Fetching feed registry...</span>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={40} className={styles.emptyIcon} />
            <h4>No complaints found</h4>
            <p>There are no reports matching the selected filters in this region.</p>
          </div>
        ) : (
          filteredIssues.map(issue => {
            const hasUpvoted = Array.isArray(issue.upvotes) && issue.upvotes.includes(currentUserId);
            const votesCount = Array.isArray(issue.upvotes) ? issue.upvotes.length : 0;
            const hasMedia = Array.isArray(issue.media) && issue.media.length > 0;

            return (
              <div 
                key={issue._id} 
                className={styles.feedCard}
                onClick={() => setSelectedIssue(issue)}
              >
                <div className={`${styles.cardAccent} ${getAccentClass(issue.status)}`} />
                
                <div className={styles.cardHeader}>
                  <div className={styles.cardMeta}>
                    <span className={styles.categoryTag}><MapPin size={11} /> {issue.category || "General"}</span>
                    <span className={`${styles.statusBadge} ${getStatusClass(issue.status)}`}>{issue.status}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{issue.title}</h3>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.cardDesc}>{issue.description}</p>
                  
                  {/* Media Previews */}
                  {hasMedia && (
                    <div className={styles.mediaGrid}>
                      {issue.media.slice(0, 3).map((m, index) => (
                        m.type === "image" ? (
                          <img key={index} src={getMediaUrl(m.path)} alt="Evidence Preview" className={styles.mediaThumb} onError={(e) => { e.target.style.display = "none"; }} />
                        ) : (
                          <div key={index} className={styles.mediaVideoThumb}><FileVideo size={16} /></div>
                        )
                      ))}
                      {issue.media.length > 3 && (
                        <div className={styles.mediaMoreOverlay}>+{issue.media.length - 3}</div>
                      )}
                    </div>
                  )}

                  {/* Citizen details (masked) */}
                  <div className={styles.filedBy}>
                    <span>Filed by: <strong>{issue.userId?.name || "Citizen"}</strong></span>
                    <span className={styles.maskedPhone}>{maskPhone(issue.userId?.phoneNumber)}</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <button 
                    className={`${styles.upvoteBtn} ${hasUpvoted ? styles.upvoteBtnActive : ""}`}
                    onClick={(e) => handleUpvote(e, issue._id)}
                    title={hasUpvoted ? "Remove endorsement" : "Support this grievance"}
                  >
                    <ThumbsUp size={14} fill={hasUpvoted ? "currentColor" : "none"} />
                    <span>Support {votesCount > 0 ? `(${votesCount})` : ""}</span>
                  </button>
                  <span className={styles.viewDetailsBtn}>
                    Details <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Slide Modal */}
      {selectedIssue && (
        <IssueDetailsModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};

export default CitizenFeed;
