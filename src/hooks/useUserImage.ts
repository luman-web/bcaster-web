import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
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

    if (userId) {
      fetchImage()
    }
  }, [userId, profileImageUpdateTrigger])

  return imageUrl
}

/**
 * Hook to get user's profile image thumbnail with automatic refresh on profile updates
 * Fetches current user's profile image
 * @returns User's profile image thumbnail URL or null
 */
export function useUserProfileImageThumbnail(): string | null {
  const { data: session } = useSession()
  const profileImageUpdateTrigger = useUserProfileStore((state) => state.profileImageUpdateTrigger)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchImage = async () => {
      if (!session?.user?.id) {
        setImageUrl(null)
        return
      }

      try {
        const url = await getUserProfileImageThumbnail(session.user.id)
        setImageUrl(url)
      } catch (error) {
        console.error('Error fetching user profile image thumbnail:', error)
        setImageUrl(null)
      }
    }

    fetchImage()
  }, [session?.user?.id, profileImageUpdateTrigger])

  return imageUrl
}
