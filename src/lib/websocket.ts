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
      return Promise.resolve()
    }

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
          // Send pending userId if we have one
          if (this.pendingUserId) {
            console.log('📤 Sending pending userId after reconnect:', this.pendingUserId)
            this.send({
              type: 'authenticate',
              payload: { userId: this.pendingUserId }
            })
          }
          this.connectionHandlers.forEach((handler) => handler())
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.messageHandlers.forEach((handler) => handler(data))
          } catch (e) {
            this.messageHandlers.forEach((handler) => handler(event.data))
          }
        }

        this.ws.onclose = () => {
          this.isConnecting = false
          this.disconnectionHandlers.forEach((handler) => handler())
        }

        this.ws.onerror = (error: ErrorEvent) => {
          this.isConnecting = false
          console.error('WebSocket error:', error)
          this.errorHandlers.forEach((handler) => handler(error))
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  // Send user ID to server to identify this connection
  setUserId(userId: string): void {
    this.pendingUserId = userId
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'authenticate',
        payload: { userId }
      })
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
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
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

export const wsClient = new WebSocketClient('ws://localhost:3002')
