'use client'

import { useState, useEffect } from 'react'
import { Button, message } from 'antd'
import { UserAddOutlined, CheckOutlined, UserOutlined, MinusOutlined } from '@ant-design/icons'

interface AddToFriendsProps {
  userId: string
  initialStatus?: 'friend' | 'following' | 'blocked' | null
  onRequestUpdated?: () => void
}

interface StatusResponse {
  status: 'friend' | 'following' | 'blocked' | null
  friend_request_status?: 'pending' | 'accepted' | 'declined' | null
  direction?: 'outgoing' | 'incoming'
  edgeId?: string
}

export default function AddToFriends({ userId, initialStatus = null, onRequestUpdated }: AddToFriendsProps) {
  const [status, setStatus] = useState<'friend' | 'following' | 'blocked' | null>(initialStatus)
  const [requestStatus, setRequestStatus] = useState<'pending' | 'accepted' | 'declined' | null>(null)
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
          setRequestStatus(data.friend_request_status || null)
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
      setStatus('following')
      setRequestStatus('pending')
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
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        throw new Error('Не удалось выполнить действие')
      }

      // Set user as following after removing friend
      setStatus('following')
      setDirection(null)
      message.success('Статус изменен')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/friends/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        throw new Error('Не удалось подписаться')
      }

      setStatus('following')
      setDirection(null)
      message.success('Вы подписались!')
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

      setStatus('friend')
      setRequestStatus('accepted')
      setDirection('outgoing')
      message.success('Запрос принят!')
      onRequestUpdated?.()
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  const handleDeclineRequest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        throw new Error('Не удалось отклонить запрос')
      }

      setRequestStatus('declined')
      message.success('Запрос отклонен')
      onRequestUpdated?.()
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingStatus) return null

  // Blocked by this user - show blocked message
  if (status === 'blocked' && direction === 'incoming') {
    return (
      <div style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
          Пользователь ограничил доступ к своей страницы
        </div>
      </div>
    )
  }

  // Incoming pending request - show accept and decline buttons
  if (status === 'following' && requestStatus === 'pending' && direction === 'incoming') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          loading={loading}
          onClick={handleAcceptRequest}
          block
        >
          В друзья
        </Button>
        <Button
          variant="outlined"
          loading={loading}
          onClick={handleDeclineRequest}
          block
        >
          Отклонить
        </Button>
      </div>
    )
  }

  // Incoming declined request - show add friend button
  if (status === 'following' && requestStatus === 'declined' && direction === 'incoming') {
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

  // Friends - show remove button
  if (status === 'friend') return null

  // Outgoing pending request - show "Request sent" and unsubscribe
  if (status === 'following' && requestStatus === 'pending' && direction === 'outgoing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button
          type="default"
          disabled
          block
        >
          Запрос отправлен
        </Button>
        <Button
          variant="outlined"
          icon={<MinusOutlined />}
          loading={loading}
          onClick={handleRemoveFriend}
          block
        >
          Отписаться
        </Button>
      </div>
    )
  }

  // Outgoing declined request - show "Request sent" and unsubscribe
  if (status === 'following' && requestStatus === 'declined' && direction === 'outgoing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button
          type="default"
          disabled
          block
        >
          Запрос отправлен
        </Button>
        <Button
          variant="outlined"
          icon={<MinusOutlined />}
          loading={loading}
          onClick={handleRemoveFriend}
          block
        >
          Отписаться
        </Button>
      </div>
    )
  }

  // Just following (no request) - show both buttons
  if (status === 'following' && !requestStatus && direction === 'outgoing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          loading={loading}
          onClick={handleAddFriend}
          block
        >
          Добавить в друзья
        </Button>
        <Button
          variant="outlined"
          icon={<MinusOutlined />}
          loading={loading}
          onClick={handleRemoveFriend}
          block
        >
          Отписаться
        </Button>
      </div>
    )
  }

  // Blocked - show unblock only if current user is the one who blocked
  if (status === 'blocked' && direction === 'outgoing') {
    return (
      <Button
        type="default"
        loading={loading}
        onClick={handleRemoveFriend}
        block
      >
        Разблокировать
      </Button>
    )
  }

  // No relationship - show both add friend and follow buttons
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        loading={loading}
        onClick={handleAddFriend}
        block
      >
        Добавить в друзья
      </Button>
      <Button
        variant="outlined"
        icon={<UserOutlined />}
        loading={loading}
        onClick={handleFollow}
        block
      >
        Подписаться
      </Button>
    </div>
  )
}
