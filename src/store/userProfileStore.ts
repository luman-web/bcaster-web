import { create } from 'zustand'

interface UserProfileState {
  // Trigger to force refresh when profile image changes
  profileImageUpdateTrigger: number
  // Notify store of profile image update
  triggerProfileImageUpdate: () => void
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  profileImageUpdateTrigger: 0,
  triggerProfileImageUpdate: () =>
    set((state) => ({
      profileImageUpdateTrigger: state.profileImageUpdateTrigger + 1,
    })),
}))
