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
        style={{ color: 'white' }}
        onClick={() => router.push('/login')}
      >
        <LoginOutlined />
      </Button>
    </div>
  )
}

export default Navigation
