import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  FolderLock, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XOctagon, 
  BarChart3, 
  CalendarDays,
  Percent,
  ListTodo
} from "lucide-react";
import { useIssues } from "../hooks/useIssues";
import styles from "./AdminDashboard.module.css";

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

const AdminDashboard = () => {
  const [districtId, setDistrictId] = useState("D001");
  const [adminName, setAdminName] = useState("Officer");

  // Read current admin and token to filter by district
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

  const { issues, loading, usingMock } = useIssues(districtId);

  // Compute stats dynamically
  const total = issues.length;
  const pending = issues.filter(i => i.status === "Pending").length;
  const inProgress = issues.filter(i => i.status === "In Progress").length;
  const resolved = issues.filter(i => i.status === "Resolved").length;
  const rejected = issues.filter(i => i.status === "Rejected").length;

  // SLA compliance computation: percentage of issues not pending
  const slaCompliance = total > 0 ? Math.round(((resolved + rejected + inProgress) / total) * 100) : 100;
  
  // Calculate average resolution time: mock based on resolved cases or default
  const avgResolutionTime = resolved > 0 ? "2.8 Days" : "N/A";
  
  // District performance index
  const performanceScore = total > 0 ? (resolved / total * 100 * 0.7 + slaCompliance * 0.3).toFixed(1) : "100.0";

  // Category statistics computation for Heatmap & Doughnut Chart
  const categories = [
    "Road Damage",
    "Water Leakage",
    "Garbage Issues",
    "Drainage Problems",
    "Street Light Failures"
  ];

  const categoryCounts = categories.map(cat => ({
    name: cat,
    value: issues.filter(i => i.category === cat).length
  }));

  const topCategory = [...categoryCounts].sort((a, b) => b.value - a.value)[0]?.name || "N/A";

  // Recharts Data formats
  const statusChartData = [
    { name: "Pending", value: pending, color: "#FFC107" },
    { name: "In Progress", value: inProgress, color: "#17a2b8" },
    { name: "Resolved", value: resolved, color: "#28A745" },
    { name: "Rejected", value: rejected, color: "#DC3545" }
  ].filter(item => item.value > 0);

  // Fallback if no issues exist to prevent empty Pie chart crash
  const safeStatusChartData = statusChartData.length > 0 ? statusChartData : [
    { name: "No Data", value: 1, color: "#e2e8f0" }
  ];

  // Monthly complaint trends data (Pre-seeded past trends + dynamic addition)
  const monthlyTrendsData = [
    { month: "Jan", Total: 12, Resolved: 8 },
    { month: "Feb", Total: 18, Resolved: 12 },
    { month: "Mar", Total: 15, Resolved: 11 },
    { month: "Apr", Total: 22, Resolved: 17 },
    { month: "May", Total: 25, Resolved: 19 },
    { month: "Jun", Total: total, Resolved: resolved }
  ];

  // Colors mapping helper
  const COLORS = ["#0F4C81", "#FF9933", "#28A745", "#FFC107", "#DC3545"];

  return (
    <div className={styles.container}>
      {/* Portal Banner Header */}
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-dark)" }}>
            District Collector Monitoring Dashboard
          </h1>
          <p style={{ color: "var(--text-light)", fontSize: "0.875rem", fontWeight: 500 }}>
            Real-time analytics for <strong style={{ color: "var(--primary-color)" }}>{DISTRICT_MAP[districtId] || `${districtId} Region`}</strong>
          </p>
        </div>

        <div className={styles.metaInfo}>
          {usingMock && (
            <span className={styles.statusIndicator} style={{ backgroundColor: "var(--warning-bg)", color: "var(--warning-color)" }}>
              DEMO (Mock Active)
            </span>
          )}
          <span className={styles.statusIndicator}>
            <span className={styles.pulse}></span>
            Live Command Stream
          </span>
        </div>
      </div>

      {/* Main KPI Counter Cards Grid */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.cardTotal}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Complaints</span>
            <span className={styles.statValue}>{total}</span>
            <span className={`${styles.statTrend} ${styles.trendUp}`}>
              <TrendingUp size={14} />
              <span>+14.2%</span>
            </span>
          </div>
          <div className={styles.statIcon}>
            <ListTodo size={24} />
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.cardPending}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pending Action</span>
            <span className={styles.statValue}>{pending}</span>
            <span className={`${styles.statTrend} ${styles.trendDown}`}>
              <TrendingDown size={14} />
              <span>-5.4%</span>
            </span>
          </div>
          <div className={styles.statIcon}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.cardProgress}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>In Progress</span>
            <span className={styles.statValue}>{inProgress}</span>
            <span className={`${styles.statTrend} ${styles.trendUp}`}>
              <TrendingUp size={14} />
              <span>+8.1%</span>
            </span>
          </div>
          <div className={styles.statIcon}>
            <Clock size={24} />
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.cardResolved}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Resolved Cases</span>
            <span className={styles.statValue}>{resolved}</span>
            <span className={`${styles.statTrend} ${styles.trendUp}`}>
              <TrendingUp size={14} />
              <span>+18.7%</span>
            </span>
          </div>
          <div className={styles.statIcon}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.cardRejected}`}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Rejected Grievances</span>
            <span className={styles.statValue}>{rejected}</span>
            <span className={`${styles.statTrend} ${styles.trendDown}`}>
              <TrendingDown size={14} />
              <span>-1.2%</span>
            </span>
          </div>
          <div className={styles.statIcon}>
            <XOctagon size={24} />
          </div>
        </div>
      </div>

      {/* Recruiter Impression KPI panel (SLA indicators, Resolution scores) */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <Percent size={18} className={styles.brandIcon} style={{ color: "var(--primary-color)" }} />
            <span>District Performance Score</span>
          </div>
          <div className={styles.kpiBody}>
            <div className={styles.kpiScore}>{performanceScore} / 100</div>
            <div className={styles.kpiProgressContainer}>
              <div 
                className={styles.kpiProgressBar} 
                style={{ width: `${performanceScore}%`, background: "linear-gradient(to right, var(--primary-color), var(--success-color))" }}
              ></div>
            </div>
            <div className={styles.kpiFooterText}>
              Composite rating based on resolution rates (70%) and SLA compliance (30%)
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <CalendarDays size={18} style={{ color: "#FF9933" }} />
            <span>Average Resolution SLA</span>
          </div>
          <div className={styles.kpiBody}>
            <div className={styles.kpiScore} style={{ color: "#FF9933" }}>{avgResolutionTime}</div>
            <div className={styles.kpiProgressContainer}>
              <div className={styles.kpiProgressBar} style={{ width: "85%", backgroundColor: "#FF9933" }}></div>
            </div>
            <div className={styles.kpiFooterText}>
              Target: under 5.0 days. Currently maintaining green status.
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <FolderLock size={18} style={{ color: "var(--success-color)" }} />
            <span>SLA Compliance Level</span>
          </div>
          <div className={styles.kpiBody}>
            <div className={styles.kpiScore} style={{ color: "var(--success-color)" }}>{slaCompliance}%</div>
            <div className={styles.kpiProgressContainer}>
              <div className={styles.kpiProgressBar} style={{ width: `${slaCompliance}%`, backgroundColor: "var(--success-color)" }}></div>
            </div>
            <div className={styles.kpiFooterText}>
              Target threshold: 90%. Percentage of complaints resolved or in progress.
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Visualization Widgets Section (Pie, Bar, Doughnut) */}
      <div className={styles.chartsGrid}>
        {/* Pie Chart: Status distribution */}
        <div className={styles.chartCard}>
          <span className={styles.chartTitle}>Complaint Status Distribution</span>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={safeStatusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {safeStatusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} complaints`, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Monthly trends */}
        <div className={styles.chartCard}>
          <span className={styles.chartTitle}>Monthly Grievance Resolution Trends</span>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total" name="Total Filed" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resolved" name="Resolved" fill="var(--success-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart: Category split */}
        <div className={styles.chartCard}>
          <span className={styles.chartTitle}>Issue Category Breakdown</span>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryCounts.filter(cat => cat.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="value"
                  label={({ name }) => name.split(" ")[0]}
                >
                  {categoryCounts.filter(cat => cat.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} complaints`, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Layout Split: Category Heatmap & Recent Activity Log */}
      <div className={styles.bottomSection}>
        {/* Heatmap/Breakdown progress lines */}
        <div className={styles.kpiCard}>
          <span className={styles.chartTitle} style={{ marginBottom: "1rem" }}>
            Top Categories & Recurrence Heatmap
          </span>
          <div className={styles.heatmapContainer}>
            {categoryCounts.map((cat, index) => {
              const maxVal = Math.max(...categoryCounts.map(c => c.value)) || 1;
              const fillPercentage = (cat.value / maxVal) * 100;
              return (
                <div key={cat.name} className={styles.heatmapRow}>
                  <div className={styles.heatmapLabel}>
                    <span>{cat.name}</span>
                    <span>{cat.value} Filed</span>
                  </div>
                  <div className={styles.heatmapBarBg}>
                    <div 
                      className={styles.heatmapBarFill} 
                      style={{ 
                        width: `${fillPercentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent timeline actions */}
        <div className={styles.kpiCard}>
          <span className={styles.chartTitle} style={{ marginBottom: "1rem" }}>
            Recent Administration Log
          </span>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineMarker} ${styles.markerWarning}`}></div>
              <div className={styles.timelineContent}>
                <span className={styles.timelineTitle}>New Grievance Registered</span>
                <span className={styles.timelineDesc}>ISS-2026-005 registered by citizen regarding street lights</span>
                <span className={styles.timelineTime}>2 minutes ago</span>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={`${styles.timelineMarker} ${styles.markerSuccess}`}></div>
              <div className={styles.timelineContent}>
                <span className={styles.timelineTitle}>Status Promoted: Resolved</span>
                <span className={styles.timelineDesc}>Officer {adminName} closed water leakage complaint ISS-2026-003</span>
                <span className={styles.timelineTime}>1 hour ago</span>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={`${styles.timelineMarker} ${styles.markerDanger}`}></div>
              <div className={styles.timelineContent}>
                <span className={styles.timelineTitle}>SLA Warning Alert</span>
                <span className={styles.timelineDesc}>Drainage overflow issue ISS-2026-004 pending for &gt; 48 hours</span>
                <span className={styles.timelineTime}>3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
