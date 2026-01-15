import React, { useState, useEffect, useRef, forwardRef } from 'react'
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons'
import { Upload, Button, Modal } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import { useSession } from 'next-auth/react'
import ButtonLoading from '@/components/ButtonLoading'
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

interface UploaderProps {
  onSaveComplete?: () => void
}

const Uploader: React.FC<UploaderProps> = ({ onSaveComplete }) => {
  const { data: session } = useSession()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewImage, setPreviewImage] = useState<string>('')
  const [originalImage, setOriginalImage] = useState<string>('')
  const [cropperModalVisible, setCropperModalVisible] = useState(false)
  const [cropperReady, setCropperReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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

      setCropperModalVisible(true)

      setTimeout(() => {
        setOriginalImage(result)
        setCropperReady(false) // Reset cropper ready state
      }, 300)
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
      setCropperModalVisible(true)

      setTimeout(() => {
        setCropperReady(false)
      }, 300)
    } else if (previewImage) {
      // If no original image, use the preview image as source
      setCropperModalVisible(true)

      setTimeout(() => {
        setOriginalImage(previewImage)
        setCropperReady(false)
      }, 300)
    }
  }

  const saveCropped = async () => {
    if (!previewImage || !originalImage) {
      console.error('No preview image or original image available')
      return
    }

    if (!session?.user?.id) {
      console.error('User not authenticated')
      return
    }

    setIsSaving(true) // Start loading state

    try {
      // Get current user's profile image to delete old versions
      const userResponse = await fetch('/api/user')
      let oldImageUrls: string[] = []
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL
        
        // Only delete old preview and cropped files if they exist
        // Keep the original file as it can be reused
        if (baseUrl) {
          oldImageUrls = [
            userData.image_cropped,
            userData.image_preview
          ].filter(url => url && url.startsWith(baseUrl))
        }
      }

      // Convert original image to file
      const originalFile = await dataURLToFile(originalImage, 'original.jpg')
      
      // Convert preview (already cropped) to file
      const croppedFile = await dataURLToFile(previewImage, 'cropped.jpg')
      
      // Optimize images using the API
      const [optimizedOriginal, optimizedCropped, optimizedCroppedPreview, optimizedOriginalPreview] = await Promise.all([
        optimizeImage(originalFile, 800, 800, 90), // Keep original at reasonable size with high quality
        optimizeImage(croppedFile, 250, 250, 85),   // Optimize cropped version (profile display)
        optimizeImage(croppedFile, 50, 50, 80),     // Create 50x50 preview from cropped (navbar/header)
        optimizeImage(originalFile, 400, 400, 75)   // Create optimized preview from original (album/list display)
      ])

      // Generate unique filename prefix with user ID for organization
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substr(2, 9)
      const userId = session.user.id
      const filenamePrefix = `${userId}/images/${timestamp}-${randomId}`

      // Upload all four optimized versions
      const uploads = await Promise.all([
        uploadFile(optimizedOriginal, `${filenamePrefix}-original.jpg`),
        uploadFile(optimizedCropped, `${filenamePrefix}-cropped.jpg`),
        uploadFile(optimizedCroppedPreview, `${filenamePrefix}-preview.jpg`),
        uploadFile(optimizedOriginalPreview, `${filenamePrefix}-original-preview.jpg`)
      ])

      if (uploads.every(result => result.success)) {
        console.log('All images uploaded successfully')
        
        const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL
        
        if (!baseUrl) {
          console.error('NEXT_PUBLIC_S3_BASE_URL environment variable is not set')
          return
        }

        const originalUrl = `${baseUrl}/${filenamePrefix}-original.jpg`
        const croppedUrl = `${baseUrl}/${filenamePrefix}-cropped.jpg`
        const croppedPreviewUrl = `${baseUrl}/${filenamePrefix}-preview.jpg`
        const originalPreviewUrl = `${baseUrl}/${filenamePrefix}-original-preview.jpg`

        // Delete old preview and cropped images from S3 after successful upload
        if (oldImageUrls.length > 0) {
          try {
            await deleteOldImages(oldImageUrls)
            console.log('Old profile images deleted successfully')
          } catch (error) {
            console.error('Error deleting old images:', error)
            // Don't fail the whole process if old image deletion fails
          }
        }

        // First, create user_image record
        const createImageResponse = await fetch('/api/user-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original_url: originalUrl,
            preview_url: originalPreviewUrl, // Optimized original for album/list display
            mime_type: 'image/jpeg'
          }),
        })

        if (!createImageResponse.ok) {
          console.error('Failed to create user_image record')
          return
        }

        const imageRecord = await createImageResponse.json()
        const userImageId = imageRecord.id

        // Then, update user profile with new profile_image_id and cropped/preview URLs
        const updateResponse = await fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_image_id: userImageId,
            image_cropped: croppedUrl,
            image_preview: croppedPreviewUrl // 50x50 of cropped for navbar
          }),
        })

        if (updateResponse.ok) {
          console.log('User profile updated with new profile image')
          // Clear all uploaded file data for fresh upload interface
          setFileList([])
          setPreviewImage('')
          setOriginalImage('')
          // Close the modal after successful save
          onSaveComplete?.()
        } else {
          console.error('Failed to update user profile with new profile image')
        }
      } else {
        console.error('Some uploads failed')
      }

    } catch (error) {
      console.error('Error saving cropped image:', error)
    } finally {
      setIsSaving(false) // Stop loading state
    }
  }

  // Helper function to convert data URL to File
  const dataURLToFile = async (dataURL: string, filename: string): Promise<File> => {
    const response = await fetch(dataURL)
    const blob = await response.blob()
    return new File([blob], filename, { type: 'image/jpeg' })
  }

  // Helper function to convert canvas to File
  const canvasToFile = (canvas: HTMLCanvasElement, filename: string): Promise<File> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], filename, { type: 'image/jpeg' }))
        }
      }, 'image/jpeg', 0.9)
    })
  }

  // Helper function to optimize image using the API
  const optimizeImage = async (file: File, width: number, height: number, quality: number = 85): Promise<File> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('width', width.toString())
      formData.append('height', height.toString())
      formData.append('quality', quality.toString())

      const response = await fetch('/api/optimize-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to optimize image')
      }

      const result = await response.json()
      
      if (result.success) {
        console.log(`Image optimized: ${result.originalSize} → ${result.optimizedSize} bytes (${result.compressionRatio}% reduction)`)
        
        // Convert base64 back to File
        const base64Response = await fetch(result.optimizedImage)
        const blob = await base64Response.blob()
        return new File([blob], file.name, { type: 'image/jpeg' })
      } else {
        throw new Error('Optimization failed')
      }
    } catch (error) {
      console.error('Error optimizing image:', error)
      // Return original file if optimization fails
      return file
    }
  }

  // Helper function to upload file via API (server-side upload to avoid CORS)
  const uploadFile = async (file: File, filename: string): Promise<{success: boolean}> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('filename', filename)

      const res = await fetch('/api/s3-upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Failed to upload file')
      }

      const result = await res.json()

      if (result.success) {
        console.log(`Upload successful: ${filename}`)
        return { success: true }
      } else {
        console.error(`Upload failed: ${filename}`, result.error)
        return { success: false }
      }
    } catch (error) {
      console.error(`Error uploading ${filename}:`, error)
      return { success: false }
    }
  }

  // Helper function to delete old images from Selectel
  const deleteOldImages = async (imageUrls: string[]): Promise<void> => {
    const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL
    if (!baseUrl) return

    for (const imageUrl of imageUrls) {
      try {
        // Extract the filename from the full URL
        const filename = imageUrl.replace(`${baseUrl}/`, '')
        
        // Delete the file via server-side API
        const res = await fetch('/api/s3-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename }),
        })

        const result = await res.json()
        
        if (result.success) {
          console.log(`Deleted old image: ${filename}`)
        } else {
          console.error(`Failed to delete old image: ${filename}`, result.error)
        }
      } catch (error) {
        console.error(`Error deleting image ${imageUrl}:`, error)
      }
    }
  }

  const handleCrop = async () => {
    if (cropperRef.current) {
      try {
        // Use the proper API from react-advanced-cropper
        const canvas = cropperRef.current.getCanvas()

        if (canvas) {
          // Convert canvas to file for optimization
          const croppedFile = await canvasToFile(canvas, 'preview.jpg')
          
          // Optimize the preview image for better UI display
          const optimizedPreviewFile = await optimizeImage(croppedFile, 250, 250, 85)
          
          // Convert optimized file back to data URL for preview
          const reader = new FileReader()
          reader.onload = (e) => {
            setPreviewImage(e.target?.result as string)
          }
          reader.readAsDataURL(optimizedPreviewFile)
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
                disabled={isSaving}
                style={{ width: '100%' }}
              >
                {isSaving && <ButtonLoading />}
                <span>Сохранить</span>
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
