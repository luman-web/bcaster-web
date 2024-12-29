'use client'

import { Button, Flex } from 'antd'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
// icons
import googleBtnImage from '/public/google-btn.png'
// types
import type { LoginProps } from './Login.d.ts'

export default function GoogleOAuth(props: LoginProps) {
  const { setInProcess, inProcess } = props

  const signInWithGoogle = async (): Promise<void> => {
    setInProcess(true)

    await signIn('google', { redirectTo: '/' })

    setInProcess(false)
  }

  return (
    <div style={{ marginBottom: 20, width: '100%' }}>
      <Button
        onClick={signInWithGoogle}
        type="default"
        disabled={inProcess}
        style={{ width: '100%' }}
      >
        <Flex justify="center">
          <Image
            alt="Google"
            src={googleBtnImage}
            style={{ width: 20, height: 20, marginRight: 10 }}
          />
          <span>Войти через Google</span>
        </Flex>
      </Button>
    </div>
  )
}
