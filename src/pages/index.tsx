import React from "react";
import GetHealth from "../components/GetHealth";
import GetEvents from "../components/GetEvents";
import GetHosts from "../components/GetHosts";
import ProblemsComponent from "../components/ProblemsComponent";
import TriggerComponent from "../components/TriggerComponent";

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
        <GetEvents limit={5} autoRefresh={true} refreshInterval={30000} />
        <GetHosts limit={10} autoRefresh={true} refreshInterval={60000} />
        <ProblemsComponent />
        <TriggerComponent defaultHost="cc-mombat741-un1" />
      </div>
    </div>
  );
}
