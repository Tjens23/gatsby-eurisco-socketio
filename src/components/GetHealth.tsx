import React, { useEffect, useState } from "react";
export default function GetHealth() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getHealth();
  }, []);

  if (isLoading) return <div>Loading health status...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!data) return <div>No data found!</div>;

  return (
    <div>
      <h2>Health Status</h2>
      <pre style={{ background: "#f4f4f4", padding: 12, borderRadius: 6 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
