import React, { useState } from "react";
import Card from "./Card";

interface CCSMApiServiceProps {
  title?: string;
}

interface ApiEndpoint {
  name: string;
  endpoint: string;
  description: string;
  method: string;
}

const availableEndpoints: ApiEndpoint[] = [
  {
    name: "Health Check",
    endpoint: "/healthz",
    description: "Check CCSM gateway health",
    method: "GET",
  },
  {
    name: "Get Events",
    endpoint: "/getEvents",
    description: "Fetch Zabbix events",
    method: "GET",
  },
  {
    name: "Get Hosts",
    endpoint: "/getHosts",
    description: "Fetch Zabbix hosts",
    method: "GET",
  },
  {
    name: "Get Items",
    endpoint: "/getItems",
    description: "Fetch Zabbix items",
    method: "GET",
  },
  {
    name: "Get Triggers",
    endpoint: "/getTriggers",
    description: "Fetch Zabbix triggers",
    method: "GET",
  },
  {
    name: "Get Hostgroups",
    endpoint: "/getHostgroups",
    description: "Fetch Zabbix host groups",
    method: "GET",
  },
  {
    name: "Get Problems",
    endpoint: "/getProblems",
    description: "Fetch Zabbix problems",
    method: "GET",
  },
  {
    name: "Get History",
    endpoint: "/getHistory",
    description: "Fetch Zabbix history data",
    method: "GET",
  },
  {
    name: "Get Trends",
    endpoint: "/getTrends",
    description: "Fetch Zabbix trends data",
    method: "GET",
  },
];

export default function CCSMApiService({
  title = "CCSM Gateway API Explorer",
}: CCSMApiServiceProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(
    null
  );
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestBody, setRequestBody] = useState<string>("{}");

  const executeRequest = async () => {
    if (!selectedEndpoint) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const url = `http://tin.eurisco:8080${selectedEndpoint.endpoint}`;
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (selectedEndpoint.method === "POST" && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title={title} subtitle="Test and explore CCSM Gateway API endpoints">
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}
      >
        {/* Left Panel - Endpoint Selection */}
        <div>
          <h4 style={{ marginTop: "0", marginBottom: "12px" }}>
            Available Endpoints
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {availableEndpoints.map((endpoint) => (
              <button
                key={endpoint.endpoint}
                onClick={() => setSelectedEndpoint(endpoint)}
                style={{
                  padding: "12px",
                  border:
                    selectedEndpoint?.endpoint === endpoint.endpoint
                      ? "2px solid #6366f1"
                      : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor:
                    selectedEndpoint?.endpoint === endpoint.endpoint
                      ? "#f0f9ff"
                      : "#ffffff",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      backgroundColor:
                        endpoint.method === "GET" ? "#10b981" : "#f59e0b",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      marginRight: "8px",
                    }}
                  >
                    {endpoint.method}
                  </span>
                  {endpoint.name}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  {endpoint.endpoint}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    marginTop: "4px",
                  }}
                >
                  {endpoint.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Request/Response */}
        <div>
          {selectedEndpoint ? (
            <>
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>
                  {selectedEndpoint.method} {selectedEndpoint.endpoint}
                </h4>
                <p style={{ margin: "0", fontSize: "14px", color: "#6b7280" }}>
                  {selectedEndpoint.description}
                </p>
              </div>

              {selectedEndpoint.method === "POST" && (
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Request Body (JSON):
                  </label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    style={{
                      width: "100%",
                      height: "100px",
                      padding: "8px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                    placeholder='{"key": "value"}'
                  />
                </div>
              )}

              <button
                onClick={executeRequest}
                disabled={isLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: isLoading ? "#9ca3af" : "#6366f1",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  marginBottom: "16px",
                }}
              >
                {isLoading
                  ? "Executing..."
                  : `Execute ${selectedEndpoint.method}`}
              </button>

              {error && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    padding: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      color: "#ef4444",
                      fontWeight: "bold",
                      marginBottom: "4px",
                    }}
                  >
                    Error:
                  </div>
                  <div style={{ color: "#dc2626", fontSize: "14px" }}>
                    {error}
                  </div>
                </div>
              )}

              {response && (
                <div>
                  <h5 style={{ margin: "0 0 8px 0" }}>Response:</h5>
                  <pre
                    style={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "12px",
                      fontSize: "12px",
                      lineHeight: "1.4",
                      overflow: "auto",
                      maxHeight: "400px",
                    }}
                  >
                    {JSON.stringify(response, null, 2)}
                  </pre>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    Response contains{" "}
                    {Array.isArray(response)
                      ? response.length
                      : Object.keys(response || {}).length}{" "}
                    items
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                color: "#9ca3af",
                fontSize: "16px",
              }}
            >
              Select an endpoint to test
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "#f0f9ff",
          borderRadius: "8px",
          border: "1px solid #bae6fd",
        }}
      >
        <div
          style={{ fontWeight: "bold", marginBottom: "8px", color: "#0369a1" }}
        >
          📚 CCSM Gateway Information
        </div>
        <div style={{ fontSize: "14px", color: "#0c4a6e" }}>
          <p style={{ margin: "4px 0" }}>
            <strong>Gateway URL:</strong> http://tin.eurisco:8080
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>API Documentation:</strong> http://tin.eurisco:8080/docs
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Zabbix API Reference:</strong>{" "}
            https://www.zabbix.com/documentation/current/en/manual/api
          </p>
          <p style={{ margin: "4px 0", fontSize: "12px" }}>
            Note: CCSM endpoint names correspond 1:1 with Zabbix API method
            names (e.g., "getHosts" uses "host.get")
          </p>
        </div>
      </div>
    </Card>
  );
}
