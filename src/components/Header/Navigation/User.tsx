import React from 'react'
import type { MenuProps } from 'antd'
import { Dropdown, Button } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

const Navigation: React.FC = () => {
  const items: MenuProps['items'] = [
    {
      label: <Link href="/profile">Профиль</Link>,
      key: '0',
    },
    {
      label: <a onClick={() => signOut({ redirectTo: '/' })}>Выход</a>,
      key: '1',
    },
  ]

  return (
    <div>
      <Dropdown menu={{ items }} trigger={['click']}>
        <Button size="small" type="text" style={{ color: 'white' }}>
          <UserOutlined />
        </Button>
      </Dropdown>
    </div>
  )
}

export default Navigation
