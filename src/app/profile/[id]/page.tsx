import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ProfilePreview from '@/components/ProfilePreview'

interface Props {
  params: {
    id: string
  }
}

export default async function AnotherUserProfile({ params }: Props) {
  const session = await auth()
  const { id } = params

  // If the user is viewing their own profile, redirect to /profile
  if (session?.user?.id && session.user.id === id) {
    redirect('/profile')
  }

  console.log(session)

  return <ProfilePreview userId={id} />
}
