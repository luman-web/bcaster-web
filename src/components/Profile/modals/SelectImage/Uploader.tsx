import React, { useState, useEffect, useRef, forwardRef } from 'react'
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons'
import { Upload, Button, Modal } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import 'react-advanced-cropper/dist/style.css'

// Create a proper wrapper component with forwardRef
const CropperComponent = forwardRef<any, any>((props, ref) => {
  const [CropperLoaded, setCropperLoaded] = useState<any>(null)

  useEffect(() => {
    import('react-advanced-cropper').then((module) => {
      setCropperLoaded(() => module.Cropper)
    })
  }, [])

  if (!CropperLoaded) {
    return <div>Loading cropper...</div>
  }

  return <CropperLoaded ref={ref} {...props} />
})

CropperComponent.displayName = 'CropperComponent'

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const Uploader: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewImage, setPreviewImage] = useState<string>('')
  const [originalImage, setOriginalImage] = useState<string>('')
  const [cropperModalVisible, setCropperModalVisible] = useState(false)
  const [cropperReady, setCropperReady] = useState(false)
  const cropperRef = useRef<any>(null)

  // Enable cropper after modal opens and image loads
  useEffect(() => {
    if (cropperModalVisible && originalImage) {
      const timer = setTimeout(() => {
        setCropperReady(true)
      }, 1000) // Give the cropper time to load

      return () => clearTimeout(timer)
    }
  }, [cropperModalVisible, originalImage])

  const customRequest = ({ file, onSuccess }: any) => {
    // Generate preview from the uploaded file
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string

      setOriginalImage(result)
      setCropperReady(false) // Reset cropper ready state
      setCropperModalVisible(true)
    }
    reader.readAsDataURL(file as File)

    // Mark upload as successful
    setTimeout(() => {
      onSuccess && onSuccess('ok')
    }, 0)
  }

  const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // Filter files to only include JPG and PNG images
    const filteredFileList = newFileList.filter((file) => {
      if (file.originFileObj) {
        const isValidType =
          file.originFileObj.type === 'image/jpeg' ||
          file.originFileObj.type === 'image/jpg' ||
          file.originFileObj.type === 'image/png'
        if (!isValidType) {
          console.warn(
            `File ${file.name} is not a valid image format. Only JPG and PNG files are allowed.`
          )
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
    setOriginalImage('')
  }

  const changeSelected = () => {
    // Reopen cropper with current image to allow changing crop area
    if (originalImage) {
      // Use the existing original image
      setCropperReady(false)
      setCropperModalVisible(true)
    } else if (previewImage) {
      // If no original image, use the preview image as source
      setOriginalImage(previewImage)
      setCropperReady(false)
      setCropperModalVisible(true)
    }
  }

  const saveCropped = () => {
    console.log('save it')
  }

  const handleCrop = () => {
    if (cropperRef.current) {
      try {
        // Use the proper API from react-advanced-cropper
        const canvas = cropperRef.current.getCanvas()

        if (canvas) {
          const croppedImage = canvas.toDataURL('image/jpeg', 0.9)
          setPreviewImage(croppedImage)
        } else {
          setPreviewImage(originalImage)
        }
      } catch (error) {
        console.error('Error getting canvas from cropper API:', error)
        setPreviewImage(originalImage)
      }
    } else {
      setPreviewImage(originalImage)
    }

    setCropperModalVisible(false)
  }

  const handleCropCancel = () => {
    setCropperModalVisible(false)
    setCropperReady(false) // Reset cropper ready state
    if (!previewImage) {
      // If no preview exists, reset everything
      setOriginalImage('')
      setFileList([])
    }
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
    const isValidType =
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.type === 'image/png'
    if (!isValidType) {
      console.warn(
        `File ${file.name} is not a valid image format. Only JPG and PNG files are allowed.`
      )
      return false
    }
    return true // Allow upload to proceed to customRequest
  }

  return (
    <div>
      {!previewImage ? (
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
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              position: 'relative',
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              padding: '8px',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '4px',
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
                  border: '1px solid #ff4d4f',
                }}
              />
            </div>
            <div
              style={{
                marginTop: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'stretch',
              }}
            >
              <div style={{ width: '100%' }}>
                <Button style={{ width: '100%' }} onClick={changeSelected}>
                  Изменить
                </Button>
              </div>
              <Button
                type="primary"
                onClick={saveCropped}
                style={{ width: '100%' }}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      <Modal
        title="Обрезать изображение"
        open={cropperModalVisible}
        onOk={handleCrop}
        onCancel={handleCropCancel}
        okText="Применить"
        cancelText="Отменить"
        width={600}
        centered
        okButtonProps={{ disabled: !cropperReady }}
      >
        {originalImage && (
          <div style={{ height: '400px' }}>
            <CropperComponent
              ref={cropperRef}
              src={originalImage}
              className="cropper"
              stencilProps={{
                aspectRatio: 1,
              }}
              style={{ height: '100%', background: '#ddd' }}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Uploader
