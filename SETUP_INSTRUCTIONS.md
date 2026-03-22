# IMPORTANT: Install React Router

Before running the application, you need to install `react-router-dom`:

## Step 1: Stop the development server
Press `Ctrl+C` in the terminal where `npm run dev` is running

## Step 2: Install react-router-dom
Run this command in PowerShell:
```
npm install react-router-dom
```

## Step 3: Start the development server again
```
npm run dev
```

## Step 4: Open in browser
Navigate to: `http://localhost:5173`

---

# Admin Panel Access

**Admin URL:** http://localhost:5173/admin
**Admin Password:** `admin123`

---

# Project Structure

```
jewels/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── ProductCard.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Shop.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Account.jsx
│   │   └── admin/
│   │       ├── AdminLogin.jsx
│   │       ├── AdminLayout.jsx
│   │       ├── Dashboard.jsx
│   │       ├── ProductManagement.jsx
│   │       └── OrderManagement.jsx
│   ├── context/            # State management
│   │   └── AppContext.jsx
│   ├── data/              # Mock data
│   │   └── products.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles & design system
```

# Features

## Customer Features
- Browse products by collection
- View product details with image gallery
- Add products to cart and wishlist
- Checkout with shipping information
- User account with order history
- Responsive design for mobile/tablet/desktop

## Admin Features
- Dashboard with revenue statistics
- Product management (add/edit/delete)
- Order management with status updates
- Secure admin authentication
- Real-time data updates

# Data Persistence
All data is stored in browser localStorage:
- Cart items
- Wishlist
- User session
- Orders
- Product modifications
