import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'

/**
 * Generate a DiceBear avatar as a data URI based on a seed
 * @param seed - Unique identifier for avatar generation (e.g., user ID)
 * @returns Promise resolving to data URI of the generated avatar
 */
export async function generateAvatarDataUri(seed: string): Promise<string> {
  try {
    const avatar = createAvatar(identicon, {
      seed,
    })
    
    const dataUri = await avatar.toDataUri()
    return dataUri
  } catch (error) {
    console.error('Error generating avatar:', error)
    throw error
  }
}

/**
 * Fetch user's profile image from API
 * @param userId - Optional user ID (if provided, fetches that user's image, otherwise fetches current user)
 * @returns Promise resolving to user data or null if fetch fails
 */
export async function fetchUserProfileImage(userId?: string): Promise<{ image_preview: string | null; image_cropped: string | null; original_url: string | null } | null> {
  try {
    const url = userId ? `/api/user/${userId}` : '/api/user'
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('Failed to fetch user data:', response.status)
      return null
    }
    
    const userData = await response.json()
    
    return {
      image_preview: userData.image_preview || null,
      image_cropped: userData.image_cropped || null,
      original_url: userData.original_url || null
    }
  } catch (error) {
    console.error('Error fetching user profile image:', error)
    return null
  }
}

/**
 * Get user's profile image thumbnail (preview preferred, fallback to cropped)
 * @param userId - Optional user ID (if provided, fetches that user's image, otherwise fetches current user)
 * @returns Promise resolving to image URL or null
 */
export async function getUserProfileImageThumbnail(userId?: string): Promise<string | null> {
  const userData = await fetchUserProfileImage(userId)
  
  if (!userData) {
    return null
  }
  
  return userData.image_preview || userData.image_cropped || null
}

/**
 * Get user's display image - either their profile thumbnail or generated avatar
 * Works for any user (public, non-protected endpoint)
 * @param userId - User ID to fetch image for
 * @returns Promise resolving to image URL (either profile thumbnail or generated avatar)
 */
export async function getUserDisplayImage(userId: string): Promise<string> {
  try {
    const thumbnailUrl = await getUserProfileImageThumbnail(userId)
    
    if (thumbnailUrl) {
      return thumbnailUrl
    }
    
    // Fallback to generated avatar if no profile image
    return generateAvatarDataUri(userId)
  } catch (error) {
    console.error('Error getting user display image:', error)
    // Return generated avatar as final fallback
    return generateAvatarDataUri(userId)
  }
}

/**
 * Get user's display avatar - either their profile image or generated avatar
 * @param userImageUrl - User's profile image URL (if available)
 * @param userId - User's ID for generating fallback avatar
 * @returns Promise resolving to avatar data URI
 */
export async function getUserAvatar(userImageUrl: string | null | undefined, userId: string): Promise<string> {
  if (userImageUrl) {
    return userImageUrl
  }
  
  return generateAvatarDataUri(userId)
}
