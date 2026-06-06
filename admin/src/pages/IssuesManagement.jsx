import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  X,
  ThumbsUp
} from "lucide-react";
import { useIssues } from "../hooks/useIssues";
import styles from "./IssuesManagement.module.css";

const CATEGORIES = [
  "Road Damage",
  "Water Leakage",
  "Garbage Issues",
  "Drainage Problems",
  "Street Light Failures"
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const IssuesManagement = () => {
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

  const { issues, loading, usingMock } = useIssues(districtId);

  // Active status tab: "All", "Pending", "In Progress", "Resolved", "Rejected"
  const [activeTab, setActiveTab] = useState("All");

  // Search & Filter state
  const [searchId, setSearchId] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Sorting state
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchId, searchTitle, categoryFilter, dateFilter]);

  // Handle Sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchId("");
    setSearchTitle("");
    setCategoryFilter("");
    setDateFilter("");
    setActiveTab("All");
  };

  // Filter complaints
  const filteredIssues = issues.filter((issue) => {
    // 1. Tab status filter
    if (activeTab !== "All" && issue.status !== activeTab) {
      return false;
    }

    // 2. ID search
    if (searchId && !issue._id.toLowerCase().includes(searchId.toLowerCase())) {
      return false;
    }

    // 3. Title search
    if (searchTitle && !issue.title.toLowerCase().includes(searchTitle.toLowerCase())) {
      return false;
    }

    // 4. Category filter
    if (categoryFilter && issue.category !== categoryFilter) {
      return false;
    }

    // 5. Date filter
    if (dateFilter) {
      const issueDate = new Date(issue.createdAt).toISOString().split("T")[0];
      if (issueDate !== dateFilter) {
        return false;
      }
    }

    return true;
  });

  // Sort complaints
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    let comparison = 0;

    if (sortField === "createdAt" || sortField === "updatedAt") {
      comparison = new Date(a[sortField]) - new Date(b[sortField]);
    } else if (sortField === "_id" || sortField === "title" || sortField === "category") {
      comparison = a[sortField].localeCompare(b[sortField]);
    } else if (sortField === "priority") {
      const priorityWeights = { Low: 1, Medium: 2, High: 3, Critical: 4 };
      comparison = (priorityWeights[a.priority] || 0) - (priorityWeights[b.priority] || 0);
    } else if (sortField === "upvotes") {
      const aCount = Array.isArray(a.upvotes) ? a.upvotes.length : 0;
      const bCount = Array.isArray(b.upvotes) ? b.upvotes.length : 0;
      comparison = aCount - bCount;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Paginate complaints
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedIssues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedIssues.length / itemsPerPage);

  // Status badge style mapper
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return styles.badgePending;
      case "In Progress":
        return styles.badgeProgress;
      case "Resolved":
        return styles.badgeResolved;
      case "Rejected":
        return styles.badgeRejected;
      default:
        return "";
    }
  };

  // Priority chip style mapper
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

  return (
    <div className={styles.container}>
      {/* Title Header */}
      <div className={styles.titleHeader}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 850, color: "var(--text-dark)" }}>
          Grievance Management Registry
        </h1>
        <p style={{ color: "var(--text-light)", fontSize: "0.875rem", fontWeight: 500 }}>
          Manage, verify, audit and update civic issues reported by citizens in your district.
        </p>
      </div>

      {/* Tabs Filter Bar */}
      <div className={styles.tabsContainer}>
        {["All", "Pending", "In Progress", "Resolved", "Rejected"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "All" ? "All Issues" : tab} ({
              tab === "All"
                ? issues.length
                : issues.filter((i) => i.status === tab).length
            })
          </button>
        ))}
      </div>

      {/* Search & Filter Section */}
      <div className={styles.filtersCard}>
        {/* Search by ID */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Grievance ID</label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", color: "var(--text-light)" }} />
            <input
              type="text"
              placeholder="e.g. ISS-2026-001"
              className={styles.input}
              style={{ paddingLeft: "32px", width: "100%" }}
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
        </div>

        {/* Search by Title */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Complaint Keyword</label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Filter size={16} style={{ position: "absolute", left: "10px", color: "var(--text-light)" }} />
            <input
              type="text"
              placeholder="Search in title..."
              className={styles.input}
              style={{ paddingLeft: "32px", width: "100%" }}
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
          </div>
        </div>

        {/* Filter by Category */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Category</label>
          <select
            className={styles.select}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Date */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Created Date</label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Calendar size={16} style={{ position: "absolute", left: "10px", color: "var(--text-light)" }} />
            <input
              type="date"
              className={styles.input}
              style={{ paddingLeft: "32px", width: "100%" }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Clear Button */}
        <button className={styles.resetBtn} onClick={resetFilters} title="Reset all filters">
          <X size={16} />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Grievances Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.noData}>Loading Grievances...</div>
        ) : currentItems.length === 0 ? (
          <div className={styles.noData}>No complaints match the filter criteria.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} onClick={() => handleSort("_id")}>
                    Complaint ID
                    <span className={styles.sortIcon}><ArrowUpDown size={13} /></span>
                  </th>
                  <th className={styles.th} onClick={() => handleSort("title")}>
                    Title
                    <span className={styles.sortIcon}><ArrowUpDown size={13} /></span>
                  </th>
                  <th className={styles.th} onClick={() => handleSort("category")}>
                    Category
                    <span className={styles.sortIcon}><ArrowUpDown size={13} /></span>
                  </th>
                  <th className={styles.th}>Citizen Name</th>
                  <th className={styles.th}>Phone Number</th>
                  <th className={styles.th} onClick={() => handleSort("createdAt")}>
                    Created Date
                    <span className={styles.sortIcon}><ArrowUpDown size={13} /></span>
                  </th>
                  <th className={styles.th} onClick={() => handleSort("upvotes")}>
                    Endorsements
                    <span className={styles.sortIcon}><ArrowUpDown size={13} /></span>
                  </th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th} onClick={() => handleSort("priority")}>
                    Priority
                    <span className={styles.sortIcon}><ArrowUpDown size={13} /></span>
                  </th>
                  <th className={styles.th} style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((issue, idx) => (
                  <tr
                    key={issue._id}
                    className={`${styles.tr} ${idx % 2 === 1 ? styles.trAlternate : ""}`}
                  >
                    <td className={`${styles.td} ${styles.complaintNum}`}>{issue._id.slice(-12)}</td>
                    <td className={styles.td} style={{ fontWeight: 600 }}>{issue.title}</td>
                    <td className={styles.td}>{issue.category}</td>
                    <td className={styles.td}>{issue.userId?.name || "Anonymous"}</td>
                    <td className={styles.td} style={{ color: "var(--text-light)", fontFamily: "monospace" }}>
                      {issue.userId?.phoneNumber || "N/A"}
                    </td>
                    <td className={styles.td} style={{ color: "var(--text-light)" }}>
                      {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className={styles.td}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 650, color: "var(--text-dark)" }}>
                        <ThumbsUp size={12} color="#104f9e" />
                        {issue.upvotes?.length || 0}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${getStatusBadgeClass(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.chip} ${getPriorityChipClass(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className={styles.td} style={{ textAlign: "center" }}>
                      <Link to={`/admin/issues/${issue._id}`} className={styles.viewBtn}>
                        <ExternalLink size={13} />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.pageInfo}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedIssues.length)} of {sortedIssues.length} issues
            </div>
            <div className={styles.paginationControls}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`${styles.pageBtn} ${currentPage === index + 1 ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesManagement;
