# 📚 BookStore — MERN Stack E-Commerce Application

Your one-stop destination for all things books. A full-stack book shopping platform built with MongoDB, Express.js, React.js, and Node.js.

> **Note on scope:** This is a complete, working implementation of the core BookStore experience — authentication, catalog, search/filter/sort, cart, wishlist, checkout, orders, reviews, and an admin panel with dashboard stats. Payment methods (UPI/Card) are captured and stored but **not connected to a real payment gateway** — this is a simulated checkout suitable for demos and mentor evaluation, not real transactions. Emails (reset-password, order confirmation) are not wired to a real mail provider; the forgot-password flow returns the reset token directly in the API response for demo convenience.
>
> **Book covers:** since the 50 seeded books are generated sample titles (not real published books), the seed script generates a unique, colorful SVG cover for each one (title/author/category styled on a gradient) rather than using placeholder art or unrelated stock photos. Admin-uploaded books use a real image via Multer as usual.
>
> **Design:** the UI uses a warm cream/beige gradient background with violet/gold accents, entrance and hover animations throughout, a split-screen layout for Login/Register/Forgot Password (decorative gradient panel + form), and a banner-style Profile page with an overlapping avatar — built to look distinct rather than using framework defaults.

---

## Features

### Customer
- Register / Login with JWT authentication, Forgot Password flow
- Browse books with search (title/author), category & language filters, price range, minimum rating, and sorting (price, rating, latest)
- Book details page with related books and customer reviews
- Add to Cart, Add to Wishlist, Buy Now
- Cart with quantity controls, coupon codes (`BOOK10`, `WELCOME50`), GST + delivery calculation
- Checkout with shipping address and payment method selection (COD / UPI / Credit / Debit)
- Order history, order tracking (Pending → Processing → Shipped → Delivered), cancel order, printable invoice
- Write / edit / delete reviews and ratings
- Profile management with profile picture upload and address book

### Admin
- Dashboard with total users, books, orders, revenue, orders-by-status and monthly revenue charts
- Book management (add/edit/delete, cover image upload)
- Category management (CRUD)
- User management (view, suspend/activate, delete)
- Order management (view all orders, update status)
- Review moderation (delete offensive reviews)

---

## Technology Stack

**Frontend:** React.js, React Router DOM, Axios, Context API, custom CSS
**Backend:** Node.js, Express.js, JWT, bcryptjs, Multer, express-validator, Helmet, CORS, express-rate-limit
**Database:** MongoDB with Mongoose ODM

---

## Folder Structure

```
bookstore/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Navbar, Footer, BookCard, route guards
│       ├── pages/          # Route-level pages (Home, Books, Cart, etc.)
│       │   └── admin/      # Admin dashboard pages
│       ├── context/        # AuthContext, CartContext (Context API)
│       ├── services/       # Axios instance
│       ├── App.js / App.css
│       └── index.js / index.css
├── server/                 # Express backend
│   ├── config/             # DB connection, seed script
│   ├── controllers/        # Route handlers
│   ├── middleware/         # auth (JWT), upload (multer), error handler
│   ├── models/              # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── uploads/            # Uploaded images (book covers, avatars)
│   └── server.js           # App entry point
├── package.json             # Root scripts (dev, seed)
└── .gitignore
```

---

## Installation & Setup

