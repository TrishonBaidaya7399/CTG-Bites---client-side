# CTG Bites — Coupon Codes

All coupons are applied at checkout. Enter the code in the **Coupon** field and click **Apply**.

| Code         | Discount | Notes                        |
|--------------|----------|------------------------------|
| `CTGBITES10` | 10% off  | General promo                |
| `WELCOME15`  | 15% off  | First-time users             |
| `FEAST20`    | 20% off  | Mezzban feast orders         |
| `BHORTA5`    | 5% off   | Budget saver                 |
| `NEWUSER25`  | 25% off  | New account special          |

## How it works

1. Add items to cart
2. Go to **Cart** page
3. Enter a coupon code in the Coupon field
4. Click **Apply** — discount is shown immediately
5. Proceed to checkout and place your order via **Cash on Delivery**

## Adding new coupons (developers)

Edit `src/store/cart.ts` — the `COUPONS` object maps `CODE → percentage`:

```ts
export const COUPONS: Record<string, number> = {
  CTGBITES10: 10,
  WELCOME15:  15,
  // Add new codes here
  SUMMER30:   30,
};
```

Codes are case-insensitive on input (normalised to uppercase internally).
