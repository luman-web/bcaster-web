import React from 'react'
import { Button } from 'antd'
import { LoginOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const Navigation: React.FC = () => {
  const router = useRouter()

  return (
    <div>
      <Button
        size="small"
        type="text"
        style={{ color: 'white', height: '40px', width: '40px' }}
        onClick={() => router.push('/login')}
      >
        <LoginOutlined />
      </Button>
    </div>
  )
}

export default Navigation
