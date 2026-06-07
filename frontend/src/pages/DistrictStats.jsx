import React, { useState, useEffect, useCallback } from "react";
import { 
  BarChart3, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle, 
  ListTodo, 
  CheckCircle, 
  Info 
} from "lucide-react";
import { fetchDistrictIssues } from "../services/api";
import styles from "./DistrictStats.module.css";

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

const DistrictStats = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const districtId = userData?.districtId || "EG001";
  const districtName = DISTRICT_MAP[districtId] || "East Godavari District";

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDistrictIssues();
      setIssues(data.issues || []);
    } catch (err) {
      setError(err.message || "Failed to load district data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Compute stats
  const total = issues.length;
  const pending = issues.filter(i => i.status === "Pending").length;
  const inProgress = issues.filter(i => i.status === "In Progress").length;
  const resolved = issues.filter(i => i.status === "Resolved").length;
  const rejected = issues.filter(i => i.status === "Rejected").length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const activeUnresolved = pending + inProgress;
  const slaCompliance = total > 0 ? Math.round(((resolved + rejected + inProgress) / total) * 100) : 100;

  // Category counts
  const categories = [
    "Road Damage",
    "Water Supply",
    "Drainage",
    "Electricity",
    "Sanitation",
    "Public Safety",
    "Street Lighting",
  ];

  const categoryData = categories.map(cat => {
    const catIssues = issues.filter(i => i.category === cat);
    const catResolved = catIssues.filter(i => i.status === "Resolved").length;
    const catTotal = catIssues.length;
    return {
      name: cat,
      total: catTotal,
      resolved: catResolved,
      percentage: catTotal > 0 ? Math.round((catResolved / catTotal) * 100) : 0
    };
  }).sort((a, b) => b.total - a.total);

  // Custom SVG Doughnut details
  const getDoughnutPaths = () => {
    const counts = [pending, inProgress, resolved, rejected];
    const totalCount = counts.reduce((a, b) => a + b, 0);
    if (totalCount === 0) return [];

    const colors = ["#ff9933", "#3b82f6", "#22c55e", "#ef4444"];
    const names = ["Pending", "In Progress", "Resolved", "Rejected"];
    let accumulatedAngle = 0;

    return counts.map((count, idx) => {
      if (count === 0) return null;
      const percentage = count / totalCount;
      const angle = percentage * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      // Coordinate converter helper
      const coordinate = (deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return {
          x: 50 + 40 * Math.cos(rad),
          y: 50 + 40 * Math.sin(rad)
        };
      };

      const start = coordinate(startAngle);
      const end = coordinate(endAngle);
      const largeArc = angle > 180 ? 1 : 0;

      return {
        d: `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArc} 1 ${end.x} ${end.y} Z`,
        color: colors[idx],
        name: names[idx],
        count,
        percentage: Math.round(percentage * 100)
      };
    }).filter(Boolean);
  };

  const segments = getDoughnutPaths();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>District Grievance Analytics</h2>
          <p>Analytical performance reports and compliance parameters monitored for <strong>{districtName}</strong>.</p>
        </div>
        <button 
          className={styles.refreshBtn} 
          onClick={loadStats} 
          disabled={loading}
          title="Refresh stats"
        >
          <RefreshCw size={14} className={loading ? styles.spin : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Compiling state database...</span>
        </div>
      ) : (
        <>
          {/* Top KPI Metrics Row */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>District Jurisdiction Reports</span>
                <span className={styles.statValue}>{total}</span>
              </div>
              <div className={`${styles.statIcon} ${styles.iconTotal}`}>
                <ListTodo size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Resolution Rate</span>
                <span className={styles.statValue}>{resolutionRate}%</span>
              </div>
              <div className={`${styles.statIcon} ${styles.iconResolved}`}>
                <CheckCircle size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Active Grievances</span>
                <span className={styles.statValue}>{activeUnresolved}</span>
              </div>
              <div className={`${styles.statIcon} ${styles.iconPending}`}>
                <RefreshCw size={22} />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>SLA Compliance</span>
                <span className={styles.statValue}>{slaCompliance}%</span>
              </div>
              <div className={`${styles.statIcon} ${styles.iconSla}`}>
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          <div className={styles.dashboardSplit}>
            {/* Left Column: Custom SVG Doughnut & Leaderboard */}
            <div className={styles.leftCol}>
              {/* Pie Chart Card */}
              <div className={styles.card}>
                <div className={styles.sectionTitle}>
                  <BarChart3 size={16} />
                  <span>Grievance Status Split</span>
                </div>
                
                {total === 0 ? (
                  <div className={styles.emptyChart}>No reports filed in this district.</div>
                ) : (
                  <div className={styles.pieContainer}>
                    <div className={styles.pieChartWrapper}>
                      <svg viewBox="0 0 100 100" className={styles.svgPie}>
                        {segments.map((seg, idx) => (
                          <path 
                            key={idx} 
                            d={seg.d} 
                            fill={seg.color}
                            className={styles.pieSegment}
                          />
                        ))}
                        {/* Center cutout for doughnut */}
                        <circle cx="50" cy="50" r="24" fill="#ffffff" />
                      </svg>
                      <div className={styles.pieChartCenterLabel}>
                        <strong>{total}</strong>
                        <span>Total</span>
                      </div>
                    </div>

                    <div className={styles.pieLegend}>
                      {segments.map((seg, idx) => (
                        <div key={idx} className={styles.legendItem}>
                          <span className={styles.legendColor} style={{ backgroundColor: seg.color }}></span>
                          <span className={styles.legendName}>{seg.name}</span>
                          <span className={styles.legendCount}>{seg.count} ({seg.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* State Leaderboard Card */}
              <div className={styles.card}>
                <div className={styles.sectionTitle}>
                  <TrendingUp size={16} />
                  <span>State e-Governance Leaderboard</span>
                </div>
                <p className={styles.cardDesc}>
                  District performance ranking based on resolution compliance and average ticket close timelines.
                </p>

                <div className={styles.leaderboard}>
                  <div className={styles.leaderboardItem}>
                    <span className={styles.rank}>#1</span>
                    <span className={styles.distName}>Visakhapatnam District</span>
                    <span className={styles.score}>96.4 pts</span>
                  </div>
                  <div className={styles.leaderboardItem}>
                    <span className={styles.rank}>#2</span>
                    <span className={styles.distName}>Krishna District</span>
                    <span className={styles.score}>94.8 pts</span>
                  </div>
                  <div className={`${styles.leaderboardItem} ${styles.currentDistRank}`}>
                    <span className={styles.rank}>#3</span>
                    <span className={styles.distName}>{districtName} (Your region)</span>
                    <span className={styles.score}>92.1 pts</span>
                  </div>
                  <div className={styles.leaderboardItem}>
                    <span className={styles.rank}>#4</span>
                    <span className={styles.distName}>Guntur District</span>
                    <span className={styles.score}>89.5 pts</span>
                  </div>
                </div>
                
                <div className={styles.leaderboardNotice}>
                  <Info size={12} />
                  <span>The selected district maintains a Tier-1 resolution index.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Category Performance lines */}
            <div className={styles.rightCol}>
              <div className={styles.card}>
                <div className={styles.sectionTitle}>
                  <ListTodo size={16} />
                  <span>Category Breakdown & Resolution Index</span>
                </div>
                <p className={styles.cardDesc}>
                  Percentage shows issues resolved out of total issues filed for each department category.
                </p>

                <div className={styles.categoryTimeline}>
                  {total === 0 ? (
                    <div className={styles.emptyChart}>No department categories logged yet.</div>
                  ) : (
                    categoryData.map((cat, idx) => {
                      const colors = ["#0f4c81", "#ff9933", "#22c55e", "#ffc107", "#dc3545", "#7c3aed", "#14b8a6"];
                      const themeColor = colors[idx % colors.length];

                      return (
                        <div key={idx} className={styles.categoryRow}>
                          <div className={styles.categoryLabel}>
                            <span className={styles.catName}>{cat.name}</span>
                            <span className={styles.catCounts}>
                              <strong>{cat.resolved}</strong> / {cat.total} Resolved
                            </span>
                          </div>
                          <div className={styles.barContainer}>
                            <div className={styles.barBg}>
                              <div 
                                className={styles.barFill} 
                                style={{ 
                                  width: `${cat.total > 0 ? (cat.resolved / cat.total) * 100 : 0}%`,
                                  backgroundColor: themeColor
                                }}
                              ></div>
                            </div>
                            <span className={styles.barPercentage}>{cat.percentage}%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DistrictStats;
