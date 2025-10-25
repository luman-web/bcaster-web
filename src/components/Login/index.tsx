'use client'

import { useState } from 'react'
// components
import EmailMagicLink from './EmailMagicLink'
import GoogleOAuth from './GoogleOAuth'
import { Flex, Divider, Alert } from 'antd'

export default function Login() {
  const [inProcess, setInProcess] = useState(false)
  const [emailMagicLinkSentTo, setEmailMagicLinkSentTo] = useState(null)
  const [error, setError] = useState<string | null>(null)

  if (emailMagicLinkSentTo) {
    const message = (
      <span>
        Ссылка авторизации отправлена на указанную почту{' '}
        <b>{emailMagicLinkSentTo}</b>
      </span>
    )

    return <Alert type="success" showIcon message={message} />
  }

  return (
    <div>
      {error && (
        <Alert 
          type="error" 
          showIcon 
          message="Ошибка отправки" 
          description={error}
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError(null)}
        />
      )}
      
      <EmailMagicLink
        setInProcess={setInProcess}
        inProcess={inProcess}
        setEmailMagicLinkSentTo={setEmailMagicLinkSentTo}
        setError={setError}
      />

      <Divider plain style={{ marginTop: 20 }}>
        Сервисы
      </Divider>

      <Flex justify="center" style={{ paddingTop: 10 }}>
        <GoogleOAuth setInProcess={setInProcess} inProcess={inProcess} />
      </Flex>
    </div>
  )
}
