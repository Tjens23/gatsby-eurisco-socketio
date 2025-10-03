import React, { useEffect, useState } from "react";
import Card from "./Card";

interface Problem {
  acknowledged: string;
  cause_eventid: string;
  clock: string;
  correlationid: string;
  eventid: string;
  name: string;
  ns: string;
  object: string;
  objectid: string;
  opdata: string;
  r_clock: string;
  r_eventid: string;
  r_ns: string;
  severity: string;
  source: string;
  suppressed: string;
  urls: any[];
  userid: string;
}

interface ProblemsComponentProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  severityFilter?: string;
  statusFilter?: string;
  searchTerm?: string;
  selectedHost?: string;
  timeRange?: string;
}

export default function ProblemsComponent({
  limit = 10,
  autoRefresh = false,
  refreshInterval = 30000,
  severityFilter = "all",
  statusFilter = "all",
  searchTerm = "",
  selectedHost = "",
  timeRange = "24h",
}: ProblemsComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const getProblems = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://tin.eurisco:8080/api/v1/problems", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();

      // Apply filters and then limit
      const filteredData = filterProblems(Array.isArray(result) ? result : []);
      setProblems(filteredData.slice(0, limit));
      setLastFetch(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch problems");
      setProblems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProblems = (problemList: Problem[]) => {
    return problemList.filter((problem) => {
      // Severity filter
      if (severityFilter !== "all" && problem.severity !== severityFilter) {
        return false;
      }

      // Status filter (for problems, we can check acknowledged status)
      if (statusFilter !== "all") {
        if (statusFilter === "ok" && problem.acknowledged !== "0") {
          return false;
        }
        if (statusFilter === "problem" && problem.acknowledged === "0") {
          return false;
        }
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = problem.name.toLowerCase().includes(searchLower);
        const matchesOpData = problem.opdata
          .toLowerCase()
          .includes(searchLower);

        if (!matchesName && !matchesOpData) {
          return false;
        }
      }

      // Time range filter
      if (timeRange !== "all") {
        const problemTime = parseInt(problem.clock) * 1000;
        const now = Date.now();
        const timeRangeMs = getTimeRangeMs(timeRange);

        if (now - problemTime > timeRangeMs) {
          return false;
        }
      }

      return true;
    });
  };

  const getTimeRangeMs = (range: string) => {
    switch (range) {
      case "1h":
        return 60 * 60 * 1000;
      case "6h":
        return 6 * 60 * 60 * 1000;
      case "24h":
        return 24 * 60 * 60 * 1000;
      case "7d":
        return 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return Infinity;
    }
  };

  useEffect(() => {
    getProblems();

    if (autoRefresh) {
      const interval = setInterval(getProblems, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [
    autoRefresh,
    refreshInterval,
    limit,
    severityFilter,
    statusFilter,
    searchTerm,
    selectedHost,
    timeRange,
  ]);

  const formatTimestamp = (clock: string) => {
    const timestamp = parseInt(clock) * 1000;
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "0":
        return "#97ca00"; // Not classified
      case "1":
        return "#7499ff"; // Information
      case "2":
        return "#ffc859"; // Warning
      case "3":
        return "#ffa059"; // Average
      case "4":
        return "#ff7d5a"; // High
      case "5":
        return "#ff465c"; // Disaster
      default:
        return "#83bf69";
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "0":
        return "Not classified";
      case "1":
        return "Information";
      case "2":
        return "Warning";
      case "3":
        return "Average";
      case "4":
        return "High";
      case "5":
        return "Disaster";
      default:
        return "Unknown";
    }
  };

  if (isLoading && problems.length === 0) {
    return (
      <Card title="CCSM Problems" subtitle="Loading problems from Zabbix...">
        <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="CCSM Problems" variant="error">
        <div style={{ color: "#ef4444" }}>Error: {error}</div>
        <button
          onClick={getProblems}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <Card
      title="CCSM Problems"
      subtitle={`${problems.length} problems ${
        lastFetch ? `(last updated: ${lastFetch.toLocaleTimeString()})` : ""
      }`}
    >
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <button
          onClick={getProblems}
          disabled={isLoading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? "Refreshing..." : "Refresh Problems"}
        </button>

        <span style={{ fontSize: "14px", color: "#6b7280" }}>
          Showing top {limit} problems
        </span>
      </div>

      {problems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
          No problems found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {problems.map((problem) => (
            <div
              key={problem.eventid}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderLeft: `4px solid ${getSeverityColor(problem.severity)}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "8px",
                }}
              >
                <h4 style={{ margin: "0", color: "#1f2937", fontSize: "16px" }}>
                  {problem.name}
                </h4>
                <span
                  style={{
                    backgroundColor: getSeverityColor(problem.severity),
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {getSeverityText(problem.severity)}
                </span>
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                }}
              >
                <strong>Time:</strong> {formatTimestamp(problem.clock)} |
                <strong> Event ID:</strong> {problem.eventid} |
                <strong> Acknowledged:</strong>{" "}
                {problem.acknowledged === "1" ? "Yes" : "No"}
              </div>

              {problem.opdata && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontFamily: "monospace",
                    backgroundColor: "#f3f4f6",
                    padding: "8px",
                    borderRadius: "4px",
                    marginTop: "8px",
                  }}
                >
                  <strong>Details:</strong> {problem.opdata}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
