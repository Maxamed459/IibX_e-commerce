# Thread/Form — Fashion Store Frontend

Next.js App Router + TypeScript, Redux Toolkit / RTK Query, Tailwind CSS, shadcn-style UI primitives, and Ant Design for the staff dashboard. Built to connect to the Django REST Framework API described alongside this project.

## Requirements
- Node.js 20.9+
- Django API running locally (default API base: `http://localhost:8000/api/v1`). Use `localhost` for both frontend and backend in local development so the refresh cookie is sent consistently.

## Run locally
```bash
cp .env.example .env.local
npm install
npm run dev
```
Open http://localhost:3000.

## Main routes
- `/` storefront home
- `/shop` catalog, search, category and price sorting
- `/product/[id]` product detail and add-to-cart
- `/cart` cart management
- `/checkout` checkout using a saved address
- `/login`, `/register`
- `/orders`, `/orders/[id]`
- `/account/addresses`
- `/admin` dashboard
- `/admin/products`, `/admin/categories`, `/admin/orders`

## Backend assumptions to verify
The frontend expects these paths under `NEXT_PUBLIC_API_BASE_URL`:
- `GET /products/`, `GET /products/{id}/`, `POST/PATCH/DELETE /products/`
- `GET /categories/`, `POST/PATCH/DELETE /categories/`
- `POST /auth/register/`, `POST /auth/login/`, `GET/PATCH /auth/profile/`
- `GET/POST /auth/addresses/`, `PATCH/DELETE /auth/addresses/{id}/`
- `GET /orders/cart/`, `POST /orders/cart/items/`, `PATCH/DELETE /orders/cart/items/{id}/`
- `POST /orders/checkout/`, `GET /orders/my-orders/`, `GET /orders/my-orders/{id}/`

Adjust the RTK Query definitions in `src/lib/api.ts` if your final Django URL configuration differs. API response shapes should also be confirmed against your actual serializers. The login response is expected to contain `access` and `refresh`; optional `user` data may be included. If the login endpoint does not return user/staff flags, add a `/me` endpoint or hydrate the user profile after login before relying on the dashboard UI. Always enforce staff authorization on the backend.

## Important security / production notes
- This starter stores JWTs in localStorage for simplicity. For production, prefer secure, HttpOnly cookies or a backend-for-frontend session architecture, with CSRF protections as appropriate.
- `is_staff` checks in the dashboard improve navigation UX only. They are not a security boundary; Django must enforce staff permissions for write endpoints.
- Payment by card is a placeholder until a real payment provider and webhook verification are implemented.
- Product images use a regular `<img>` element so external Django media URLs work without extra image host configuration. For production, configure `next/image` remote patterns and optimize media delivery.
- This frontend has not been compiled against your running backend. Verify serializer fields, status values, pagination, image URL formats, and checkout fields.
