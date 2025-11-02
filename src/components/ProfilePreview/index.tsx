import Image from './Image'
import style from './styles.module.scss'

interface ProfilePreviewProps {
  userId: string
}

export default function ProfilePreview({ userId }: ProfilePreviewProps) {
  return (
    <div className={style.profile}>
      <div className={style.profile__imageWrapper}>
        <Image userId={userId} />
      </div>
    </div>
  )
}