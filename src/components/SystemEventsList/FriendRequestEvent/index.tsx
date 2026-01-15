'use client'

import { useState, useEffect } from 'react'
import { Button, Avatar, message } from 'antd'
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useUserDisplayImage } from '@/hooks/useUserImage'
import { getUserDisplayName } from '@/lib/getUserDisplayName'
import style from './style.module.scss'

interface FriendRequestEventProps {
  event: {
    id: string
    actor_id: string
    related_id: string
    data: {
      requester_id: string
      requester_name: string
      requester_image?: string
    }
    created_at: string
  }
  onAccept?: () => void
  onReject?: () => void
  onRemove?: () => void
}

interface UserData {
  email: string
  name?: string
  surname?: string
  patronymic?: string
}

export default function FriendRequestEvent({
  event,
  onAccept,
  onReject,
  onRemove
}: FriendRequestEventProps) {
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected' | 'removed'>('pending')
  const avatarUrl = useUserDisplayImage(event.data.requester_id)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/${event.data.requester_id}`)
        if (response.ok) {
          const data = await response.json()
          setUserData({
            email: data.email,
            name: data.name,
            surname: data.surname || null,
            patronymic: data.patronymic || null
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    const fetchEdgeStatus = async () => {
      try {
        const response = await fetch(`/api/user/friends/status?user_id=${event.data.requester_id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'rejected') {
            setStatus('rejected')
          } else if (data.status === 'approved') {
            setStatus('accepted')
          }
        }
      } catch (error) {
        console.error('Error fetching edge status:', error)
      } finally {
        setStatusLoading(false)
      }
    }

    fetchUserData()
    fetchEdgeStatus()
  }, [event.data.requester_id])

  const displayName = getUserDisplayName(userData)

  const handleAccept = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edge_id: event.related_id }),
      })

      if (!response.ok) {
        throw new Error('Не удалось принять запрос')
      }

      setStatus('accepted')
      message.success('Добавлен')
      onAccept?.()
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: event.data.requester_id }),
      })

      if (!response.ok) {
        throw new Error('Не удалось отклонить запрос')
      }

      setStatus('rejected')
      message.success('Отклонен')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      // Event removal is handled by parent component
      onRemove?.()
    } catch (error) {
      console.error('Error removing event:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    
    if (isToday) {
      return time
    }
    
    const dateStr = date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
    return `${dateStr} ${time}`
  }

  return (
    <div className={style.eventItem}>
      <div className={style.eventHeader}>
        <Avatar
          src={avatarUrl || undefined}
          size={48}
          className={style.avatar}
        >
          {(displayName || userData?.email || event.data.requester_name)?.[0]?.toUpperCase()}
        </Avatar>

        <div className={style.contentSection}>
          <Link href={`/profile/${event.data.requester_id}`}>
            <strong>{displayName || event.data.requester_name}</strong>
          </Link>

          <div className={style.timestamp}>
            {formatDate(event.created_at)}
          </div>

          <div className={style.statusMessage}>
            {status === 'accepted' && <span className={style.statusAccepted}>Запроас в друзья подтвержден</span>}
            {status === 'rejected' && <span className={style.statusRejected}>Запрос в друзья отклонен</span>}
            {status === 'pending' && <>{' отправил запрос в друзья'}</>}
          </div>
        </div>
      </div>

      {!statusLoading && status === 'pending' && (
        <div className={style.btnHolder}>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            loading={loading}
            onClick={handleAccept}
            className={style.confirmBtn}
          >
            Подтвердить
          </Button>
          <Button
            type="default"
            size="small"
            loading={loading}
            onClick={handleReject}
            className={style.rejectBtn}
          >
            Отклонить
          </Button>
        </div>
      )}
    </div>
  )
}
