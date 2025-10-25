// components
import Image from './Image'
// styles
import style from './styles.module.scss'

export default function Profile() {
  return (
    <div className={style.profile}>
      <div className={style.profile__imageWrapper}>
        <Image />
      </div>
    </div>
  )
}
