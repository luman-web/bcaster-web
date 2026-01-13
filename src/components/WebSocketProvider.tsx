'use client'

import React, { useEffect, useRef, useState } from 'react'
import { wsClient } from '@/lib/websocket'

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    // Only initialize once, even if component mounts twice in dev mode (StrictMode)
    if (initializedRef.current) {
      return
    }
    initializedRef.current = true

    // Connect on mount
    wsClient.connect().catch((error) => {
      console.error('Failed to connect WebSocket:', error)
    })

    // Set up event listeners
    const unsubscribeConnect = wsClient.onConnect(() => {
      setIsConnected(true)
      console.log('WebSocket connected')
    })

    const unsubscribeDisconnect = wsClient.onDisconnect(() => {
      setIsConnected(false)
    })

    const unsubscribeMessage = wsClient.onMessage((data) => {
      console.log('WebSocket message received:', data)
    })

    // Check initial connection state
    if (wsClient.isConnected()) {
      setIsConnected(true)
    }

    // Cleanup on unmount
    return () => {
      unsubscribeConnect()
      unsubscribeDisconnect()
      unsubscribeMessage()
      // Don't disconnect on unmount - keep connection alive for app lifetime
    }
  }, [])

  return <>{children}</>
}
