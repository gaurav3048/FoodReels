# Razorpay payment setup

The checkout uses Razorpay's hosted payment window. Card, UPI, net banking, and other methods shown in that window are controlled by your Razorpay account.

## Before deploying

1. Give every existing food reel a price from its partner dashboard. New food reels require a price when they are published.
2. In the service hosting `backend`, add these environment variables from your Razorpay Dashboard:

   ```text
   RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_WEBHOOK_SECRET=...
   FRONTEND_URL=https://your-vercel-project.vercel.app
   ```

   Keep the key secret only in the backend host. Do not add it to Vercel or commit it to GitHub.

3. In Razorpay Dashboard, create a webhook with this URL:

   ```text
   https://your-backend-domain/api/payment/webhook
   ```

   Use the same webhook secret as `RAZORPAY_WEBHOOK_SECRET`, and enable `payment.captured` and `payment.failed` events.

4. In Vercel, set `VITE_API_URL` to the public URL of the backend API. The Razorpay key is returned only after the logged-in user starts checkout, so no Razorpay secret belongs in the frontend settings.

5. Deploy the backend and frontend. The included `frontend/vercel.json` makes direct visits to `/cart` and `/payment/success` work on Vercel.

## Test before accepting live payments

Use Razorpay test keys first. In test mode, place an order using Razorpay's provided test payment method and confirm that the order document in MongoDB has `status: "paid"`. Then replace the three Razorpay values with live values and repeat the webhook setup for live mode.

## What the server validates

The browser sends food IDs and quantities only. The server reloads each food price from MongoDB, creates the Razorpay order for that calculated amount, and checks Razorpay's HMAC signature before an order is marked paid. This avoids trusting cart prices supplied by the browser.
