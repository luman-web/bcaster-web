'use client'

import { useState } from 'react'
import { Button, message } from 'antd'
import { UserAddOutlined, UserDeleteOutlined, CheckOutlined } from '@ant-design/icons'

interface AddToFriendsProps {
  userId: string
  initialStatus?: 'pending' | 'approved' | 'rejected' | null
}

export default function AddToFriends({ userId, initialStatus = null }: AddToFriendsProps) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | null>(initialStatus)
  const [loading, setLoading] = useState(false)

  const handleAddFriend = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: userId }),
      })

      if (!response.ok) {
        throw new Error('Не удалось отправить запрос')
      }

      setStatus('pending')
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
      message.success('Контакт удален')
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Что то пошло не так')
    } finally {
      setLoading(false)
    }
  }

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
        Remove Friend
      </Button>
    )
  }

  if (status === 'pending') {
    return (
      <Button
        type="default"
        icon={<CheckOutlined />}
        disabled
        block
      >
        Request Sent
      </Button>
    )
  }

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