### Prerequisites
- Node.js v16+ and npm v8+
- MongoDB (local install or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- Git

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd bookstore
npm run install-all
```

This installs the root, `server/`, and `client/` dependencies.

### 2. Configure environment variables

**Server** — copy `server/.env.example` to `server/.env` and fill in your values:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bookstore
JWT_SECRET=replace_this_with_a_long_random_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@bookstore.com
ADMIN_PASSWORD=Admin@12345
```

**Client** — copy `client/.env.example` to `client/.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Seed the database (sample data)

```bash
npm run seed
```

This creates:
- 1 admin account (`admin@bookstore.com` / `Admin@12345`, or whatever you set in `.env`)
- 20 sample customers (`user1@example.com` ... `user20@example.com`, password `Password@123`)
- 11 categories
- 50 books
- 30 reviews

### 4. Run the app

```bash
npm run dev
```

This runs the backend (port 5000) and frontend (port 3000) concurrently.

Or run them separately:

```bash
npm run server   # backend only
npm run client   # frontend only
```

Visit **http://localhost:3000**.

---

## API Documentation (key endpoints)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a customer | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get logged-in user | User |
| POST | `/api/auth/forgot-password` | Request reset token | Public |
| POST | `/api/auth/reset-password/:token` | Reset password | Public |
| GET | `/api/books` | List books (search/filter/sort/paginate) | Public |
| GET | `/api/books/:id` | Book detail + reviews + related | Public |
| POST/PUT/DELETE | `/api/books/:id` | Manage books | Admin |
| GET/POST/PUT/DELETE | `/api/categories` | Manage categories | Public read / Admin write |
| GET/POST/PUT/DELETE | `/api/cart/*` | Cart operations | User |
| GET/POST/DELETE | `/api/wishlist/*` | Wishlist operations | User |
| POST | `/api/orders` | Place order | User |
| GET | `/api/orders/my-orders` | Own order history | User |
| PUT | `/api/orders/:id/cancel` | Cancel own order | User |
| GET | `/api/orders` | All orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |
| POST/PUT/DELETE | `/api/reviews/:id` | Manage reviews | User (own) / Admin (delete any) |
| PUT | `/api/users/profile` | Update own profile | User |
| GET | `/api/users` | List customers | Admin |
| PUT | `/api/users/:id/status` | Suspend/activate | Admin |
| GET | `/api/users/admin/stats` | Dashboard stats | Admin |

Full request/response contracts are visible directly in `server/controllers/*.js` — each function has a `@route` comment.

---

## Testing Guide

1. **Register** a new customer account, confirm you're redirected and logged in.
2. **Browse** `/books`, try search, category filter, price range, and sort options.
3. **Add to cart / wishlist** from a book card or its detail page.
4. Apply coupon `BOOK10` in the cart, confirm the discount recalculates GST and total.
5. **Checkout** with a shipping address, select any payment method, place the order.
6. Check `/orders` — confirm tracking steps and try **Cancel Order** and **Invoice** print.
7. **Write a review** on a purchased book, then edit/delete it.
8. Log in as **admin** (seeded credentials above) and visit `/admin`:
   - Add/edit/delete a book with a cover image
   - Update an order's status and confirm it reflects in the customer's `/orders` view
   - Suspend a user and confirm they can no longer log in

---

## Deployment

### Frontend → Vercel
1. Push the repo to GitHub.
2. Import the project in Vercel, set the **root directory** to `client`.
3. Add environment variable `REACT_APP_API_URL` = your deployed backend URL + `/api`.
4. Deploy.

### Backend → Render
1. Create a new **Web Service** on Render, root directory `server`.
2. Build command: `npm install`. Start command: `npm start`.
3. Add all variables from `server/.env.example` (with production values) in Render's Environment tab.
4. Deploy, then copy the resulting URL into the frontend's `REACT_APP_API_URL`.

### Database → MongoDB Atlas
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow network access (0.0.0.0/0 for demo purposes, or Render's static IP for production).
3. Copy the connection string into `MONGO_URI`.
4. Run `npm run seed` locally pointed at the Atlas URI (or via a one-off Render job) to populate sample data.

---

## Screenshots to Capture for Submission

- Home page (hero, categories, featured/best-seller/new-arrival sections)
- Books listing with filters applied
- Book details page with reviews
- Cart with coupon applied
- Checkout page
- Order history with tracking steps
- Admin dashboard with stats/charts
- Admin book management (add/edit form + table)
- Admin order management with status update

---

## Future Enhancements

- Real payment gateway integration (Razorpay/Stripe) in place of the simulated checkout
- Email notifications (order confirmation, password reset) via a transactional email provider
- Dark mode toggle and richer animations
- Server-side image optimization / CDN for book covers
- Automated test suite (Jest + Supertest for API, React Testing Library for UI)
