interface NotificationPayload {
  userId: string
  eventType: string
  data?: Record<string, any>
}

export async function sendWebSocketNotification(
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const wsServerUrl = process.env.WS_SERVER_URL || 'http://localhost:3001'
    console.log('📤 Sending WebSocket notification to', wsServerUrl, ':', payload)
    
    const response = await fetch(`${wsServerUrl}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error(
        `❌ Failed to send WebSocket notification: ${response.status}`,
        await response.text()
      )
      return false
    }

    const result = await response.json()
    console.log('✅ WebSocket notification sent:', result)
    return true
  } catch (error) {
    console.error('❌ Error sending WebSocket notification:', error)
    return false
  }
}
