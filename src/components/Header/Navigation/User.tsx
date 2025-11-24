import React from 'react'
import type { MenuProps } from 'antd'
import { Flex, Dropdown, Button } from 'antd'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import UserAvatar from '../UserDropdown'
import ChatDropdown from '../ChatDropdown'

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
    <Flex>
      <ChatDropdown />
      <Dropdown menu={{ items }} trigger={['click']}>
        <Button size="small" type="text" style={{ color: 'white', padding: '4px', height: '40px' }}>
          <UserAvatar size={30} />
        </Button>
      </Dropdown>
    </Flex>
  )
}

export default Navigation
