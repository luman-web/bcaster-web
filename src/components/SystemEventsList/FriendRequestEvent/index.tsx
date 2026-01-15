'use client'

import { useState, useEffect } from 'react'
import { Button, Space, Avatar, message } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { getUserDisplayImage } from '@/lib/generateAvatar'
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

export default function FriendRequestEvent({
  event,
  onAccept,
  onReject,
  onRemove
}: FriendRequestEventProps) {
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Fetch requester's display image (profile thumbnail or generated avatar)
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const url = await getUserDisplayImage(event.data.requester_id)
        setAvatarUrl(url)
      } catch (error) {
        console.error('Error fetching avatar:', error)
      }
    }

    fetchAvatar()
  }, [event.data.requester_id])

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

      message.success('Запрос принят!')
      // Don't call onAccept - keep notification in history
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: event.data.requester_id }),
      })

      if (!response.ok) {
        throw new Error('Не удалось отклонить запрос')
      }

      message.success('Запрос отклонен')
      // Don't call onReject - keep notification in history
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={style.eventItem}>
      <div className={style.eventContent}>
        <Avatar
          src={avatarUrl || undefined}
          size={40}
          className={style.avatar}
        >
          {event.data.requester_name?.[0]}
        </Avatar>
        <div className={style.textContent}>
          <Link href={`/profile/${event.data.requester_id}`}>
            <strong>{event.data.requester_name}</strong>
          </Link>
          <p>отправил запрос в друзья</p>
          <span className={style.timestamp}>
            {new Date(event.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <Space>
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          loading={loading}
          onClick={handleAccept}
        >
          Принять
        </Button>
        <Button
          type="default"
          size="small"
          loading={loading}
          onClick={handleReject}
        >
          Оставить как подписчика
        </Button>
      </Space>
    </div>
  )
}
