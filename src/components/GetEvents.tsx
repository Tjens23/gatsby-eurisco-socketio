import React, { useState, useEffect } from "react";
import Card from "./Card";

interface ZabbixEvent {
  acknowledged: string;
  c_eventid: string;
  cause_eventid: string;
  clock: string;
  correlationid: string;
  eventid: string;
  hosts: Array<{
    host: string;
    hostid: string;
    name: string;
  }>;
  name: string;
  ns: string;
  object: string;
  objectid: string;
  opdata: string;
  r_eventid: string;
  severity: string;
  source: string;
  suppressed: string;
  tags: Array<{
    tag: string;
    value: string;
  }>;
  urls: any[];
  userid: string;
  value: string;
}

interface GetEventsProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function GetEvents({
  limit = 10,
  autoRefresh = false,
  refreshInterval = 30000,
}: GetEventsProps) {
  const [events, setEvents] = useState<ZabbixEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://tin.eurisco:8080/getEvents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setEvents(Array.isArray(data) ? data.slice(0, limit) : []);
      setLastFetch(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch events");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    if (autoRefresh) {
      const interval = setInterval(fetchEvents, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, limit]);

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

  if (isLoading && events.length === 0) {
    return (
      <Card title="CCSM Events" subtitle="Loading events from Zabbix...">
        <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="CCSM Events" variant="error">
        <div style={{ color: "#ef4444" }}>Error: {error}</div>
        <button
          onClick={fetchEvents}
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
      title="CCSM Events"
      subtitle={`${events.length} events ${
        lastFetch ? `(last updated: ${lastFetch.toLocaleTimeString()})` : ""
      }`}
    >
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={fetchEvents}
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
          {isLoading ? "Refreshing..." : "Refresh Events"}
        </button>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
          No events found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {events.map((event) => (
            <div
              key={event.eventid}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderLeft: `4px solid ${getSeverityColor(event.severity)}`,
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
                  {event.name}
                </h4>
                <span
                  style={{
                    backgroundColor: getSeverityColor(event.severity),
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {getSeverityText(event.severity)}
                </span>
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "8px",
                }}
              >
                <strong>Host:</strong> {event.hosts?.[0]?.name || "Unknown"} |
                <strong> Time:</strong> {formatTimestamp(event.clock)} |
                <strong> Event ID:</strong> {event.eventid}
              </div>

              {event.tags.length > 0 && (
                <div style={{ marginBottom: "8px" }}>
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        display: "inline-block",
                        backgroundColor: "#e5e7eb",
                        color: "#374151",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        marginRight: "4px",
                        marginBottom: "4px",
                      }}
                    >
                      {tag.tag}: {tag.value}
                    </span>
                  ))}
                </div>
              )}

              {event.opdata && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontFamily: "monospace",
                  }}
                >
                  <strong>Details:</strong> {event.opdata}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
