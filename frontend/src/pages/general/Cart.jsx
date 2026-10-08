import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { formatINR } from '../../utils/money'
import '../../styles/cart.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://foodreels-a3rq.onrender.com'
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

const loadRazorpayCheckout = () => {
  if (window.Razorpay) return Promise.resolve()
  if (window.foodReelsRazorpayLoader) return window.foodReelsRazorpayLoader

  window.foodReelsRazorpayLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Unable to load the secure payment page.'))
    document.body.appendChild(script)
  })

  return window.foodReelsRazorpayLoader
}

const Cart = () => {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const [error, setError] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const navigate = useNavigate()

  const startPayment = async () => {
    if (!items.length || isPaying) return

    setError('')
    setIsPaying(true)

    try {
      const [{ data: paymentOrder }] = await Promise.all([
        axios.post(`${API_BASE_URL}/api/payment/orders`, {
          items: items.map((item) => ({ foodId: item.foodId, quantity: item.quantity })),
        }, { withCredentials: true }),
        loadRazorpayCheckout(),
      ])

      if (!window.Razorpay) {
        throw new Error('Unable to open the secure payment page.')
      }

      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'FoodReels',
        description: `${itemCount} food item${itemCount === 1 ? '' : 's'}`,
        order_id: paymentOrder.gatewayOrderId,
        theme: { color: '#e95e38' },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
        handler: async (response) => {
          try {
            await axios.post(`${API_BASE_URL}/api/payment/verify`, {
              orderId: paymentOrder.orderId,
              ...response,
            }, { withCredentials: true })

            clearCart()
            navigate(`/payment/success?order=${encodeURIComponent(paymentOrder.orderId)}`)
          } catch (verificationError) {
            setError(verificationError.response?.data?.message || 'We could not verify the payment. Please contact support if money was debited.')
            setIsPaying(false)
          }
        },
      })

      checkout.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment was not completed. Please try again.')
        setIsPaying(false)
      })
      checkout.open()
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to start payment. Please try again.')
      setIsPaying(false)
    }
  }

  return (
    <main className="cart-page">
      <header className="cart-header">
        <Link className="cart-brand" to="/explore"><span aria-hidden="true">F</span> FoodReels</Link>
        <Link className="cart-continue-link" to="/explore">Continue exploring</Link>
      </header>

      <section className="cart-layout" aria-labelledby="cart-title">
        <div className="cart-items-panel">
          <p className="cart-kicker">Your order</p>
          <h1 id="cart-title">Your cart</h1>
          <p className="cart-intro">Review your items before secure payment.</p>

          {!items.length ? (
            <div className="cart-empty">
              <h2>Your cart is empty</h2>
              <p>Add a dish from a food partner's menu to place an order.</p>
              <Link to="/explore">Explore food reels</Link>
            </div>
          ) : (
            <ul className="cart-items-list">
              {items.map((item) => (
                <li className="cart-item" key={item.foodId}>
                  <div>
                    <h2>{item.name}</h2>
                    <p>{formatINR(item.price)} each</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-quantity" aria-label={`Quantity for ${item.name}`}>
                      <button type="button" onClick={() => updateQuantity(item.foodId, item.quantity - 1)} aria-label={`Remove one ${item.name}`}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.foodId, item.quantity + 1)} disabled={item.quantity >= 10} aria-label={`Add one ${item.name}`}>+</button>
                    </div>
                    <strong>{formatINR(item.price * item.quantity)}</strong>
                    <button className="cart-remove" type="button" onClick={() => removeItem(item.foodId)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <aside className="cart-summary" aria-label="Order summary">
            <h2>Order summary</h2>
            <div className="cart-summary-row"><span>Items ({itemCount})</span><span>{formatINR(subtotal)}</span></div>
            <div className="cart-summary-row"><span>Delivery</span><span>Calculated by the partner</span></div>
            <div className="cart-total"><span>Food total</span><strong>{formatINR(subtotal)}</strong></div>
            <p className="cart-total-note">The final amount is always recalculated securely from the current menu prices.</p>
            {error && <p className="cart-error" role="alert">{error}</p>}
            <button className="cart-pay-button" type="button" onClick={startPayment} disabled={isPaying}>
              {isPaying ? 'Opening secure payment…' : `Pay ${formatINR(subtotal)}`}
            </button>
            <p className="cart-secure-note"><span aria-hidden="true">⌁</span> Payment is processed securely by Razorpay.</p>
          </aside>
        )}
      </section>
    </main>
  )
}

export default Cart
