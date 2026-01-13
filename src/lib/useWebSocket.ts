'use client'

import { useEffect, useRef, useCallback } from 'react'
import { wsClient } from '@/lib/websocket'

export function useWebSocket() {
  const connectedRef = useRef(false)

  const connect = useCallback(async () => {
    if (connectedRef.current) return

    try {
      await wsClient.connect()
      connectedRef.current = true
    } catch (error) {
      console.error('WebSocket hook: Failed to connect', error)
    }
  }, [])

  const disconnect = useCallback(() => {
    wsClient.disconnect()
    connectedRef.current = false
  }, [])

  const send = useCallback((data: any) => {
    wsClient.send(data)
  }, [])

  const setUserId = useCallback((userId: string) => {
    wsClient.setUserId(userId)
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    send,
    setUserId,
    onMessage: wsClient.onMessage.bind(wsClient),
    onConnect: wsClient.onConnect.bind(wsClient),
    onDisconnect: wsClient.onDisconnect.bind(wsClient),
    onError: wsClient.onError.bind(wsClient),
    isConnected: wsClient.isConnected.bind(wsClient),
  }
}
