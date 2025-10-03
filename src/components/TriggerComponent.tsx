import React, { useEffect, useState } from "react";
import Card from "./Card";

interface TriggerComponentProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  defaultHost?: string;
}

export default function TriggerComponent(props: TriggerComponentProps) {
  const { limit, autoRefresh, refreshInterval } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triggers, setTriggers] = useState<any[]>([]);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [selectedHost, setSelectedHost] = useState<string>(
    props.defaultHost || ""
  );

  const fetchTriggers = async (host?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = host
        ? `http://tin.eurisco:8080/api/v1/triggers?host=${encodeURIComponent(
            host
          )}`
        : `http://tin.eurisco:8080/api/v1/triggers`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();

      // Client-side limiting since API doesn't accept params
      const limitedData = Array.isArray(result) ? result.slice(0, limit) : [];
      setTriggers(limitedData);
      setLastFetch(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch triggers");
      setTriggers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggers(selectedHost);

    if (autoRefresh) {
      const interval = setInterval(
        () => fetchTriggers(selectedHost),
        refreshInterval
      );
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, limit, selectedHost]);

  const formatTimestamp = (timestamp: string) => {
    const time = parseInt(timestamp) * 1000;
    return new Date(time).toLocaleString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "0":
        return "Enabled";
      case "1":
        return "Disabled";
      default:
        return "Unknown";
    }
  };

  const getValueText = (value: string) => {
    switch (value) {
      case "0":
        return "OK";
      case "1":
        return "Problem";
      default:
        return "Unknown";
    }
  };

  const getValueColor = (value: string) => {
    switch (value) {
      case "0":
        return "#10b981"; // OK - Green
      case "1":
        return "#ef4444"; // Problem - Red
      default:
        return "#6b7280"; // Unknown - Gray
    }
  };

  if (isLoading && triggers.length === 0) {
    return (
      <Card title="CCSM Triggers" subtitle="Loading triggers from Zabbix...">
        <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="CCSM Triggers" variant="error">
        <div style={{ color: "#ef4444" }}>Error: {error}</div>
        <button
          onClick={() => fetchTriggers(selectedHost)}
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
      title="CCSM Triggers"
      subtitle={`${triggers.length} triggers ${
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
          onClick={() => fetchTriggers(selectedHost)}
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
          {isLoading ? "Refreshing..." : "Refresh Triggers"}
        </button>

        <span style={{ fontSize: "14px", color: "#6b7280" }}>
          Showing top {limit} triggers
        </span>
      </div>

      {triggers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
          No triggers found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {triggers.map((trigger) => (
            <div
              key={trigger.triggerid}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderLeft: `4px solid ${getPriorityColor(trigger.priority)}`,
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
                <h4
                  style={{
                    margin: "0",
                    color: "#1f2937",
                    fontSize: "16px",
                    flex: 1,
                    marginRight: "12px",
                  }}
                >
                  {trigger.description}
                </h4>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <span
                    style={{
                      backgroundColor: getValueColor(trigger.value),
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {getValueText(trigger.value)}
                  </span>
                  <span
                    style={{
                      backgroundColor: getPriorityColor(trigger.priority),
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {getPriorityText(trigger.priority)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <strong>Trigger ID:</strong> {trigger.triggerid}
                </div>
                <div>
                  <strong>Status:</strong> {getStatusText(trigger.status)}
                </div>
                <div>
                  <strong>Last Change:</strong>{" "}
                  {formatTimestamp(trigger.lastchange)}
                </div>
              </div>

              {trigger.expression && (
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
                  <strong>Expression:</strong> {trigger.expression}
                </div>
              )}

              {trigger.opdata && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    backgroundColor: "#f3f4f6",
                    padding: "8px",
                    borderRadius: "4px",
                    marginTop: "8px",
                  }}
                >
                  <strong>Operational Data:</strong> {trigger.opdata}
                </div>
              )}

              {trigger.error && (
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
                  <strong>Error:</strong> {trigger.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
