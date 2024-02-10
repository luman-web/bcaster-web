'use client'

import { Modal } from 'antd'
import { useRouter } from 'next/navigation'
// components
import Login from '@/components/Login'

export default function LoginModal() {
  const router = useRouter()
  const isModalOpen = true

  const handleCancel = () => {
    router.back()
  }

  return (
    <Modal
      title="Авторизация"
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
    >
      <Login />
    </Modal>
  )
}
