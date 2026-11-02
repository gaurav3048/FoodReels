const USER_ID_KEY = 'foodReelsUserId'
export const USER_SESSION_CHANGED_EVENT = 'foodReelsUserSessionChanged'

const notifyUserSessionChange = () => {
  window.dispatchEvent(new Event(USER_SESSION_CHANGED_EVENT))
}

export const saveUserId = (user) => {
  const userId = typeof user === 'object' ? user?._id : user

  if (userId) {
    window.sessionStorage.setItem(USER_ID_KEY, String(userId))
    notifyUserSessionChange()
  }
}

export const getUserId = () => window.sessionStorage.getItem(USER_ID_KEY)

export const clearUserId = () => {
  window.sessionStorage.removeItem(USER_ID_KEY)
  notifyUserSessionChange()
}
