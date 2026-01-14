import ReconnectingWebSocket from 'reconnecting-websocket'
import { ErrorEvent } from 'reconnecting-websocket'

export class WebSocketClient {
  private ws: ReconnectingWebSocket | null = null
  private url: string
  private isConnecting = false
  private messageHandlers: ((data: any) => void)[] = []
  private connectionHandlers: (() => void)[] = []
  private disconnectionHandlers: (() => void)[] = []
  private errorHandlers: ((error: ErrorEvent) => void)[] = []
  private pendingUserId: string | null = null

  constructor(url: string) {
    this.url = url
  }

  connect(): Promise<void> {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      // console.log('🔌 WebSocket already connected or connecting')
      return Promise.resolve()
    }

    // console.log('🔌 WebSocket connecting to:', this.url)
    this.isConnecting = true

    return new Promise((resolve, reject) => {
      try {
        this.ws = new ReconnectingWebSocket(this.url, [], {
          maxReconnectionDelay: 10000,
          minReconnectionDelay: 1000,
          reconnectionDelayGrowFactor: 1.5,
          maxRetries: 10,
          debug: false,
        })

        this.ws.onopen = () => {
          this.isConnecting = false
          // console.log('✅ WebSocket connected')
          // Send pending userId if we have one
          if (this.pendingUserId) {
            // console.log('📤 Sending pending userId after reconnect:', this.pendingUserId)
            this.send({
              type: 'authenticate',
              payload: { userId: this.pendingUserId }
            })
          }
          this.connectionHandlers.forEach((handler) => handler())
          resolve()
        }

        this.ws.onmessage = (event) => {
          // console.log('📨 WebSocket message received:', event.data)
          try {
            const data = JSON.parse(event.data)
            this.messageHandlers.forEach((handler) => handler(data))
          } catch (e) {
            this.messageHandlers.forEach((handler) => handler(event.data))
          }
        }

        this.ws.onclose = () => {
          this.isConnecting = false
          // console.log('❌ WebSocket disconnected')
          this.disconnectionHandlers.forEach((handler) => handler())
        }

        this.ws.onerror = (error: ErrorEvent) => {
          this.isConnecting = false
          console.error('⚠️ WebSocket error:', error)
          this.errorHandlers.forEach((handler) => handler(error))
        }
      } catch (error) {
        this.isConnecting = false
        console.error('⚠️ WebSocket connection error:', error)
        reject(error)
      }
    })
  }

  // Send user ID to server to identify this connection
  setUserId(userId: string): void {
    // console.log('🔐 Setting userId:', userId)
    this.pendingUserId = userId
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // console.log('📤 Sending userId immediately (connection active)')
      this.send({
        type: 'authenticate',
        payload: { userId }
      })
    } else {
      // console.log('⏳ userId pending until connection established')
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // console.log('📨 Sending:', data)
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('⚠️ Cannot send - WebSocket not connected')
    }
  }

  onMessage(handler: (data: any) => void): () => void {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
    }
  }

  onConnect(handler: () => void): () => void {
    this.connectionHandlers.push(handler)
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler)
    }
  }

  onDisconnect(handler: () => void): () => void {
    this.disconnectionHandlers.push(handler)
    return () => {
      this.disconnectionHandlers = this.disconnectionHandlers.filter((h) => h !== handler)
    }
  }

  onError(handler: (error: ErrorEvent) => void): () => void {
    this.errorHandlers.push(handler)
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler)
    }
  }

  disconnect(): void {
    if (this.ws) {
      // console.log('🔌 Disconnecting WebSocket')
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    const connected = this.ws !== null && this.ws.readyState === WebSocket.OPEN
    // console.log('🔍 WebSocket connection status:', connected)
    return connected
  }
}

export const wsClient = new WebSocketClient(process.env.WS_URL || 'ws://localhost:3002')
