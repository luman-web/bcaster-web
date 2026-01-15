/**
 * Constructs a user's display name from available fields
 * Falls back to email if no name fields are available
 * @param user - User object with name, surname, patronymic, and email (or null)
 * @returns Display name string, empty string if user is null
 */
export function getUserDisplayName(user: {
  name?: string | null
  surname?: string | null
  patronymic?: string | null
  email: string
} | null): string {
  if (!user) {
    return ''
  }
  
  const nameParts = [user.name, user.surname, user.patronymic].filter(Boolean)
  
  if (nameParts.length > 0) {
    return nameParts.join(' ')
  }
  
  return user.email
}
