'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Empty, Spin } from 'antd'
import { useWebSocket } from '@/lib/useWebSocket'
import FriendRequestEvent from './FriendRequestEvent'
import style from './style.module.scss'

interface SystemEvent {
  id: string
  event_type: string
  actor_id: string
  related_id: string
  data: any
  is_read: boolean
  created_at: string
}

const SystemEventsList: React.FC<{ onOpen?: () => void }> = ({ onOpen }) => {
  const [events, setEvents] = useState<SystemEvent[]>([])
  const [loading, setLoading] = useState(true)
  const { onMessage } = useWebSocket()
  const containerRef = useRef<HTMLDivElement>(null)

  // Mark all unread events as read when dropdown opens
  const markUnreadAsRead = useCallback(async () => {
    const unreadEventIds = events
      .filter(e => !e.is_read)
      .map(e => e.id)

    if (unreadEventIds.length === 0) return

    await markEventsAsRead(unreadEventIds)
  }, [events])

  // Fetch events on mount
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/system-events?limit=100')
      if (response.ok) {
        const data = await response.json()
        // Show all events (both read and unread)
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Error fetching system events:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (onOpen) {
      onOpen()
      markUnreadAsRead()
    }
  }, [onOpen, markUnreadAsRead])

  // Listen for real-time WebSocket messages
  useEffect(() => {
    const unsubscribe = onMessage((data) => {
      if (data.eventType === 'friend.request' || data.type === 'friend.request') {
        // Add new event to the top of the list
        const newEvent: SystemEvent = {
          id: Math.random().toString(36),
          event_type: 'friend.request',
          actor_id: data.payload?.requester_id || data.data?.requester_id,
          related_id: '',
          data: data.payload || data.data,
          is_read: false,
          created_at: new Date().toISOString()
        }
        setEvents(prev => [newEvent, ...prev])
      }
    })

    return unsubscribe
  }, [onMessage])

  // Mark event as viewed using Intersection Observer
  useEffect(() => {
    return () => {
      // Cleanup
    }
  }, [])

  const markEventsAsRead = async (eventIds: string[]) => {
    try {
      const response = await fetch('/api/system-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_ids: eventIds }),
      })

      if (!response.ok) {
        console.error('Failed to mark events as read')
        return false
      }

      return true
    } catch (error) {
      console.error('Error marking events as read:', error)
      return false
    }
  }

  const handleEventRemove = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
  }

  const renderEventComponent = (event: SystemEvent) => {
    switch (event.event_type) {
      case 'friend.request':
        return (
          <div key={event.id} data-event-id={event.id}>
            <FriendRequestEvent
              event={event}
              onAccept={() => handleEventRemove(event.id)}
              onReject={() => handleEventRemove(event.id)}
            />
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className={style.container}>
        <Spin />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={style.container}>
      {events.length === 0 ? (
        <Empty description="Нет уведомлений" />
      ) : (
        <div className={style.list}>
          {events.map(event => renderEventComponent(event))}
        </div>
      )}
    </div>
  )
}

export default SystemEventsList
