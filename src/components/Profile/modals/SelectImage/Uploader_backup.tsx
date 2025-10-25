import React, { useState } from 'react'
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons'
import { Upload, Button } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import ImgCrop from 'antd-img-crop'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const Uploader: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewImage, setPreviewImage] = useState<string>('')

  const customRequest = ({ file, onSuccess }: any) => {
    console.log('customRequest file:', file)
    // This is called with the cropped file from antd-img-crop
    
    // Generate preview from the cropped file
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      console.log('Setting preview from customRequest')
      setPreviewImage(result)
    }
    reader.readAsDataURL(file as File)
    
    // Mark upload as successful
    setTimeout(() => {
      onSuccess && onSuccess('ok')
    }, 0)
  }

  const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    console.log('onChange fileList:', newFileList)
    
    // Filter files to only include JPG and PNG images
    const filteredFileList = newFileList.filter((file) => {
      if (file.originFileObj) {
        const isValidType = file.originFileObj.type === 'image/jpeg' || 
                           file.originFileObj.type === 'image/jpg' || 
                           file.originFileObj.type === 'image/png'
        if (!isValidType) {
          console.warn(`File ${file.name} is not a valid image format. Only JPG and PNG files are allowed.`)
        }
        return isValidType
      }
      return true // Keep existing files
    })
    setFileList(filteredFileList)
  }

  const handleRemove = () => {
    setFileList([])
    setPreviewImage('')
  }

  const handleChangeImage = () => {
    // Reset current selection to allow new upload
    setFileList([])
    setPreviewImage('')
  const handleRemove = () => {
    setFileList([])
    setPreviewImage('')
  }

  const handleChangeImage = () => {
    // Reset current selection to allow new upload
    setFileList([])
    setPreviewImage('')
  }

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file.originFileObj as FileType)
        reader.onload = () => resolve(reader.result as string)
      })
    }
    const image = new Image()
    image.src = src
    const imgWindow = window.open(src)
    imgWindow?.document.write(image.outerHTML)
  }

  const beforeUpload = (file: FileType) => {
    console.log('beforeUpload file:', file)
    const isValidType = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
    if (!isValidType) {
      console.warn(`File ${file.name} is not a valid image format. Only JPG and PNG files are allowed.`)
      return false
    }
    return true // Allow upload to proceed to customRequest
  }

  return (
    <div>
      {!previewImage ? (
        <ImgCrop 
          rotationSlider 
          aspect={1} 
          quality={0.9}
          modalTitle="Обрезать изображение"
          modalOk="Применить"
          modalCancel="Отменить"
        >
          <Upload.Dragger
            name="files"
            fileList={fileList}
            onChange={onChange}
            onPreview={onPreview}
            beforeUpload={beforeUpload}
            customRequest={customRequest}
            accept="image/jpeg,image/jpg,image/png"
            maxCount={1}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Кликните, чтобы загрузить или переместите сюда фото
            </p>
          </Upload.Dragger>
        </ImgCrop>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', 
            position: 'relative',
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            padding: '8px',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={previewImage} 
                alt="Preview" 
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  objectFit: 'cover',
                  borderRadius: '4px'
                }} 
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={handleRemove}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid #ff4d4f'
                }}
              />
            </div>
            <div style={{ marginTop: '8px' }}>
              <ImgCrop 
                rotationSlider 
                aspect={1} 
                quality={0.9}
                modalTitle="Обрезать изображение"
                modalOk="Применить"
                modalCancel="Отменить"
              >
                <Upload
                  name="files"
                  fileList={[]}
                  onChange={onChange}
                  beforeUpload={beforeUpload}
                  customRequest={customRequest}
                  accept="image/jpeg,image/jpg,image/png"
                  maxCount={1}
                  showUploadList={false}
                >
                  <Button>
                    Изменить фото
                  </Button>
                </Upload>
              </ImgCrop>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Uploader
