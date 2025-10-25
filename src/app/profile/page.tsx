import { auth } from '@/auth'
import { redirect } from 'next/navigation'
// components
import Profile from '@/components/Profile'

export default async function MyProfile() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <Profile />
}