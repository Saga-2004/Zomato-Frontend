# Zomato Clone Frontend

React + Vite frontend for the Zomato-style food ordering platform. This client supports customer, admin, restaurant owner, and delivery partner workflows with protected routes and role-based dashboards.

## Live URL

- https://zomato-frontend-rosy.vercel.app

## Tech Stack

- React 19
- Vite 8
- React Router DOM 7
- Axios
- Tailwind CSS 4
- ESLint 9

## Core Features

- Role-aware authentication flow (customer, admin, restaurant owner, delivery partner)
- Public browsing of restaurants and menu items
- Customer cart and checkout flow
- Razorpay payment integration on cart checkout
- Customer order history and profile management
- Forgot/reset password flow
- Admin panel for users, orders, restaurants, analytics, and delivery partners
- Owner panel for menu management, order handling, and offers
- Delivery panel for assigned order handling
- Global toast and full-page loading UX feedback

## Main Route Overview

### Public

- /
- /login
- /signup
- /forgot-password
- /reset-password/:token
- /restaurant/:id

### Customer

- /cart
- /my-orders
- /profile

### Admin

- /admin/dashboard
- /admin/add-restaurant
- /admin/users
- /admin/users/:userId
- /admin/restaurants
- /admin/orders
- /admin/delivery-partners

### Restaurant Owner

- /owner/dashboard
- /owner/menu
- /owner/orders
- /owner/offers

### Delivery Partner

- /delivery/dashboard
- /delivery/orders

## Folder Structure

src/

- api/ API clients (Axios instance + auth calls)
- components/ Shared UI and utility components
- context/ Global auth context provider
- layouts/ Role-specific layout wrappers
- pages/ Public, customer, admin, owner, delivery pages
- utils/ Frontend utilities (for example Razorpay loader)

## Environment Variables

Create a .env file inside Frontend/ with:

VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

Notes:

- VITE_API_URL must point to backend base API path.
- In production, use your deployed backend URL, for example:
  VITE_API_URL=https://your-backend-domain.com/api

## Prerequisites

- Node.js 18+
- npm 9+

## Installation and Run

1. Install dependencies:

npm install

2. Start development server:

npm run dev

3. Build production bundle:

npm run build

4. Preview production build locally:

npm run preview

5. Run linter:

npm run lint

## Backend Integration

This frontend expects a running backend that exposes these API groups:

- /api/users
- /api/admin
- /api/restaurants
- /api/orders
- /api/menu
- /api/cart
- /api/coupons
- /api/ratings
- /api/payment

## Deployment Notes (Vercel)

- Set project root to Frontend/
- Add environment variables in Vercel project settings:
  - VITE_API_URL
  - VITE_RAZORPAY_KEY_ID
- Ensure backend CORS FRONTEND_URL allows this frontend domain.

## Troubleshooting

- Blank data or network errors:
  - Verify VITE_API_URL is correct and backend is running.
- Payment popup not opening:
  - Check VITE_RAZORPAY_KEY_ID and script loading.
- Auth-protected pages redirecting unexpectedly:
  - Clear localStorage userInfo and login again.
- CORS errors:
  - Confirm backend FRONTEND_URL matches frontend origin.
