'use client'

// components
import ButtonLoading from '@/components/ButtonLoading'
// types
import type { LoginProps } from './Login.d.ts'

import { Form, Input, Button } from 'antd'
import { signIn } from 'next-auth/react'

type FieldType = {
  email: string
}

export default function EmailMagicLink(props: LoginProps) {
  const { inProcess, setInProcess, setEmailMagicLinkSentTo } = props
  const initialValues = {}

  const onFinish = async (values: FieldType) => {
    setInProcess(true)

    await signIn('sendgrid', {
      ...values,
      redirect: false,
      redirectTo: '/profile',
    })

    setInProcess(false)
    setEmailMagicLinkSentTo(values.email)
  }

  return (
    <Form
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      disabled={inProcess}
    >
      <Form.Item<FieldType>
        label="Войти по E-mail:"
        name="email"
        hasFeedback
        rules={[
          { required: true, message: 'Введите E-mail' },
          { type: 'email', message: 'Введите корректный E-mail' },
        ]}
      >
        <Input />
      </Form.Item>

      <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
        {inProcess && <ButtonLoading />}
        <span>Вход</span>
      </Button>
    </Form>
  )
}
