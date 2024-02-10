import Login from '@/components/Login'
// styles
import styles from './styles.module.scss'

export default function () {
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginPage__form}>
        <Login />
      </div>
    </div>
  )
}
