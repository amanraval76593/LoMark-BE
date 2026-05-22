# LoMark Backend

Location-aware commerce infrastructure for neighborhood sellers, built as a backend system design project rather than a catalog-first shopping clone.

LoMark models the harder parts of local-market fulfillment: seller service areas, geospatial discovery, reserved inventory, buyer/seller role boundaries, order snapshots, and multi-database consistency. The goal is to show how a practical marketplace backend can be structured when availability, distance, and transactional correctness matter more than storefront UI polish.

## Why This Project Stands Out

Most marketplace demos stop at users, products, and carts. LoMark goes deeper into backend concerns that appear in real systems:

- Location-aware product discovery using seller coordinates and delivery radius rules.
- Hybrid persistence with PostgreSQL/PostGIS for relational workflows and MongoDB for flexible product inventory documents.
- Inventory reservation logic that prevents overselling by tracking total, reserved, and sold quantities.
- Order creation flow that coordinates MongoDB inventory updates with PostgreSQL order records.
- Role-based access for users, sellers, delivery partners, and admins.
- Centralized validation, error handling, logging, and modular service boundaries.

## Core Idea

LoMark is a backend for local producers and neighborhood buyers. A seller creates a geo-tagged profile, publishes available goods, and defines the delivery radius. Buyers discover only the products that are actually serviceable from their location. When an order is created, the system reserves inventory and stores a durable relational order snapshot.

This makes the project less about "online shopping" and more about solving backend problems around locality, stock correctness, and domain-driven API design.

## Tech Stack

| Area | Technology | Why it is used |
| --- | --- | --- |
| Runtime | Node.js | Lightweight API runtime for I/O-heavy backend services |
| Language | TypeScript | Stronger contracts across controllers, services, repositories, and DTOs |
| Framework | Express 5 | HTTP routing, middleware composition, and API structure |
| Relational DB | PostgreSQL | Users, sellers, orders, order items, ratings, and transactional records |
| Geospatial SQL | PostGIS | Seller location storage with geography points and spatial indexing |
| Document DB | MongoDB + Mongoose | Product catalog, stock counters, seller delivery metadata, and geo queries |
| Cache | Redis | Fast temporary user/session-style data caching |
| Auth | JWT + bcryptjs | Token-based authentication and secure password hashing |
| Validation | Zod | Request schema validation before business logic runs |
| Tooling | ESLint, TypeScript, Nodemon | Static checks, development workflow, and maintainable code style |
| Infra | Docker Compose | Local PostgreSQL, MongoDB, Redis, and PostGIS setup |

## Architecture

The codebase follows a layered module structure:

```txt
src/
  modules/
    auth/       authentication and user registration
    seller/     seller profile, location, and delivery radius
    product/    catalog, inventory, geospatial discovery
    orders/     order creation, order items, status workflows
  middleware/   auth, role guard, validation, logging, errors
  database/     PostgreSQL, MongoDB, and Redis clients
  routes/       application route registration
  errors/       typed application errors
```

Each domain is separated into router, controller, service, repository, validation, types, and interfaces. This keeps HTTP concerns, business rules, and database access from bleeding into each other.

## Key Engineering Decisions

### Hybrid Data Model

PostgreSQL is used for relational records where consistency and references matter: users, seller profiles, orders, order items, and ratings. MongoDB is used for product documents where flexible catalog data, embedded seller delivery metadata, and stock counters are useful.

This split demonstrates choosing the database around the access pattern instead of forcing all data into one model.

### Geospatial Product Discovery

Products store seller location as a GeoJSON point and use a `2dsphere` index. Product discovery runs a geo query from the buyer location, computes distance, and returns only products within the seller's configured delivery radius.

PostGIS is also enabled in PostgreSQL for seller profile location storage and spatial indexing.

### Inventory Reservation

Product stock is represented with:

- `total_quantity`
- `reserved_quantity`
- `sold_quantity`
- computed `available_quantity`

During order creation, inventory is reserved before the order is finalized. The repository uses conditional MongoDB updates so stock is only deducted when enough quantity is still available.

### Order Snapshotting

Orders are stored in PostgreSQL with order items containing product name, product id, price snapshot, and quantity. This protects historical order records from future product name or price changes.

### Failure Handling Across Stores

Order creation touches both MongoDB and PostgreSQL. The service attempts MongoDB transaction support where available and also restores reserved inventory if downstream order creation fails. This is intentionally designed around failure paths, not only the happy path.

## API Surface

Base routes currently registered:

```txt
GET  /                       health check
/api/auth                    authentication
/api/seller                  seller profile and location
/api/product                 product catalog and discovery
/api/order                   order creation and order retrieval
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

This starts:

- PostgreSQL with PostGIS on `5432`
- MongoDB on `27017`
- Redis on `6379`

### 3. Configure environment

Create a local `.env` file using the template below. Keep real credentials out of Git and commit only an `.env.example` when documenting required variables.

```env
PORT=<api_port>
NODE_ENV=<development_or_production>

DB_HOST=<postgres_host>
DB_PORT=<postgres_port>
DB_USER=<postgres_user>
DB_PASSWORD=<postgres_password>
DB_NAME=<postgres_database>

MONGO_URI=<mongodb_connection_string>

REDIS_HOST=<redis_host>
REDIS_PORT=<redis_port>

JWT_SECRET=<strong_jwt_secret>
```

### 4. Run the API

```bash
npm run dev
```

### 5. Build

```bash
npm run build
```

### 6. Lint

```bash
npm run lint
```

## Database Schema Highlights

The PostgreSQL initialization script creates:

- `users` with role-based identity
- `seller_profiles` with PostGIS `GEOGRAPHY(Point, 4326)`
- `orders` with lifecycle status and expiry time
- `order_items` as immutable product snapshots
- `order_addresses` for buyer/seller location snapshots
- `ratings` for buyer, seller, and product feedback

Indexes are included for email lookup, roles, order status, seller/buyer queries, and geospatial seller lookup.

## What This Demonstrates

This project is meant to communicate backend engineering ability through concrete implementation choices:

- Clean modular TypeScript API design
- Practical repository/service separation
- Secure auth primitives with JWT and hashed passwords
- Schema-first validation using Zod
- Multi-database architecture with clear responsibility boundaries
- Geospatial search and delivery radius filtering
- Inventory correctness and rollback-aware order creation
- Dockerized local development environment

## Future Improvements

- Automated test coverage for order creation and inventory reservation
- Elasticsearch for faster product search, filtering, and relevance-based discovery
- Kafka-based event-driven workflows for order events, inventory updates, notifications, and analytics
- Refresh-token based authentication
- Background job for expiring unaccepted reserved orders
- API documentation with OpenAPI/Swagger
- Payment workflow integration
- Observability with structured logs and request tracing

---

Built to showcase backend system design, database trade-offs, and production-minded API architecture in a local-market domain.
