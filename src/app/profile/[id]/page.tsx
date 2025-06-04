import { auth } from '@/auth'

export default async function AnotherUserProfile() {
  const session = await auth()

  console.log(session)

  return <div>Another user profile</div>
}
