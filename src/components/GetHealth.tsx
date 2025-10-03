import React, { useEffect, useState } from "react";
import Card from "./Card";

interface HealthData {
  status?: string;
  timestamp?: string;
  version?: string;
  uptime?: number;
  services?: Array<{
    name: string;
    status: string;
    responseTime?: number;
  }>;
  database?: {
    status: string;
    connectionPool?: {
      active: number;
      idle: number;
      total: number;
    };
  };
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  [key: string]: any;
}

export default function GetHealth() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const getHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://tin.eurisco:8080/healthz", {
        method: "GET",
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const result = await response.json();
      setData(result);
      setLastFetch(new Date());
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(getHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "healthy":
      case "ok":
      case "up":
      case "running":
        return "#10b981"; // Green
      case "degraded":
      case "warning":
        return "#f59e0b"; // Yellow
      case "unhealthy":
      case "down":
      case "error":
      case "failed":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "healthy":
      case "ok":
      case "up":
      case "running":
        return "✅";
      case "degraded":
      case "warning":
        return "⚠️";
      case "unhealthy":
      case "down":
      case "error":
      case "failed":
        return "❌";
      default:
        return "❓";
    }
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 3600));
    const hours = Math.floor((uptime % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatMemoryUsage = (memory: any) => {
    if (!memory) return null;
    const usedMB = Math.round(memory.used / 1024 / 1024);
    const totalMB = Math.round(memory.total / 1024 / 1024);
    const percentage = memory.percentage || (memory.used / memory.total) * 100;

    return { usedMB, totalMB, percentage: Math.round(percentage) };
  };

  if (isLoading && !data) {
    return (
      <Card title="🏥 CCSM Gateway Health" subtitle="Checking system health...">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            fontSize: "16px",
            color: "#6b7280",
          }}
        >
          <div style={{ marginRight: "12px", fontSize: "20px" }}>⏳</div>
          Loading health status...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="🏥 CCSM Gateway Health" variant="error">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            backgroundColor: "#fef2f2",
            borderRadius: "8px",
            border: "1px solid #fecaca",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#dc2626",
                marginBottom: "8px",
              }}
            >
              ❌ Health Check Failed
            </div>
            <div style={{ color: "#7f1d1d", fontSize: "14px" }}>{error}</div>
          </div>
          <button
            onClick={getHealth}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              fontWeight: "bold",
            }}
          >
            {isLoading ? "Retrying..." : "Retry"}
          </button>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card title="🏥 CCSM Gateway Health" variant="warning">
        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
          No health data available
        </div>
      </Card>
    );
  }

  const overallStatus = data.status || "unknown";
  const cardVariant =
    overallStatus.toLowerCase() === "healthy" ||
    overallStatus.toLowerCase() === "ok"
      ? "success"
      : overallStatus.toLowerCase() === "degraded"
      ? "warning"
      : "error";

  return (
    <Card
      title="🏥 CCSM Gateway Health"
      subtitle={`Last updated: ${lastFetch?.toLocaleTimeString() || "Unknown"}`}
      variant={cardVariant}
    >
      {/* Overall Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          padding: "20px",
          backgroundColor:
            overallStatus.toLowerCase() === "healthy"
              ? "#f0fdf4"
              : overallStatus.toLowerCase() === "degraded"
              ? "#fffbeb"
              : "#fef2f2",
          borderRadius: "8px",
          border: `2px solid ${getStatusColor(overallStatus)}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "32px" }}>
            {getStatusIcon(overallStatus)}
          </span>
          <div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: getStatusColor(overallStatus),
              }}
            >
              {overallStatus.toUpperCase()}
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              Gateway Status
            </div>
          </div>
        </div>

        <button
          onClick={getHealth}
          disabled={isLoading}
          style={{
            padding: "10px 16px",
            backgroundColor: getStatusColor(overallStatus),
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          🔄 {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* System Information Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Version Info */}
        {data.version && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>📦</span>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                Version
              </span>
            </div>
            <div
              style={{
                fontSize: "16px",
                fontFamily: "monospace",
                color: "#374151",
              }}
            >
              {data.version}
            </div>
          </div>
        )}

        {/* Uptime */}
        {data.uptime !== undefined && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>⏱️</span>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                Uptime
              </span>
            </div>
            <div
              style={{ fontSize: "16px", color: "#059669", fontWeight: "bold" }}
            >
              {formatUptime(data.uptime)}
            </div>
          </div>
        )}

        {/* Memory Usage */}
        {data.memory && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>💾</span>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                Memory
              </span>
            </div>
            {(() => {
              const memory = formatMemoryUsage(data.memory);
              return memory ? (
                <div>
                  <div style={{ fontSize: "14px", color: "#374151" }}>
                    {memory.usedMB}MB / {memory.totalMB}MB
                  </div>
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "4px",
                      height: "8px",
                      marginTop: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${memory.percentage}%`,
                        backgroundColor:
                          memory.percentage > 80
                            ? "#ef4444"
                            : memory.percentage > 60
                            ? "#f59e0b"
                            : "#10b981",
                        height: "100%",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "4px",
                    }}
                  >
                    {memory.percentage}% used
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Services Status */}
      {data.services && data.services.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h4
            style={{
              margin: "0 0 12px 0",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            🔧 Services Status
          </h4>
          <div style={{ display: "grid", gap: "8px" }}>
            {data.services.map((service: any, index: number) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>{getStatusIcon(service.status)}</span>
                  <span style={{ fontWeight: "500" }}>{service.name}</span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  {service.responseTime && (
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      {service.responseTime}ms
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: getStatusColor(service.status),
                    }}
                  >
                    {service.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data (Collapsible) */}
      <details style={{ marginTop: "20px" }}>
        <summary
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            color: "#6b7280",
            padding: "8px 0",
          }}
        >
          🔍 View Raw Health Data
        </summary>
        <pre
          style={{
            backgroundColor: "#f8fafc",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "12px",
            overflow: "auto",
            marginTop: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </Card>
  );
}
