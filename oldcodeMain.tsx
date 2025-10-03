import * as React from "react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { HeadFC, PageProps } from "gatsby";
import Card from "../components/Card";
import SocketDataCard from "../components/SocketDataCard";

const IndexPage: React.FC<PageProps> = () => {
  const [socketData, setSocketData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [allEvents, setAllEvents] = useState<any[]>([]);

  useEffect(() => {
    // Connect to your Socket.IO server (adjust the URL as needed)
    const socket: Socket = io("http://localhost:1337");

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    // Listen for 'data' events
    socket.on("data", (data) => {
      console.log("Received data:", data);
      setSocketData(data);
      setAllEvents((prev) =>
        [...prev, { ...data, receivedAt: new Date().toISOString() }].slice(-10)
      ); // Keep last 10 events
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{ textAlign: "center", marginBottom: "40px", color: "#1f2937" }}
      >
        Socket.IO Real-time Dashboard
      </h1>

      <Card
        title="Connection Status"
        variant={isConnected ? "success" : "error"}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isConnected
            ? "🟢 Connected to Socket.IO Server"
            : "🔴 Disconnected from Server"}
        </div>
        <p style={{ margin: "8px 0 0 0", color: "#6b7280" }}>
          Server: http://localhost:1337
        </p>
      </Card>

      {socketData && (
        <SocketDataCard
          data={socketData.data || socketData}
          timestamp={socketData.timestamp || socketData.receivedAt}
          type={socketData.type}
        />
      )}

      <Card title="Event History" subtitle="Recent events from Strapi backend">
        {allEvents.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {allEvents
              .slice()
              .reverse()
              .map((event, index) => (
                <SocketDataCard
                  key={index}
                  data={event.data}
                  timestamp={event.receivedAt}
                  type={event.type}
                />
              ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <p>No events received yet.</p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>
              Try creating, updating, or deleting content in your Strapi admin
              panel.
            </p>
          </div>
        )}
      </Card>
    </main>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
