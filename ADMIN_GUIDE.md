# CTG Bites — Admin Panel Guide

## Login

Go to: `http://localhost:3000/admin/login`

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@ctgbites.com`   |
| Password | `ctgbites2026`         |

Click **Login to Dashboard**. Wrong credentials trigger a shake animation. On success you land on `/admin/dashboard`.

> Session is stored in `localStorage` via Zustand persist. Closing the tab keeps you logged in. Click **Logout** in the sidebar to end the session.

---

## Sidebar Navigation

| Page | URL | What it does |
|---|---|---|
| Dashboard | `/admin/dashboard` | Live overview — stats + active orders |
| Online Orders | `/admin/orders/online` | All delivery orders with filters |
| Table Orders | `/admin/orders/table` | All dine-in / parcel orders with filters |
| Menu Items | `/admin/menu` | Edit items, toggle availability |

The sidebar collapses on mobile — tap the **☰** icon in the top bar to open it.

---

## Dashboard

### Stats Row

| Card | Shows |
|---|---|
| Orders Today | Count of all orders placed today |
| Pending | Count of unaccepted orders — orange pulsing dot when > 0 |
| Revenue Today | Sum of all **delivered** orders today |
| Active Tables | Number of tables with an open order |

### Live Order Columns

Two columns side by side: **Online Delivery** on the left, **Table / Parcel** on the right.

Each order card shows:
- Order ID, time since placed, customer name
- Table badge (table orders only)
- Countdown timer (once accepted)
- Status badge
- Item list with images
- Special notes
- Action buttons (see below)

---

## Order Lifecycle & Actions

Every order moves through this flow:

```
pending → accepted → preparing → ready → delivered
                ↘ cancelled (any stage)
```

### Accepting an Order

1. Find a **Pending** order card
2. Click **Accept**
3. A small modal appears — enter the estimated preparation time in minutes (default: 10)
4. Click **Confirm & Accept**
5. The countdown timer starts immediately on the card

### Moving Through Stages

| Current Status | Available Action | Next Status |
|---|---|---|
| accepted | Start Preparing | preparing |
| preparing | Mark Ready | ready |
| ready | Mark Delivered | delivered |
| pending | Cancel | cancelled |

> **Note:** The customer's draggable timer modal (on the table order page) reflects these status changes in real time via the shared Zustand store.

---

## Online Orders Page (`/admin/orders/online`)

- Filter by status: **All / Pending / Accepted / Preparing / Delivered / Cancelled**
- Each row shows: Order ID, time, customer name, total, status badge
- Click any row to **expand** it — shows phone, address, full item list, notes, and action buttons
- Click again to collapse

---

## Table Orders Page (`/admin/orders/table`)

Same layout as Online Orders with two additions:

- **Table badge** (e.g. `T3`) is shown prominently in every row
- **Order type chip** distinguishes `Table` (dine-in) from `Parcel` (takeaway)

---

## Menu Items Page (`/admin/menu`)

### Editing an Item

1. Click **Edit** on any menu card
2. A dialog opens with editable fields:
   - Name, Price, Badge label, Description
   - Vegetarian and Spicy checkboxes
3. Click **Save Changes** — updates are applied to the in-memory Zustand state immediately

> Changes are not persisted to a database yet (MongoDB integration is scaffolded but not wired). Refreshing the page resets to the original mock data.

### Toggling Availability

- Click **Disable** to mark an item unavailable — the card dims and shows an "Unavailable" overlay
- Click **Enable** to restore it
- Availability state is held in local component state (not in Zustand) — resets on page refresh

---

## Order Sync (Auto-accept Demo)

A background hook (`useOrderSync`) runs every 5 seconds. Any order that has been in **pending** status for more than 30 seconds is automatically accepted with a 10-minute estimate. This lets you demo the full timer flow without a second browser tab acting as the kitchen.

To disable this in production, remove `<OrderSyncProvider />` from `src/app/layout.tsx`.

---

## Draggable Timer Modal

After a customer places a table order at `/table-order`, a draggable modal appears bottom-right showing:

- Order status badge
- Circular countdown timer (turns red under 2 min)
- Item summary
- "Your food is ready! 🎉" when status = `ready`

The modal can be:
- **Dragged** anywhere on screen
- **Minimized** to a small pill (tap to restore)
- **Restored** by clicking the animated bell icon in the Navbar

---

## Routes Reference

| Route | Access | Description |
|---|---|---|
| `/admin/login` | Public | Admin login page |
| `/admin/dashboard` | Admin only | Live order dashboard |
| `/admin/orders/online` | Admin only | Online delivery orders |
| `/admin/orders/table` | Admin only | Table / parcel orders |
| `/admin/menu` | Admin only | Menu item management |
| `/table-order` | Public (kiosk) | Customer-facing table ordering |
| `/order` | Public | Customer online delivery ordering |
| `/cart` | Public | Cart + COD checkout |

---

## Coupon Codes (for testing orders)

See [COUPONS.md](COUPONS.md) for the full list. Quick reference:

| Code | Discount |
|---|---|
| `WELCOME15` | 15% off |
| `FEAST20` | 20% off |
| `NEWUSER25` | 25% off |

---

## Tech Notes for Developers

- All order state lives in `src/store/orderStore.ts` (Zustand + localStorage persist key: `ctg-bites-orders`)
- Admin auth is mock-only — `src/lib/mock-auth.ts` — replace with real JWT/session when backend is ready
- To reset all orders to the original mock data: open DevTools → Application → Local Storage → delete `ctg-bites-orders`
- To add a new order status, update `OrderStatus` in `src/types/order.ts` and add a colour config entry in `src/components/order/OrderStatusBadge.tsx`
