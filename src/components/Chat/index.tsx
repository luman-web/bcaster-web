import React from 'react'
// store
import useChatStore from './chat-store'
// components
import ChatList from './List'
import ChartDetail from './Detail'

const Chat: React.FC = () => {
  const detail = useChatStore((state) => state.detail)

  return (
    <div>
      { detail ? <ChartDetail /> : <ChatList /> }
    </div>
  )
}

export default Chat
