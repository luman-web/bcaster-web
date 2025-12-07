import NextAuth from 'next-auth'
import authConfig from './auth.config'
// providers
import SendGrid from 'next-auth/providers/sendgrid'

import pool from './lib/db'

// Import the adapter function from @auth/pg-adapter
import PostgresAdapter from '@auth/pg-adapter'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PostgresAdapter(pool),
  session: { strategy: 'jwt' },
  providers: [
    SendGrid({
      from: 'yuriyrussanov@gmail.com',
      sendVerificationRequest: ({ url }) => {
        console.log(url)
      },
    }),
    ...authConfig.providers,
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verify-request',
  },
  callbacks: {
    jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.id = user?.id
      }
      return token
    },
    session({ session, token }) {
      // I skipped the line below coz it gave me a TypeError
      // session.accessToken = token.accessToken;
      session.user.id = token.id

      return session
    },
  },
})
