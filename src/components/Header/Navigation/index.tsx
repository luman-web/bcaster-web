'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { Button, Space } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

// components
import Guest from './Guest'
import User from './User'

export default function Navigation() {
  return <NavigationContent />
}

const NavigationContent: React.FC = () => {
  const { status } = useSession()

  if (status === 'loading')
    return (
      <Button size="small" type="text" style={{ color: 'white' }}>
        <Space>
          <LoadingOutlined />
        </Space>
      </Button>
    )

  return status === 'authenticated' ? <User /> : <Guest />
}
