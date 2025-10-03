import React, { useState, useEffect } from "react";
import Card from "./Card";

interface Host {
  hostid: string;
  host: string;
  name: string;
  status: string;
  available: string;
  error: string;
  errors_from: string;
  lastaccess: string;
  ipmi_available: string;
  snmp_available: string;
  jmx_available: string;
  flags: string;
  inventory_mode: string;
  tls_connect: string;
  tls_accept: string;
}

interface GetHostsProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function GetHosts({
  limit = 20,
  autoRefresh = false,
  refreshInterval = 60000,
}: GetHostsProps) {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchHosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://tin.eurisco:8080/api/v1/hosts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setHosts(Array.isArray(data) ? data.slice(0, limit) : []);
      setLastFetch(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch hosts");
      setHosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();

    if (autoRefresh) {
      const interval = setInterval(fetchHosts, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, limit]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "0":
        return "#10b981"; // Monitored
      case "1":
        return "#ef4444"; // Unmonitored
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "0":
        return "Monitored";
      case "1":
        return "Unmonitored";
      default:
        return "Unknown";
    }
  };

  const getAvailabilityColor = (available: string) => {
    switch (available) {
      case "1":
        return "#10b981"; // Available
      case "2":
        return "#ef4444"; // Unavailable
      default:
        return "#f59e0b"; // Unknown
    }
  };

  const getAvailabilityText = (available: string) => {
    switch (available) {
      case "1":
        return "Available";
      case "2":
        return "Unavailable";
      default:
        return "Unknown";
    }
  };

  if (isLoading && hosts.length === 0) {
    return (
      <Card title="CCSM Hosts" subtitle="Loading hosts from Zabbix...">
        <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="CCSM Hosts" variant="error">
        <div style={{ color: "#ef4444" }}>Error: {error}</div>
        <button
          onClick={fetchHosts}
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
      title="CCSM Hosts"
      subtitle={`${hosts.length} hosts ${
        lastFetch ? `(last updated: ${lastFetch.toLocaleTimeString()})` : ""
      }`}
    >
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={fetchHosts}
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
          {isLoading ? "Refreshing..." : "Refresh Hosts"}
        </button>
      </div>

      {hosts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
          No hosts found.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "12px",
          }}
        >
          {hosts.map((host) => (
            <div
              key={host.hostid}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderLeft: `4px solid ${getAvailabilityColor(host.available)}`,
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
                  {host.name || host.host}
                </h4>
                <span
                  style={{
                    backgroundColor: getStatusColor(host.status),
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {getStatusText(host.status)}
                </span>
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <strong>Host ID:</strong> {host.hostid}
                </div>
                <div>
                  <strong>Hostname:</strong> {host.host}
                </div>
                <div>
                  <strong>Availability:</strong>
                  <span
                    style={{
                      color: getAvailabilityColor(host.available),
                      fontWeight: "bold",
                      marginLeft: "4px",
                    }}
                  >
                    {getAvailabilityText(host.available)}
                  </span>
                </div>
              </div>

              {host.error && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#ef4444",
                    backgroundColor: "#fef2f2",
                    padding: "8px",
                    borderRadius: "4px",
                    marginTop: "8px",
                  }}
                >
                  <strong>Error:</strong> {host.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
