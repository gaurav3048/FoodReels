import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CART_STORAGE_KEY = 'foodReelsCart'
const CartContext = createContext(null)

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

const loadCart = () => {
  try {
    const storedCart = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]')
    return Array.isArray(storedCart) ? storedCart.filter(isValidCartItem) : []
  } catch {
    return []
  }
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo(() => {
    const addItem = (food) => {
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
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}
