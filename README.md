# Contact Management API

A modular REST API built with **Node.js, Express.js, SQLite, Zod, and Helmet** for securely managing personal and professional contacts.

## Features

- Create, retrieve, update, and delete contacts
- Contact fields: name, email, phone number, address, company
- Search by name, email, or phone number
- Company filtering
- Sorting by name, email, phone, company, created time, or updated time
- Pagination with configurable page size (maximum 100)
- Strict input validation with Zod
- Duplicate prevention using email and phone uniqueness
- Meaningful HTTP status codes and JSON error responses
- SQLite constraints and indexes
- Helmet security headers and request-body size limit
- Scalable controller/route/middleware/config structure
- Automated API tests

## Requirements

- Node.js 20+
- npm

## Setup

```bash
npm install
cp .env.example .env
npm start
```

The server runs at `http://localhost:3000` by default.

Health check:

```bash
curl http://localhost:3000/health
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/contacts` | List contacts with search/filter/sort/pagination |
| GET | `/api/contacts/:id` | Retrieve one contact |
| POST | `/api/contacts` | Create a contact |
| PATCH | `/api/contacts/:id` | Update a contact |
| DELETE | `/api/contacts/:id` | Delete a contact |

## Contact JSON

```json
{
  "name": "Jeet Shaw",
  "email": "jeet@example.com",
  "phone": "+91 1122333444",
  "address": "West Bengal",
  "company": "Example"
}
```

All five fields are required when creating a contact.

## Examples

Create:

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Jeet Shaw",
    "email":"jeet@example.com",
    "phone":"+91 111222333444",
    "address":"West Bengal",
    "company":"Example"
  }'
```

Search by name/email/phone:

```bash
curl "http://localhost:3000/api/contacts?q=jeet"
```

Filter by company:

```bash
curl "http://localhost:3000/api/contacts?company=Example"
```

Sort:

```bash
curl "http://localhost:3000/api/contacts?sort=name&order=asc"
```

Pagination:

```bash
curl "http://localhost:3000/api/contacts?page=1&limit=10"
```

Combine them:

```bash
curl "http://localhost:3000/api/contacts?q=example&company=Tech&sort=name&order=asc&page=1&limit=10"
```

## Validation and duplicate prevention

The API rejects unknown request fields and validates:

- non-empty name, address, and company
- valid email format
- plausible phone characters and length
- maximum field lengths
- non-empty PATCH requests
- positive integer IDs
- page/limit constraints

A duplicate email or phone number returns `409 Conflict`.

## HTTP status codes

- `200 OK` – successful retrieval/update
- `201 Created` – contact created
- `204 No Content` – contact deleted
- `400 Bad Request` – invalid input, ID, or pagination
- `404 Not Found` – contact/route not found
- `409 Conflict` – duplicate email or phone
- `500 Internal Server Error` – unexpected server error

## Project structure

```text
contact-management-api/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── contacts.js
│   ├── middleware/
│   │   ├── errors.js
│   │   └── requestValidation.js
│   ├── routes/
│   │   └── contacts.js
│   ├── utils/
│   │   ├── pagination.js
│   │   └── validation.js
│   ├── app.js
│   └── server.js
├── tests/
│   └── api.test.js
├── data/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Testing

```bash
npm test
```

The included tests cover health checks, contact CRUD, validation, duplicate prevention, search, company filtering, sorting, and pagination.

## Security notes

This project uses Helmet, disables the Express `X-Powered-By` header, limits JSON request bodies to 32 KB, uses parameterized SQLite statements for data values, and validates all incoming contact data before database writes.

For production deployment, add authentication/authorization, encrypted transport (HTTPS), rate limiting, audit logging, secret management, and a managed database as appropriate.
