# Admin Panel Setup Guide

## Environment Variables

Add the following to your `.env.local` file in the frontend:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Prerequisites

1. Backend server running on `http://localhost:5000`
2. Admin user account with `ADMIN` role
3. Valid JWT token stored in `localStorage.accessToken`

## Accessing the Admin Panel

1. Login to the application with your admin account
2. Navigate to `/admin` in your browser
3. If not authenticated or not an admin, you'll be redirected to login

## Admin User Setup

Ensure your backend has admin user role assigned:

```javascript
// Example user object should have:
{
  id: "user_id",
  email: "admin@shoeshop.com",
  role: "ADMIN",  // Critical!
  // ... other fields
}
```

## Backend API Requirements

Make sure your backend has these routes properly set up:

- All routes must be prefixed with `/admin`
- All routes require `verifyAdmin` middleware
- Responses should follow standard JSON format

Example error handling:
```javascript
{
  message: "Error description",
  error: "error_code"
}
```

Example success:
```javascript
{
  message: "Success message",
  data: { /* response data */ }
}
```

## Features Checklist

- [x] Dashboard with analytics
- [x] Products CRUD operations
- [x] Product variants management
- [x] Inventory tracking and logs
- [x] Orders list and filtering
- [x] Order details and status management
- [x] Shipment tracking
- [x] Analytics dashboard
- [x] Responsive design
- [x] Authentication integration

## Troubleshooting

### Admin panel not accessible
- Check if user role is "ADMIN"
- Verify token is stored in localStorage
- Check browser console for errors

### API calls failing
- Ensure backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify authentication token is valid

### Data not loading
- Check network tab in browser DevTools
- Verify backend API endpoints are correct
- Ensure proper CORS headers on backend

## Development

To run in development mode:

```bash
npm run dev
```

Then navigate to `http://localhost:3000/admin`

## Production Deployment

1. Update `NEXT_PUBLIC_API_URL` to production backend URL
2. Build the project: `npm run build`
3. Start production server: `npm start`
4. Ensure admin user accounts are properly configured
5. Set up SSL/HTTPS for secure token transmission

## API Documentation

See `ADMIN_PANEL_README.md` for complete API documentation and feature list.
