import React from 'react'
import Card from './Card'

interface SocketDataCardProps {
  data: any
  timestamp?: string
  type?: string
}

const SocketDataCard: React.FC<SocketDataCardProps> = ({ data, timestamp, type }) => {
  const getCardVariant = (eventType?: string) => {
    if (!eventType) return 'default'
    
    if (eventType.includes('created')) return 'success'
    if (eventType.includes('deleted')) return 'error'
    if (eventType.includes('updated')) return 'warning'
    return 'default'
  }

  const formatTimestamp = (ts?: string) => {
    if (!ts) return 'Unknown time'
    return new Date(ts).toLocaleString()
  }

  const getEventIcon = (eventType?: string) => {
    if (!eventType) return '📄'
    
    if (eventType.includes('created')) return '✅'
    if (eventType.includes('deleted')) return '🗑️'
    if (eventType.includes('updated')) return '✏️'
    return '📄'
  }

  const formatEventType = (eventType?: string) => {
    if (!eventType) return 'Unknown Event'
    
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <Card
      title={`${getEventIcon(type)} ${formatEventType(type)}`}
      subtitle={`Received at: ${formatTimestamp(timestamp)}`}
      variant={getCardVariant(type)}
    >
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        <pre style={{
          backgroundColor: '#ffffff',
          padding: '12px',
          borderRadius: '4px',
          border: '1px solid #e5e7eb',
          fontSize: '13px',
          lineHeight: '1.4',
          margin: '0',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)}
        </pre>
      </div>
    </Card>
  )
}

export default SocketDataCard