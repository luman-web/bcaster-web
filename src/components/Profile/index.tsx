'use client'

import { useSession } from 'next-auth/react'
// components
import Image from './Image'
import AddToFriends from '@/components/Profile/AddToFriends'
// styles
import style from './styles.module.scss'

interface ProfileProps {
  userId?: string
  friendStatus?: 'pending' | 'approved' | 'rejected' | null
}

export default function Profile({ userId, friendStatus = null }: ProfileProps) {
  const { data: session } = useSession()
  const isCurrentUser = !userId || userId === session?.user?.id

  return (
    <div className={style.profile}>
      <div className={style.profile__imageWrapper}>
        <Image userId={userId} />
        {!isCurrentUser && (
          <div className={style.profile__actions}>
            <AddToFriends userId={userId!} initialStatus={friendStatus} />
          </div>
        )}
      </div>
    </div>
  )
}
