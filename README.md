# G-Tech Admin Panel

Admin dashboard for G-TECH INNOVATION laptop store management.

## Features

✅ **Admin Authentication** - Secure login system
✅ **Dashboard** - Analytics and statistics overview
✅ **Product Management** - Add, edit, delete laptops and products
✅ **Order Management** - Track and update order status
✅ **Delivery Tracking** - Monitor deliveries
✅ **Apple-style UI** - Smooth animations with Framer Motion

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## Default Admin Credentials

- **Email:** admin@gtech.com
- **Password:** admin123

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── lib/            # Utilities and store
├── types/          # TypeScript types
└── index.css       # Global styles
```

## Features Guide

### Products Management
- Add new products with images, specs, pricing
- Edit existing products
- Delete products
- Track stock levels
- Mark products as featured

### Orders Management
- View all customer orders
- Update order status (Pending → Confirmed → Shipped → Delivered)
- Generate tracking numbers
- View order details and customer info

### Delivery Tracking
- Monitor delivery status
- Track shipments
- View delivery locations

## Deployment

The app can be deployed to:
- Vercel
- Netlify
- GitHub Pages

```bash
npm run build
# Deploy the 'dist' folder
```

## License

Copyright © 2024 G-TECH INNOVATION
