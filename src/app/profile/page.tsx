import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function MyProfile() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <div>My profile</div>
}
