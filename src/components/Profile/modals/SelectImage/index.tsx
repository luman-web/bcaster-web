// components
import Uploader from './Uploader'

import React from 'react'
import { Modal } from 'antd'
import { SessionProvider } from 'next-auth/react'

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
        destroyOnHidden={true}
        keyboard={true}
        focusTriggerAfterClose={false}
      >
        <SessionProvider>
          <Uploader onSaveComplete={props.close} />
        </SessionProvider>
      </Modal>
    </>
  )
}

export default SelectImage
