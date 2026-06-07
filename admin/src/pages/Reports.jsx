import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  FileDown, 
  Settings, 
  Printer, 
  Building2,
  Calendar,
  Layers,
  Activity
} from "lucide-react";
import { useIssues } from "../hooks/useIssues";
import styles from "./Reports.module.css";

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

const CATEGORIES = [
  "Road Damage",
  "Water Leakage",
  "Garbage Issues",
  "Drainage Problems",
  "Street Light Failures"
];

const Reports = () => {
  const [districtId, setDistrictId] = useState("D001");
  const [adminName, setAdminName] = useState("Officer");

  // Read districtId and adminName from session
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
    const adminStr = sessionStorage.getItem("admin");
    if (adminStr) {
      const admin = JSON.parse(adminStr);
      setAdminName(admin.name || "Officer");
    }
  }, []);

  const { issues, loading } = useIssues(districtId);

  // Filters for Report Generation
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Process data based on filters
  const filteredIssues = issues.filter((issue) => {
    if (category && issue.category !== category) return false;
    if (status && issue.status !== status) return false;

    const issueDate = new Date(issue.createdAt);
    if (dateFrom && issueDate < new Date(dateFrom)) return false;
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (issueDate > endOfDay) return false;
    }

    return true;
  });

  // Calculate Metrics
  const total = filteredIssues.length;
  const pending = filteredIssues.filter((i) => i.status === "Pending").length;
  const inProgress = filteredIssues.filter((i) => i.status === "In Progress").length;
  const resolved = filteredIssues.filter((i) => i.status === "Resolved").length;
  const rejected = filteredIssues.filter((i) => i.status === "Rejected").length;

  // CSV Exporter helper
  const handleExportCSV = () => {
    if (filteredIssues.length === 0) {
      alert("No data available to export.");
      return;
    }

    // CSV Headers
    const headers = [
      "Complaint ID",
      "Title",
      "Category",
      "Citizen Name",
      "Citizen Phone",
      "Status",
      "Priority",
      "Created Date",
      "Remarks"
    ];

    // Map rows
    const rows = filteredIssues.map((issue) => [
      `"${issue._id}"`,
      `"${issue.title.replace(/"/g, '""')}"`,
      `"${issue.category}"`,
      `"${(issue.userId?.name || "Anonymous").replace(/"/g, '""')}"`,
      `"${issue.userId?.phoneNumber || "N/A"}"`,
      `"${issue.status}"`,
      `"${issue.priority}"`,
      `"${new Date(issue.createdAt).toLocaleDateString()}"`,
      `"${(issue.remarks || "").replace(/"/g, '""')}"`
    ]);

    // Build CSV content
    const csvContent = 
      "data:text/csv;charset=utf-8,\uFEFF" + // BOM to force UTF-8 in Excel
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `civic_grievance_report_${districtId}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      {/* Title Header */}
      <div className={styles.titleHeader}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 850, color: "var(--text-dark)" }}>
          Administrative Reports & Audit Logs
        </h1>
        <p style={{ color: "var(--text-light)", fontSize: "0.875rem", fontWeight: 500 }}>
          Generate, compile, download, and print official reports for municipal performance indicators.
        </p>
      </div>

      <div className={styles.reportGrid}>
        {/* Left Side: Filter Form Panel */}
        <div className={styles.configCard}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.95rem", color: "var(--primary-color)" }}>
            <Settings size={18} />
            <span>Report Configurator</span>
          </div>

          {/* Category selection */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Category</label>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selection */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Grievance Status</label>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending Action</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Date range from */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Filing Date From</label>
            <input
              type="date"
              className={styles.input}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date range to */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Filing Date To</label>
            <input
              type="date"
              className={styles.input}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Action Row */}
          <div className={styles.actionRow}>
            <button className={`${styles.exportBtn} ${styles.btnExcel}`} onClick={handleExportCSV}>
              <FileSpreadsheet size={16} />
              <span>Export to Excel (CSV)</span>
            </button>
            <button className={`${styles.exportBtn} ${styles.btnPDF}`} onClick={handleExportPDF}>
              <Printer size={16} />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Right Side: Print Document Preview Sheet */}
        <div className={styles.previewCard}>
          {/* Government seal and official text header */}
          <div className={styles.govHeader}>
            <Building2 size={36} style={{ color: "var(--primary-color)" }} />
            <h2 className={styles.govTitle}>GOVERNMENT OF NATIONAL TERRITORY</h2>
            <h3 className={styles.govSubtitle}>
              MUNICIPAL ADMINISTRATION & GREATER COMMAND CENTER
            </h3>
            <span style={{ fontSize: "0.65rem", color: "var(--text-light)", fontWeight: 700 }}>
              OFFICIAL STATISTICAL AUDIT REPORT
            </span>
          </div>

          {/* Metadata of Report */}
          <div className={styles.reportMeta}>
            <span>District: {DISTRICT_MAP[districtId] || `${districtId} Region`}</span>
            <span>Generated: {new Date().toLocaleDateString("en-IN")}</span>
          </div>

          {/* Aggregated KPI counts */}
          <div className={styles.previewGrid}>
            <div className={styles.previewStatBox}>
              <span className={styles.previewStatVal}>{total}</span>
              <span className={styles.previewStatLabel}>Total Filed</span>
            </div>
            <div className={styles.previewStatBox}>
              <span className={styles.previewStatVal} style={{ color: "var(--warning-color)" }}>
                {pending}
              </span>
              <span className={styles.previewStatLabel}>Pending</span>
            </div>
            <div className={styles.previewStatBox}>
              <span className={styles.previewStatVal} style={{ color: "#17a2b8" }}>
                {inProgress}
              </span>
              <span className={styles.previewStatLabel}>In Progress</span>
            </div>
            <div className={styles.previewStatBox}>
              <span className={styles.previewStatVal} style={{ color: "var(--success-color)" }}>
                {resolved}
              </span>
              <span className={styles.previewStatLabel}>Resolved</span>
            </div>
          </div>

          {/* Detail List Table */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>Compiling metrics...</div>
          ) : filteredIssues.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-light)" }}>
              No grievances found for this selection filter.
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Complaint ID</th>
                  <th className={styles.th}>Citizen</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Priority</th>
                  <th className={styles.th}>Lodged Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.slice(0, 15).map((issue) => (
                  <tr key={issue._id}>
                    <td className={styles.td} style={{ fontFamily: "monospace" }}>
                      {issue._id}
                    </td>
                    <td className={styles.td}>{issue.userId?.name || "Anonymous"}</td>
                    <td className={styles.td}>{issue.category}</td>
                    <td className={styles.td} style={{ fontWeight: 700 }}>
                      {issue.status}
                    </td>
                    <td className={styles.td}>{issue.priority}</td>
                    <td className={styles.td}>
                      {new Date(issue.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {filteredIssues.length > 15 && (
            <div style={{ fontSize: "0.7rem", color: "var(--text-light)", fontStyle: "italic", textAlign: "right", marginTop: "0.5rem" }}>
              * Preview lists top 15 records. CSV export contains all {filteredIssues.length} records.
            </div>
          )}

          {/* Signature Authority Section */}
          <div className={styles.footer}>
            <div style={{ fontSize: "0.65rem", color: "var(--text-light)" }}>
              Document ID: GN-R-{districtId}-{new Date().getTime().toString().slice(-6)}
            </div>
            <div className={styles.signatureArea}>
              <div className={styles.signatureLine}></div>
              <span className={styles.signText}>District Collector / Director</span>
              <span style={{ fontSize: "0.6rem", color: "var(--text-light)" }}>
                {DISTRICT_MAP[districtId] || districtId} Command
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
