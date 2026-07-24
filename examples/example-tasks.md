# Tasks: E-Commerce Shopping Cart

> **🚨 @AI INSTRUCTION FOR IMPLEMENTATION PHASE:**
> When the user asks you to start coding, you MUST strictly keep this file updated.
> Change \`- [ ]\` to \`- [x]\` as soon as you finish each task. Do not wait until the end.

## 1. Database & Schema Layer
- [ ] Create Knex migration for `cart` and `cart_items` tables in Postgres.
- [ ] Implement Postgres schema validation and indexing (specifically `user_id` on `cart` and `product_sku` on `cart_items`).
- [ ] Set up Redis connection pool and error handling in `src/config/redis.ts`.
- [ ] Create Redis helper functions (`getGuestCart`, `saveGuestCart`, `deleteGuestCart`) in `src/repositories/redisCartRepo.ts`.

## 2. Business Logic & Services
- [ ] Implement `PricingService.calculateTotals(items)` to fetch live prices and compute tax/grand total.
- [ ] Implement `CartService.addItem(cartId, sku, qty)` ensuring quantity doesn't exceed maximum limits.
- [ ] Implement `CartService.updateItem(cartId, sku, newQty)`.
- [ ] Implement `CartService.removeItem(cartId, sku)`.
- [ ] Implement `CartService.mergeCarts(guestSessionId, userId)` combining Postgres and Redis data structures.

## 3. API & Controllers
- [ ] Implement `GET /api/v1/cart` endpoint in `src/controllers/cartController.ts`.
- [ ] Implement `POST /api/v1/cart/items` endpoint with input validation using Zod.
- [ ] Implement `PUT /api/v1/cart/items/:sku` endpoint.
- [ ] Implement `DELETE /api/v1/cart/items/:sku` endpoint.
- [ ] Update `authController.ts` login route to invoke `CartService.mergeCarts` if `X-Guest-Session` header is present.

## 4. Frontend Integration
- [ ] Create `useCartStore` Zustand store in `frontend/src/store/cartStore.ts`.
- [ ] Implement `CartDrawer.tsx` component with slide-out animation.
- [ ] Implement `CartItem.tsx` component with quantity stepper and trash icon.
- [ ] Connect `Add to Cart` button on Product Detail Page to `useCartStore`.
- [ ] Implement optimistic UI updates when changing quantities (reverting on API failure).
