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
