import * as React from "react"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import type { HeadFC, PageProps } from "gatsby"

const IndexPage: React.FC<PageProps> = () => {
  const [socketData, setSocketData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [allEvents, setAllEvents] = useState<any[]>([]);

  useEffect(() => {
    // Connect to your Socket.IO server (adjust the URL as needed)
    const socket: Socket = io("http://localhost:1337");

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    // Listen for 'data' events
    socket.on("data", (data) => {
      console.log('Received data:', data);
      setSocketData(data);
      setAllEvents(prev => [...prev, { ...data, receivedAt: new Date().toISOString() }].slice(-10)); // Keep last 10 events
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main>
      <div style={{ marginBottom: 32 }}>
        <h2>Socket.IO Connection Status:</h2>
        <p style={{ 
          color: isConnected ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {isConnected ? '✅ Connected' : '❌ Disconnected'}
        </p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2>Latest Socket.IO Data:</h2>
        {socketData ? (
          <pre style={{ background: '#f4f4f4', padding: 16, borderRadius: 8 }}>
            {typeof socketData === 'object' ? JSON.stringify(socketData, null, 2) : String(socketData)}
          </pre>
        ) : (
          <span>No data received yet.</span>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2>Recent Events (Last 10):</h2>
        {allEvents.length > 0 ? (
          <div>
            {allEvents.map((event, index) => (
              <div key={index} style={{ 
                background: '#f9f9f9', 
                margin: '8px 0', 
                padding: '12px', 
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <strong>{event.type}</strong> - {event.receivedAt}
                <pre style={{ fontSize: '12px', marginTop: '8px' }}>
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <span>No events received yet.</span>
        )}
      </div>
     
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Home Page</title>
