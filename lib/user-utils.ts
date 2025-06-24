/**
 * Formats user name data based on available fields
 *
 * Logic:
 * 1. If firstName exists, use it
 * 2. If firstName doesn't exist but name exists:
 *    a. If name has 2+ words, split it into firstName and lastName
 *    b. If name has only 1 word, use it as firstName
 * 3. Returns an object with firstName and lastName
 */
export function formatUserName(user: {
  firstName?: string | null
  lastName?: string | null
  name?: string | null
}): { firstName: string; lastName: string } {
  // Initialize with empty strings
  let firstName = ""
  let lastName = ""

  // Case 1: firstName exists, use it
  if (user.firstName) {
    firstName = user.firstName
    lastName = user.lastName || ""
  }
  // Case 2: firstName doesn't exist but name exists
  else if (user.name) {
    const nameParts = user.name.trim().split(/\s+/)

    // Case 2a: name has 2+ words, split into firstName and lastName
    if (nameParts.length >= 2) {
      firstName = nameParts[0]
      lastName = nameParts.slice(1).join(" ")
    }
    // Case 2b: name has only 1 word, use as firstName
    else {
      firstName = user.name.trim()
    }
  }

  return { firstName, lastName }
}

/**
 * Gets the full name from user data
 * Uses formatUserName internally and joins the result
 */
export function getFullName(user: {
  firstName?: string | null
  lastName?: string | null
  name?: string | null
}): string {
  const { firstName, lastName } = formatUserName(user)
  return [firstName, lastName].filter(Boolean).join(" ")
}
