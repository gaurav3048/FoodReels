const PARTNER_ID_KEY = 'foodPartnerId'

export const saveFoodPartnerId = (partner) => {
  const partnerId = typeof partner === 'object' ? partner?._id : partner

  if (partnerId) {
    window.sessionStorage.setItem(PARTNER_ID_KEY, String(partnerId))
  }
}

export const getFoodPartnerId = () => window.sessionStorage.getItem(PARTNER_ID_KEY)

export const clearFoodPartnerId = () => window.sessionStorage.removeItem(PARTNER_ID_KEY)
