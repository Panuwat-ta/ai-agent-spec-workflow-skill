# Design: E-Commerce Shopping Cart

## 1. Overview
The Shopping Cart service will be implemented as a RESTful microservice built with Node.js and Express, backed by a Redis cache for fast guest cart operations and a PostgreSQL database for persistent user carts. The frontend will utilize React context and a global state manager (Zustand) to handle optimistic UI updates.

## 2. Architecture
The system follows a standard 3-tier architecture:
- **Presentation Layer**: React.js SPA consuming REST APIs.
- **Business Layer**: Node.js/Express service handling business logic (merging carts, calculating totals, verifying inventory).
- **Data Layer**: 
  - Redis: TTL-based storage for guest cart sessions (expires in 7 days).
  - PostgreSQL: Relational storage for registered user carts.

## 3. Data Model / Schema

### PostgreSQL Tables

#### \`cart\`
- \`id\` (UUID, Primary Key)
- \`user_id\` (UUID, Foreign Key -> users.id, Unique)
- \`created_at\` (Timestamp)
- \`updated_at\` (Timestamp)

#### \`cart_items\`
- \`id\` (UUID, Primary Key)
- \`cart_id\` (UUID, Foreign Key -> cart.id)
- \`product_sku\` (String, Index)
- \`quantity\` (Integer)
- \`added_at\` (Timestamp)
*(Note: Prices are deliberately NOT stored here. They are dynamically fetched from the Pricing Service to ensure accuracy).*

### Redis Schema (Guest Carts)
- **Key**: \`cart:guest:{session_id}\`
- **Value**: JSON String representing the cart items.
- **TTL**: 604800 seconds (7 days)

## 4. API Contracts

### GET /api/v1/cart
Retrieves the current cart state, including calculated totals.
- **Headers**: \`Authorization: Bearer {token}\` or \`X-Guest-Session: {session_id}\`
- **Response (200 OK)**:
  ```json
  {
    "items": [
      {
        "sku": "TSHIRT-BL-M",
        "name": "Blue T-Shirt (Medium)",
        "quantity": 2,
        "unitPrice": 19.99,
        "subtotal": 39.98
      }
    ],
    "summary": {
      "itemTotal": 39.98,
      "estimatedTax": 3.20,
      "grandTotal": 43.18
    }
  }
  ```

### POST /api/v1/cart/items
Adds a new item to the cart.
- **Body**:
  ```json
  {
    "sku": "TSHIRT-BL-M",
    "quantity": 1
  }
  ```
- **Response (201 Created)**: Returns the updated cart object.

## 5. State Management & Workflows

### Cart Merge Workflow (Guest -> Logged In)
1. User interacts with site anonymously; frontend generates \`session_id\`.
2. Items added are stored in Redis under \`cart:guest:{session_id}\`.
3. User logs in. Frontend calls \`POST /api/v1/auth/login\` and includes \`X-Guest-Session\` header.
4. Backend retrieves Redis cart.
5. Backend retrieves Postgres cart for the user.
6. Backend merges items. If SKU exists in both, quantities are summed (up to inventory limits).
7. Backend deletes Redis key and saves to Postgres.
8. Frontend receives unified cart in the login response payload.

## 6. Security & Error Handling
- **Inventory Race Conditions**: The cart does NOT reserve inventory. Inventory is only checked (and locked) during the Checkout phase. However, the \`GET /cart\` endpoint validates current stock and returns a warning flag if an item in the cart has become unavailable.
- **Tampering**: All monetary calculations are performed server-side by calling the internal Pricing Service. Client-provided prices are completely ignored.
