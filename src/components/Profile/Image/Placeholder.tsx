// styles
import styles from './styles.module.scss'

import { UserOutlined } from '@ant-design/icons'
import { Button } from 'antd'

type Props = {
  selectImage: Function
}

export default function Placehoder(props: Props) {
  return (
    <div className={styles.placeholder}>
      <UserOutlined />

      <div className={styles.selectImage}>
        <Button size="small" style={{ width: '100%' }} onClick={() => props.selectImage(true)}>
          <span>Выбрать фото</span>
        </Button>
      </div>
    </div>
  )
}
