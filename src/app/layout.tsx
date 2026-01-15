import './globals.css'
import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
// antd
import { Layout } from 'antd'
// components
import { Providers } from '@/components/Providers'
import Header from '@/components/Header'
import { WebSocketProvider } from '@/components/WebSocketProvider'
// styles
import styles from './styles.module.scss'

export const metadata: Metadata = {
  title: 'Bcaster',
  description: 'Страница профиля bcaster.ru',
  keywords: ['bcaster', 'соревнования', 'социальная сеть', 'drift', 'дрифт'],
}

export default function RootLayout({
  auth,
  children,
}: {
  auth: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <Providers>
          <WebSocketProvider>
            <AntdRegistry>
              <Layout style={{ minHeight: '100vh' }}>
                <Header />
                {auth}
                <div className={styles.mainLayout}>
                  <div className={styles.mainLayout__content}>{children}</div>
                </div>
              </Layout>
            </AntdRegistry>
          </WebSocketProvider>
        </Providers>
      </body>
    </html>
  )
}
