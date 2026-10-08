import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useSearchParams } from 'react-router-dom'
import { formatINR, paiseToRupees } from '../../utils/money'
import '../../styles/cart.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://foodreels-a3rq.onrender.com'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const orderId = searchParams.get('order')

  useEffect(() => {
    if (!orderId) {
      setError('Order reference is missing.')
      return undefined
    }

    const controller = new AbortController()

    async function loadOrder() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/payment/orders/${orderId}`, {
          withCredentials: true,
          signal: controller.signal,
        })
        setOrder(response.data.order)
      } catch (requestError) {
        if (requestError.code !== 'ERR_CANCELED') {
          setError(requestError.response?.data?.message || 'Unable to load this order.')
        }
      }
    }

    loadOrder()
    return () => controller.abort()
  }, [orderId])

  return (
    <main className="payment-result-page">
      <section className="payment-result-card">
        {error ? (
          <>
            <p className="cart-kicker">Order status</p>
            <h1>We could not find that order</h1>
            <p>{error}</p>
            <Link className="payment-result-link" to="/cart">Return to cart</Link>
          </>
        ) : !order ? (
          <p>Loading your payment confirmation…</p>
        ) : (
          <>
            <div className="payment-success-icon" aria-hidden="true">✓</div>
            <p className="cart-kicker">Payment confirmed</p>
            <h1>Thank you for your order</h1>
            <p>Your payment of <strong>{formatINR(paiseToRupees(order.amount))}</strong> was received.</p>
            <p className="payment-order-reference">Order #{order._id}</p>
            <Link className="payment-result-link" to="/explore">Explore more food</Link>
          </>
        )}
      </section>
    </main>
  )
}

export default PaymentSuccess
