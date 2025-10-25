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
  const { inProcess, setInProcess, setEmailMagicLinkSentTo, setError } = props
  const initialValues = {}

  const onFinish = async (values: FieldType) => {
    setInProcess(true)
    setError && setError(null) // Clear any previous errors

    try {
      const result = await signIn('sendgrid', {
        ...values,
        redirect: false,
        redirectTo: '/profile',
      })

      console.log('signIn result:', result)

      // Check if sign-in was successful
      if (result?.error) {
        console.error('Sign-in error:', result.error)
        const errorMessage = result.error === 'Configuration' 
          ? 'Ошибка подключения к базе данных. Проверьте что PostgreSQL запущен и настроен.'
          : `Ошибка авторизации: ${result.error}`
        setError && setError(errorMessage)
      } else {
        // Only show success message if no error
        setEmailMagicLinkSentTo && setEmailMagicLinkSentTo(values.email)
      }
    } catch (error) {
      console.error('Sign-in failed:', error)
      setError && setError('Произошла непредвиденная ошибка при отправке ссылки')
    } finally {
      setInProcess(false)
    }
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
