import React from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'

const App: React.FC = () => (
  <Spin
    indicator={
      <LoadingOutlined
        style={{
          fontSize: 14,
          marginRight: 10,
          color: '#999',
          marginBottom: 3,
        }}
        spin
      />
    }
  />
)

export default App
