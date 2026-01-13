'use client'

import React, { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { wsClient } from '@/lib/websocket'

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const listenersSetupRef = useRef(false)

  // Set up event listeners once and never remove them
  useEffect(() => {
    if (listenersSetupRef.current) return
    listenersSetupRef.current = true

    wsClient.onConnect(() => {
      // Try to send userId immediately if session is available
      if (session?.user?.id) {
        wsClient.setUserId(session.user.id)
      }
    })

    wsClient.onDisconnect(() => {
      // Connection lost
    })

    wsClient.onMessage((data) => {
      // Message received
    })

    // Try to connect immediately
    wsClient.connect().catch((error) => {
      console.error('🔴 Failed to connect WebSocket:', error)
    })
  }, [])

  // Send userId whenever session changes and connection is ready
  useEffect(() => {
    if (session?.user?.id) {
      // Send immediately - websocket client will buffer if not ready
      wsClient.setUserId(session.user.id)
    }
  }, [session?.user?.id])

  return <>{children}</>
}
