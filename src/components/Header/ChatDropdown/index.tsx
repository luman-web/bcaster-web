import React from 'react'
import { Button, Badge } from 'antd'
// icons
import { WechatOutlined } from '@ant-design/icons'
// styles
import style from './style.module.scss'

const Navigation: React.FC = () => {
  const messagesCount = 5

  return (
    <div>
      <Badge 
        count={messagesCount}
        overflowCount={99}
        offset={[-21, 30]}
        size="small"
        className={style.chatDropdown__messagesCount}
      >
        <Button
          size="small"
          type="text"
          className={style.chatDropdown__trigger}
        >
          <WechatOutlined className={style.chatDropdown__triggerIcon} />
        </Button>
      </Badge>
    </div>
  )
}

export default Navigation