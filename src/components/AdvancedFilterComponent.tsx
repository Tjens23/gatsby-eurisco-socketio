import React, { useState } from "react";
import Card from "./Card";

type SeverityLevel = "all" | "0" | "1" | "2" | "3" | "4" | "5";
type StatusFilter = "all" | "enabled" | "disabled" | "ok" | "problem";

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterState) => void;
  showSeverityFilter?: boolean;
  showStatusFilter?: boolean;
  showSearchFilter?: boolean;
  showHostFilter?: boolean;
  availableHosts?: string[];
}

interface FilterState {
  severity: SeverityLevel;
  status: StatusFilter;
  searchTerm: string;
  selectedHost: string;
  timeRange: string;
}

const severityOptions = [
  { value: "all", label: "All Severities", color: "#6b7280" },
  { value: "0", label: "Not classified", color: "#97ca00" },
  { value: "1", label: "Information", color: "#7499ff" },
  { value: "2", label: "Warning", color: "#ffc859" },
  { value: "3", label: "Average", color: "#ffa059" },
  { value: "4", label: "High", color: "#ff7d5a" },
  { value: "5", label: "Disaster", color: "#ff465c" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
  { value: "ok", label: "OK" },
  { value: "problem", label: "Problem" },
];

const timeRangeOptions = [
  { value: "1h", label: "Last Hour" },
  { value: "6h", label: "Last 6 Hours" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
];

export default function AdvancedFilterComponent({
  onFilterChange,
  showSeverityFilter = true,
  showStatusFilter = true,
  showSearchFilter = true,
  showHostFilter = true,
  availableHosts = [],
}: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    severity: "all",
    status: "all",
    searchTerm: "",
    selectedHost: "",
    timeRange: "24h",
  });

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      severity: "all" as SeverityLevel,
      status: "all" as StatusFilter,
      searchTerm: "",
      selectedHost: "",
      timeRange: "24h",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.severity !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.searchTerm) count++;
    if (filters.selectedHost) count++;
    if (filters.timeRange !== "24h") count++;
    return count;
  };

  return (
    <Card
      title="Advanced Filters"
      subtitle={`${getActiveFilterCount()} active filter${
        getActiveFilterCount() !== 1 ? "s" : ""
      }`}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        {/* Search Filter */}
        {showSearchFilter && (
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              🔍 Search
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              placeholder="Search by name, description..."
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>
        )}

        {/* Severity Filter */}
        {showSeverityFilter && (
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              ⚡ Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => updateFilter("severity", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              {severityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        {showStatusFilter && (
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              📊 Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Host Filter */}
        {showHostFilter && availableHosts.length > 0 && (
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              🖥️ Host
            </label>
            <select
              value={filters.selectedHost}
              onChange={(e) => updateFilter("selectedHost", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="">All Hosts</option>
              {availableHosts.map((host) => (
                <option key={host} value={host}>
                  {host}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Time Range Filter */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            ⏰ Time Range
          </label>
          <select
            value={filters.timeRange}
            onChange={(e) => updateFilter("timeRange", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "white",
            }}
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#f0f9ff",
            borderRadius: "6px",
            border: "1px solid #bae6fd",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "14px" }}>
              Active Filters:
            </span>
            <button
              onClick={clearAllFilters}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Clear All
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {filters.severity !== "all" && (
              <span
                style={{
                  padding: "2px 8px",
                  backgroundColor:
                    severityOptions.find((s) => s.value === filters.severity)
                      ?.color || "#6b7280",
                  color: "white",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                {
                  severityOptions.find((s) => s.value === filters.severity)
                    ?.label
                }
              </span>
            )}
            {filters.status !== "all" && (
              <span
                style={{
                  padding: "2px 8px",
                  backgroundColor: "#6366f1",
                  color: "white",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                Status:{" "}
                {statusOptions.find((s) => s.value === filters.status)?.label}
              </span>
            )}
            {filters.searchTerm && (
              <span
                style={{
                  padding: "2px 8px",
                  backgroundColor: "#059669",
                  color: "white",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                Search: "{filters.searchTerm}"
              </span>
            )}
            {filters.selectedHost && (
              <span
                style={{
                  padding: "2px 8px",
                  backgroundColor: "#7c3aed",
                  color: "white",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                Host: {filters.selectedHost}
              </span>
            )}
            {filters.timeRange !== "24h" && (
              <span
                style={{
                  padding: "2px 8px",
                  backgroundColor: "#ea580c",
                  color: "white",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                Time:{" "}
                {
                  timeRangeOptions.find((t) => t.value === filters.timeRange)
                    ?.label
                }
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export type { FilterState, SeverityLevel, StatusFilter };
