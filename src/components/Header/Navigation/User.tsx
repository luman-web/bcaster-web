import React from 'react'
import { Flex } from 'antd'
// components
import UserDropdown from './UserDropdown'
import ChatDropdown from './ChatDropdown'
import SystemEventsDropdown from './SystemEventsDropdown'

const Navigation: React.FC = () => {
  return (
    <Flex gap={5}>
      <SystemEventsDropdown />
      <ChatDropdown />
      <UserDropdown />
    </Flex>
  )
}

export default Navigation
