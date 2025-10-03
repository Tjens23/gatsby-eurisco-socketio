import React, { useState } from "react";
import Card from "./Card";
import GetEvents from "./GetEvents";
import GetHosts from "./GetHosts";
import ProblemsComponent from "./ProblemsComponent";
import TriggerComponent from "./TriggerComponent";
import AdvancedFilterComponent, {
  FilterState,
} from "./AdvancedFilterComponent";

type FilterType = "events" | "problems" | "triggers" | "hosts" | "all";

interface FilterComponentProps {
  defaultFilter?: FilterType;
  showHealthCheck?: boolean;
}

interface FilterOption {
  id: FilterType;
  label: string;
  description: string;
  icon: string;
}

const filterOptions: FilterOption[] = [
  {
    id: "all",
    label: "All Components",
    description: "Show all monitoring components",
    icon: "📊",
  },
  {
    id: "events",
    label: "Events",
    description: "Show recent Zabbix events",
    icon: "📋",
  },
  {
    id: "problems",
    label: "Problems",
    description: "Show active problems",
    icon: "⚠️",
  },
  {
    id: "triggers",
    label: "Triggers",
    description: "Show trigger status",
    icon: "🎯",
  },
  {
    id: "hosts",
    label: "Hosts",
    description: "Show monitored hosts",
    icon: "🖥️",
  },
];

export default function FilterComponent({
  defaultFilter = "all",
  showHealthCheck = true,
}: FilterComponentProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>(defaultFilter);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    severity: "all",
    status: "all",
    searchTerm: "",
    selectedHost: "",
    timeRange: "24h",
  });

  const handleAdvancedFilterChange = (filters: FilterState) => {
    setAdvancedFilters(filters);
  };

  const renderFilterButtons = () => (
    <Card
      title="Dashboard Filter"
      subtitle="Select what monitoring data to display"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        {filterOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setActiveFilter(option.id)}
            style={{
              padding: "16px",
              border:
                activeFilter === option.id
                  ? "2px solid #6366f1"
                  : "1px solid #e5e7eb",
              borderRadius: "8px",
              backgroundColor:
                activeFilter === option.id ? "#f0f9ff" : "#ffffff",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "bold",
                fontSize: "16px",
                color: activeFilter === option.id ? "#1e40af" : "#1f2937",
              }}
            >
              <span style={{ fontSize: "20px" }}>{option.icon}</span>
              {option.label}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.4",
              }}
            >
              {option.description}
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          padding: "12px",
          backgroundColor: "#f3f4f6",
          borderRadius: "6px",
          fontSize: "14px",
          color: "#4b5563",
        }}
      >
        <strong>Active View:</strong>{" "}
        {filterOptions.find((f) => f.id === activeFilter)?.label} -
        {filterOptions.find((f) => f.id === activeFilter)?.description}
      </div>
    </Card>
  );

  const shouldShowAdvancedFilters = () => {
    return activeFilter !== "all" && activeFilter !== "hosts";
  };

  const getFilterProps = () => {
    const baseProps = {
      limit: activeFilter === "all" ? 5 : 15,
      autoRefresh: true,
      refreshInterval: 30000,
    };

    // Add filter-specific props based on advanced filters
    if (advancedFilters.selectedHost) {
      return {
        ...baseProps,
        hosts: [advancedFilters.selectedHost],
        defaultHost: advancedFilters.selectedHost,
      };
    }

    return baseProps;
  };

  const renderContent = () => {
    const filterProps = getFilterProps();

    switch (activeFilter) {
      case "events":
        return (
          <div style={{ display: "grid", gap: "24px" }}>
            {shouldShowAdvancedFilters() && (
              <AdvancedFilterComponent
                onFilterChange={handleAdvancedFilterChange}
                showSeverityFilter={true}
                showStatusFilter={false}
                showSearchFilter={true}
                showHostFilter={true}
                availableHosts={[
                  "server1.example.com",
                  "server2.example.com",
                  "database.local",
                ]}
              />
            )}
            <GetEvents {...filterProps} />
          </div>
        );

      case "problems":
        return (
          <div style={{ display: "grid", gap: "24px" }}>
            {shouldShowAdvancedFilters() && (
              <AdvancedFilterComponent
                onFilterChange={handleAdvancedFilterChange}
                showSeverityFilter={true}
                showStatusFilter={true}
                showSearchFilter={true}
                showHostFilter={true}
                availableHosts={[
                  "server1.example.com",
                  "server2.example.com",
                  "database.local",
                ]}
              />
            )}
            <ProblemsComponent {...filterProps} />
          </div>
        );

      case "triggers":
        return (
          <div style={{ display: "grid", gap: "24px" }}>
            {shouldShowAdvancedFilters() && (
              <AdvancedFilterComponent
                onFilterChange={handleAdvancedFilterChange}
                showSeverityFilter={true}
                showStatusFilter={true}
                showSearchFilter={true}
                showHostFilter={true}
                availableHosts={[
                  "server1.example.com",
                  "server2.example.com",
                  "database.local",
                ]}
              />
            )}
            <TriggerComponent {...filterProps} />
          </div>
        );

      case "hosts":
        return (
          <div style={{ display: "grid", gap: "24px" }}>
            <GetHosts limit={20} autoRefresh={true} refreshInterval={60000} />
          </div>
        );

      case "all":
      default:
        return (
          <div style={{ display: "grid", gap: "24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "24px",
              }}
            >
              <GetEvents limit={5} autoRefresh={true} refreshInterval={30000} />
              <ProblemsComponent
                limit={5}
                autoRefresh={true}
                refreshInterval={30000}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "24px",
              }}
            >
              <TriggerComponent
                limit={5}
                autoRefresh={true}
                refreshInterval={30000}
              />
              <GetHosts limit={8} autoRefresh={true} refreshInterval={60000} />
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {renderFilterButtons()}
      {renderContent()}
    </div>
  );
}
