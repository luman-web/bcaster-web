'use client'

import { useState, useEffect } from 'react'
import { Button, message } from 'antd'
import { UserAddOutlined, UserDeleteOutlined, CheckOutlined } from '@ant-design/icons'

interface AddToFriendsProps {
  userId: string
  initialStatus?: 'pending' | 'approved' | 'rejected' | null
}

interface StatusResponse {
  status: 'pending' | 'approved' | 'rejected' | null
  direction?: 'outgoing' | 'incoming'
  edgeId?: string
}

export default function AddToFriends({ userId, initialStatus = null }: AddToFriendsProps) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | null>(initialStatus)
  const [direction, setDirection] = useState<'outgoing' | 'incoming' | null>(null)
  const [edgeId, setEdgeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  // Fetch relationship status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/user/friends/status/${userId}`)
        if (response.ok) {
          const data: StatusResponse = await response.json()
          setStatus(data.status)
          setDirection(data.direction || null)
          setEdgeId(data.edgeId || null)
        }
      } catch (error) {
        console.error('Error fetching relationship status:', error)
      } finally {
        setIsLoadingStatus(false)
      }
    }

    fetchStatus()
  }, [userId])

  const handleAddFriend = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось отправить запрос')
      }

      // Set status immediately on success
      setStatus('pending')
      setDirection('outgoing')
      message.success('Запрос отправлен!')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFriend = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        throw new Error('Не удалось удалить контакт')
      }

      setStatus(null)
      setDirection(null)
      setEdgeId(null)
      message.success('Контакт удален')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async () => {
    setLoading(true)
    try {
      if (!edgeId) {
        throw new Error('Edge ID not found')
      }

      const response = await fetch('/api/user/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edge_id: edgeId }),
      })

      if (!response.ok) {
        throw new Error('Не удалось принять запрос')
      }

      setStatus('approved')
      setDirection('outgoing') // After accepting, treat as outgoing approved
      message.success('Запрос принят!')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingStatus) {
    return (
      <Button
        type="primary"
        loading
        block
      >
        Загрузка...
      </Button>
    )
  }

  // Incoming pending request - show accept button
  if (status === 'pending' && direction === 'incoming') {
    return (
      <Button
        type="primary"
        icon={<CheckOutlined />}
        loading={loading}
        onClick={handleAcceptRequest}
        block
      >
        Принять запрос
      </Button>
    )
  }

  // Approved - show remove friend button
  if (status === 'approved') {
    return (
      <Button
        type="primary"
        danger
        icon={<UserDeleteOutlined />}
        loading={loading}
        onClick={handleRemoveFriend}
        block
      >
        Удалить из друзей
      </Button>
    )
  }

  // Outgoing pending request - show unfollow button
  if (status === 'pending' && direction === 'outgoing') {
    return (
      <Button
        type="default"
        danger
        icon={<UserDeleteOutlined />}
        loading={loading}
        onClick={handleRemoveFriend}
        block
      >
        Отписаться
      </Button>
    )
  }

  // No relationship - show add friend button
  return (
    <Button
      type="primary"
      icon={<UserAddOutlined />}
      loading={loading}
      onClick={handleAddFriend}
      block
    >
      Добавить в друзья
    </Button>
  )
}
