'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Empty, Spin } from 'antd'
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

  const handleEventRemove = async (eventId: string) => {
    try {
      // Delete from database first
      const response = await fetch(`/api/system-events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        console.error('Failed to delete event')
        return
      }

      // Remove from UI state only after successful deletion
      setEvents(prev => prev.filter(e => e.id !== eventId))
      
      // Trigger parent re-render to update event count
      if (onOpen) {
        onOpen()
      }
    } catch (error) {
      console.error('Error removing event:', error)
    }
  }

  const renderEventComponent = (event: SystemEvent) => {
    switch (event.event_type) {
      case 'friend.request':
        return (
          <div key={event.id} data-event-id={event.id} className={style.eventWrapper}>
            <button
              className={style.removeEventBtn}
              onClick={() => handleEventRemove(event.id)}
              title="Удалить уведомление"
              aria-label="Delete notification"
            >
              ×
            </button>
            <FriendRequestEvent
              event={event}
              onAccept={() => {
                // Refresh events to update status
                fetchEvents()
              }}
              onReject={() => {
                // Refresh events to update status
                fetchEvents()
              }}
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
        <div className={style.loading}>
          <Spin />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={style.container}>
      {events.length === 0 ? (
        <div className={style.empty}><Empty description="Нет уведомлений" /></div>
      ) : (
        <div className={style.list}>
          {events.map(event => renderEventComponent(event))}
        </div>
      )}
    </div>
  )
}

export default SystemEventsList
