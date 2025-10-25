'use client'

// styles
import style from './styles.module.scss'
// components
import SelectImageModal from '../modals/SelectImage/index'

import { useState } from 'react'
import Placeholder from './Placeholder'

export default function ProfileImage() {
  const [selectImageModalShown, showSelectImageModal] = useState(false)

  return (
    <div className={style.profileImageWrapper}>
      <Placeholder selectImage={showSelectImageModal} />
      <SelectImageModal
        isOpened={selectImageModalShown}
        close={() => showSelectImageModal(false)}
      />
    </div>
  )
}
