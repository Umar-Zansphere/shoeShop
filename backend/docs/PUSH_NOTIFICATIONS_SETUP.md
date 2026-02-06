# Push Notifications Setup Guide

This guide will help you set up push notifications for the SoleMate application.

## Prerequisites

- Backend and frontend applications set up
- PostgreSQL database running
- `web-push` package installed in backend
- `next-pwa` package installed in frontend

## Step 1: Generate VAPID Keys

VAPID keys are required for push notifications to authenticate your server with push services.

```bash
cd backend
node scripts/generate-vapid-keys.js
```

This will generate:
- **Public Key**: Share with frontend
- **Private Key**: Keep secret on backend
- **Subject**: Your email or website URL

## Step 2: Configure Environment Variables

### Backend (.env)

Add the following to `backend/.env`:

```env
VAPID_PUBLIC_KEY=your-generated-public-key
VAPID_PRIVATE_KEY=your-generated-private-key
VAPID_SUBJECT=mailto:admin@solemate.com
```

### Frontend (.env.local)

Add the following to `frontend/.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-generated-public-key
```

**Note**: Use the same public key in both files.

## Step 3: Run Database Migration

Create the `PushSubscription` table in your database:

```bash
cd backend
npx prisma migrate dev --name add_push_subscriptions
npx prisma generate
```

This will:
- Create the `PushSubscription` table
- Add relations to `User` and `GuestSession` tables
- Generate updated Prisma client

## Step 4: Restart Servers

Restart both backend and frontend servers to load the new environment variables:

```bash
# Backend
cd backend
npm start

# Frontend (in a new terminal)
cd frontend
npm run dev
```

## Step 5: Test Push Notifications

### Test Subscription

1. Open the frontend in your browser (http://localhost:3000)
2. After 3 seconds, you should see a notification prompt
3. Click "Enable Notifications"
4. Grant permission in the browser dialog
5. Check the browser console for confirmation

### Test Notification Delivery

#### Option 1: Using the Frontend Test Button

1. Navigate to notification settings (add this to your app)
2. Click "Send Test Notification"
3. You should see a notification appear

#### Option 2: Using API (Admin Only)

Send a test notification via API:

```bash
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "user-uuid-here",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test from the backend",
      "url": "/"
    }
  }'
```

#### Option 3: Broadcast to All Users

```bash
curl -X POST http://localhost:5000/api/notifications/broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "notification": {
      "title": "Flash Sale!",
      "body": "50% off all items",
      "url": "/sale"
    }
  }'
```

## API Endpoints

### Public Endpoints

#### Subscribe to Notifications
```
POST /api/notifications/subscribe
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "base64-encoded-key",
    "auth": "base64-encoded-secret"
  }
}
```

#### Unsubscribe from Notifications
```
DELETE /api/notifications/unsubscribe
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

### Admin Endpoints (Requires Authentication)

#### Send to Specific User
```
POST /api/notifications/send
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "user-uuid",
  "notification": {
    "title": "Order Shipped",
    "body": "Your order #12345 has been shipped",
    "url": "/orders/12345",
    "icon": "/icons/icon-192x192.png"
  }
}
```

#### Broadcast to All Users
```
POST /api/notifications/broadcast
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "notification": {
    "title": "New Arrivals",
    "body": "Check out our latest collection",
    "url": "/products/new"
  },
  "filters": {
    "onlyVerified": true
  }
}
```

## Troubleshooting

### Notifications Not Working

1. **Check VAPID Keys**: Ensure keys are correctly set in both `.env` files
2. **Check HTTPS**: Push notifications require HTTPS (or localhost for testing)
3. **Check Browser Support**: Ensure you're using a supported browser (Chrome, Firefox, Edge, Safari 16.4+)
4. **Check Permissions**: Verify notification permission is granted in browser settings
5. **Check Console**: Look for errors in browser and server console logs

### Subscription Fails

- Verify VAPID public key matches between frontend and backend
- Check that service worker is registered (DevTools → Application → Service Workers)
- Ensure database migration was successful

### Notifications Not Delivered

- Check that subscription exists in database
- Verify backend server is running
- Check server logs for web-push errors
- Ensure user/session ID is correct

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Yes |
| Firefox | ✅ Yes |
| Edge | ✅ Yes |
| Safari | ✅ Yes (16.4+) |
| Opera | ✅ Yes |

**Note**: iOS Safari requires the app to be added to home screen before notifications work.

## Security Considerations

1. **VAPID Private Key**: Never commit to version control, keep in `.env` file
2. **Admin Endpoints**: Always protected with authentication middleware
3. **Rate Limiting**: Consider adding rate limiting to prevent abuse
4. **Subscription Validation**: Validate subscription data before saving
5. **HTTPS**: Always use HTTPS in production

## Production Deployment

1. Generate production VAPID keys (different from development)
2. Add keys to production environment variables
3. Run database migration on production database
4. Ensure HTTPS is enabled
5. Test notifications in production environment
6. Monitor delivery rates and errors

## Next Steps

- Add notification preferences UI
- Implement notification categories (orders, promotions, etc.)
- Add notification history
- Implement quiet hours
- Add analytics for notification engagement
