import { useState } from 'react'
import { Form, Input, Button, Checkbox } from 'antd'
// components
import ButtonLoading from '@/components/ButtonLoading'

type FieldType = {
  login: string
  password: string
  remember: boolean
}

export default function SignIn() {
  const initialValues = { remember: true }
  const [inProcess, setInProcess] = useState(false)

  const onFinish = (values: FieldType) => {
    setInProcess(true)

    setTimeout(() => {
      setInProcess(false)
    }, 1000)
  }

  return (
    <Form
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      disabled={inProcess}
    >
      <Form.Item<FieldType>
        label="E-mail или номер телефона:"
        name="login"
        hasFeedback
        rules={[{ required: true, message: 'Введите логин' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Пароль:"
        name="password"
        hasFeedback
        rules={[{ required: true, message: 'Введите пароль' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item<FieldType> name="remember" valuePropName="checked">
        <Checkbox>Запомнить?</Checkbox>
      </Form.Item>

      <Button type="primary" htmlType="submit">
        {inProcess && <ButtonLoading />}
        <span>Вход</span>
      </Button>
    </Form>
  )
}
