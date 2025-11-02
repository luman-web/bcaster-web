// styles
import styles from '../../Profile/Image/styles.module.scss'

import { UserOutlined } from '@ant-design/icons'

export default function PlaceholderPreview() {
  return (
    <div className={styles.placeholder}>
      <UserOutlined />
    </div>
  )
}