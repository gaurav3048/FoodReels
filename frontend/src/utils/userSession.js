const USER_ID_KEY = 'foodReelsUserId'

export const saveUserId = (user) => {
  const userId = typeof user === 'object' ? user?._id : user

  if (userId) {
    window.sessionStorage.setItem(USER_ID_KEY, String(userId))
  }
}

export const getUserId = () => window.sessionStorage.getItem(USER_ID_KEY)

export const clearUserId = () => window.sessionStorage.removeItem(USER_ID_KEY)
