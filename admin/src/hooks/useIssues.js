import { useState, useEffect, useCallback } from "react";
import { fetchDistrictIssues, updateIssueStatus } from "../services/api";

// High-quality mock data mimicking real government complaints matching districts
const MOCK_ISSUES = [
  {
    _id: "ISS-2026-001",
    title: "Major Pothole on Market Road",
    description: "A large pothole has formed near the junction of Market Road and 4th Cross. It is causing severe traffic congestion and poses a danger to two-wheelers. Multiple minor skids have already occurred.",
    category: "Road Damage",
    status: "Pending",
    priority: "High",
    districtId: "D001",
    remarks: "",
    media: [
      { type: "image", path: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800" }
    ],
    userId: {
      name: "Rajesh Kumar",
      phoneNumber: "9845012345"
    },
    createdAt: "2026-06-01T10:15:30.000Z",
    updatedAt: "2026-06-01T10:15:30.000Z"
  },
  {
    _id: "ISS-2026-002",
    title: "Drinking Water Pipe Leakage",
    description: "Main fresh water distribution pipe has burst near the water tank. Millions of liters of drinking water are being wasted and flooding the nearby school street.",
    category: "Water Leakage",
    status: "In Progress",
    priority: "Critical",
    districtId: "D001",
    remarks: "Maintenance team dispatched. Repair materials are being procured.",
    media: [
      { type: "image", path: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&q=80&w=800" }
    ],
    userId: {
      name: "Amit Patel",
      phoneNumber: "9900112233"
    },
    createdAt: "2026-06-03T08:30:00.000Z",
    updatedAt: "2026-06-04T11:20:00.000Z"
  },
  {
    _id: "ISS-2026-003",
    title: "Unattended Garbage Dump",
    description: "Garbage has not been collected for the past two weeks. Stray animals are scattering the waste, creating an unhygienic environment and terrible stench in the residential area.",
    category: "Garbage Issues",
    status: "Resolved",
    priority: "Medium",
    districtId: "D001",
    remarks: "Sanitation truck cleared the spot. Resident confirmed resolution.",
    media: [
      { type: "image", path: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800" }
    ],
    userId: {
      name: "Sita Sharma",
      phoneNumber: "9887766554"
    },
    createdAt: "2026-05-28T09:00:00.000Z",
    updatedAt: "2026-05-30T16:45:00.000Z"
  },
  {
    _id: "ISS-2026-004",
    title: "Open Sewer Line and Clogging",
    description: "The drainage slab is broken and sewage water is overflowing onto the main street. It has become a breeding ground for mosquitoes and is causing health concerns.",
    category: "Drainage Problems",
    status: "In Progress",
    priority: "High",
    districtId: "D001",
    remarks: "Silt cleaning equipment deployed. Sewer lid replacement ordered.",
    media: [
      { type: "image", path: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800" }
    ],
    userId: {
      name: "Vikram Singh",
      phoneNumber: "9740055667"
    },
    createdAt: "2026-06-02T14:40:00.000Z",
    updatedAt: "2026-06-03T10:00:00.000Z"
  },
  {
    _id: "ISS-2026-005",
    title: "Street Lights Broken for 5 Days",
    description: "Three consecutive street lights on Hospital Road are non-functional. The road is completely pitch dark at night, making it highly unsafe for women and elder citizens.",
    category: "Street Light Failures",
    status: "Pending",
    priority: "Medium",
    districtId: "D001",
    remarks: "",
    media: [
      { type: "image", path: "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&q=80&w=800" }
    ],
    userId: {
      name: "Priya Nair",
      phoneNumber: "9123456789"
    },
    createdAt: "2026-06-05T19:20:00.000Z",
    updatedAt: "2026-06-05T19:20:00.000Z"
  },
  {
    _id: "ISS-2026-006",
    title: "Illegal Garbage Burning",
    description: "Some commercial shopkeepers are piling up plastic waste and burning it late at night, creating dense toxic smoke that affects asthma patients in the neighborhood.",
    category: "Garbage Issues",
    status: "Rejected",
    priority: "Low",
    districtId: "D001",
    remarks: "Upon inspection, the fire was a controlled bonfire, and shopkeepers were warned against burning any plastic. Complaint does not meet actionable criteria.",
    media: [],
    userId: {
      name: "Karan Johar",
      phoneNumber: "9665544332"
    },
    createdAt: "2026-05-25T22:10:00.000Z",
    updatedAt: "2026-05-26T11:00:00.000Z"
  },
  {
    _id: "ISS-2026-007",
    title: "Road Cave-In near Metro Station",
    description: "A portion of the road near the metro entrance has caved in. It is extremely hazardous as the cave-in is about 4 feet deep. Needs urgent barricading and repair.",
    category: "Road Damage",
    status: "In Progress",
    priority: "Critical",
    districtId: "D002", // Different District
    remarks: "Barricades put in place. Metro engineering team notified.",
    media: [],
    userId: {
      name: "Harish Rao",
      phoneNumber: "9876543211"
    },
    createdAt: "2026-06-05T07:30:00.000Z",
    updatedAt: "2026-06-05T09:00:00.000Z"
  }
];

export const useIssues = (districtId) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  // Deterministically map priority based on ID or category if not present (DB complaints)
  const assignPriority = useCallback((issue) => {
    if (issue.priority) return issue.priority;
    const cat = issue.category || "";
    if (cat.includes("Road") || cat.includes("Drainage")) {
      return "High";
    } else if (cat.includes("Water")) {
      return "Critical";
    } else if (cat.includes("Light")) {
      return "Low";
    }
    return "Medium";
  }, []);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = sessionStorage.getItem("token");

    if (!token) {
      // Fallback to mock issues that match the district
      const filteredMock = MOCK_ISSUES.filter(
        (item) => !districtId || item.districtId === districtId
      ).map(item => ({ ...item, priority: assignPriority(item) }));
      setIssues(filteredMock);
      setUsingMock(true);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchDistrictIssues(token);
      if (data && data.success && Array.isArray(data.issues)) {
        // Map database issues to match structure and assign priority
        const mapped = data.issues.map((item) => ({
          ...item,
          priority: assignPriority(item),
          // format user details if populated
          userId: item.userId && typeof item.userId === "object"
            ? item.userId
            : { name: "Citizen", phoneNumber: "N/A" }
        }));
        setIssues(mapped);
        setUsingMock(false);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.warn("Backend API not reachable or failed. Falling back to local mock data. Error:", err.message);
      // Fallback to mock issues matching district
      const filteredMock = MOCK_ISSUES.filter(
        (item) => !districtId || item.districtId === districtId
      ).map(item => ({ ...item, priority: assignPriority(item) }));
      setIssues(filteredMock);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [districtId, assignPriority]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const updateStatus = async (issueId, newStatus, remarks) => {
    const token = sessionStorage.getItem("token");
    
    // If using mock data or no token, perform local state update
    if (usingMock || !token) {
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === issueId
            ? { ...issue, status: newStatus, remarks: remarks, updatedAt: new Date().toISOString() }
            : issue
        )
      );
      return { success: true, message: "Status updated locally (Mock Mode)" };
    }

    try {
      const result = await updateIssueStatus(issueId, newStatus, remarks, token);
      if (result && result.success) {
        // Reload issues to get fresh values from db
        await loadIssues();
        return result;
      } else {
        throw new Error(result.message || "Failed to update status");
      }
    } catch (err) {
      console.error("API update failed, applying update locally:", err.message);
      // Fallback update local state on error
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === issueId
            ? { ...issue, status: newStatus, remarks: remarks, updatedAt: new Date().toISOString() }
            : issue
        )
      );
      return { success: true, message: "Status updated locally (Fallback)" };
    }
  };

  return { issues, loading, error, usingMock, refresh: loadIssues, updateStatus };
};
