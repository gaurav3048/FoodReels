import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getUserId, USER_SESSION_CHANGED_EVENT } from '../utils/userSession'

const CART_STORAGE_KEY_PREFIX = 'foodReelsCart'
const CartContext = createContext(null)

const getCartStorageKey = (userId) => `${CART_STORAGE_KEY_PREFIX}:${userId}`

const isValidCartItem = (item) => {
  const price = Number(item?.price)
  const quantity = Number(item?.quantity)

  return typeof item?.foodId === 'string'
    && item.foodId.length > 0
    && typeof item?.name === 'string'
    && Number.isFinite(price)
    && price > 0
    && Number.isInteger(quantity)
    && quantity >= 1
    && quantity <= 10
}

const loadCart = (userId) => {
  if (!userId) return []

  try {
    const storedCart = JSON.parse(window.localStorage.getItem(getCartStorageKey(userId)) || '[]')
    return Array.isArray(storedCart) ? storedCart.filter(isValidCartItem) : []
  } catch {
    return []
  }
}

export const CartProvider = ({ children }) => {
  const [userId, setUserId] = useState(getUserId)
  const [items, setItems] = useState(() => loadCart(getUserId()))

  useEffect(() => {
    const syncCartWithSession = () => {
      const nextUserId = getUserId()
      setUserId(nextUserId)
      setItems(loadCart(nextUserId))
    }

    window.addEventListener(USER_SESSION_CHANGED_EVENT, syncCartWithSession)
    return () => window.removeEventListener(USER_SESSION_CHANGED_EVENT, syncCartWithSession)
  }, [])

  useEffect(() => {
    if (!userId) return
    window.localStorage.setItem(getCartStorageKey(userId), JSON.stringify(items))
  }, [items, userId])

  const value = useMemo(() => {
    const addItem = (food) => {
      if (!userId) return false

      const price = Number(food?.price)
      const foodId = typeof food?._id === 'string' ? food._id : ''

      if (!foodId || !Number.isFinite(price) || price <= 0) return false

      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.foodId === foodId)

        if (existingItem) {
          return currentItems.map((item) => (
            item.foodId === foodId
              ? { ...item, quantity: Math.min(10, item.quantity + 1), name: food.name || item.name, price }
              : item
          ))
        }

        return [...currentItems, {
          foodId,
          name: food.name || 'Food item',
          price: Math.round(price * 100) / 100,
          quantity: 1,
        }]
      })

      return true
    }

    const updateQuantity = (foodId, quantity) => {
      const nextQuantity = Number(quantity)

      if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
        setItems((currentItems) => currentItems.filter((item) => item.foodId !== foodId))
        return
      }

      setItems((currentItems) => currentItems.map((item) => (
        item.foodId === foodId
          ? { ...item, quantity: Math.min(10, nextQuantity) }
          : item
      )))
    }

    const removeItem = (foodId) => {
      setItems((currentItems) => currentItems.filter((item) => item.foodId !== foodId))
    }

    const clearCart = () => setItems([])
    const itemCount = items.reduce((count, item) => count + item.quantity, 0)
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)

    return {
      items,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }
  }, [items, userId])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}
