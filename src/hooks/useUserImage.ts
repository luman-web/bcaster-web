import { useEffect, useState } from 'react'
import { getUserDisplayImage, getUserProfileImageThumbnail } from '@/lib/generateAvatar'
import { useUserProfileStore } from '@/store/userProfileStore'

/**
 * Hook to get user's display image with automatic refresh on profile updates
 * @param userId - User ID to fetch image for
 * @returns User's display image URL (profile thumbnail or generated avatar)
 */
export function useUserDisplayImage(userId: string): string | null {
  const profileImageUpdateTrigger = useUserProfileStore((state) => state.profileImageUpdateTrigger)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await getUserDisplayImage(userId)
        setImageUrl(url)
      } catch (error) {
        console.error('Error fetching user display image:', error)
      }
    }

    fetchImage()
  }, [userId, profileImageUpdateTrigger])

  return imageUrl
}

/**
 * Hook to get user's profile image thumbnail with automatic refresh on profile updates
 * @param userId - Optional user ID (if provided, fetches that user's image, otherwise fetches current user)
 * @returns User's profile image thumbnail URL or null
 */
export function useUserProfileImageThumbnail(userId?: string): string | null {
  const profileImageUpdateTrigger = useUserProfileStore((state) => state.profileImageUpdateTrigger)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await getUserProfileImageThumbnail(userId)
        setImageUrl(url)
      } catch (error) {
        console.error('Error fetching user profile image thumbnail:', error)
      }
    }

    fetchImage()
  }, [userId, profileImageUpdateTrigger])

  return imageUrl
}
