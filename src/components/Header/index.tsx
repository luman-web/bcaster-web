import Link from 'next/link'
// style
import style from './style.module.scss'
// components
import Navigation from './Navigation'
import NavigationProgress from './NavigationProgress'

export default function () {
  return (
    <div className={style.header}>
      <div className={style.header__body}>
        <Link
          style={{ color: 'white', fontSize: '20px', textDecoration: 'none' }}
          href="/"
        >
          Bcaster
        </Link>
        <Navigation />
      </div>
      <NavigationProgress />
    </div>
  )
}
