'use client'

import { Tabs } from 'antd'
import type { TabsProps } from 'antd'
// components
import SignIn from './SignIn'
import SignUp from './SignUp'

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Вход',
    children: <SignIn />,
  },
  {
    key: '2',
    label: 'Регистрация',
    children: <SignUp />,
  },
]

export default function Login() {
  return <Tabs defaultActiveKey="1" items={items} />
}
