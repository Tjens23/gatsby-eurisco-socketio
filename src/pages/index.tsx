import React from "react";
import GetHealth from "../components/GetHealth";
import FilterComponent from "../components/FilterComponent";

export default function Home() {
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{ textAlign: "center", marginBottom: "40px", color: "#1f2937" }}
      >
        CCSM Gateway Dashboard
      </h1>

      <div style={{ display: "grid", gap: "24px" }}>
        <GetHealth />
        <FilterComponent defaultFilter="all" />
      </div>
    </div>
  );
}
