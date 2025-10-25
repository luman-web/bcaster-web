// components
import Uploader from './Uploader'

import React from 'react'
import { Modal } from 'antd'

type Props = {
  isOpened: boolean,
  close: () => void
}

const SelectImage: React.FC<Props> = (props: Props) => {
  return (
    <>
      <Modal
        title={<p>Выбор фото профиля</p>}
        open={props.isOpened}
        onCancel={() => props.close()}
        footer={null}
      >
        <Uploader />
      </Modal>
    </>
  )
}

export default SelectImage
