# TripMate API Documentation

TripMate backend exposes RESTful endpoints organized around key domain resources.

## Base URL
- **Local Development**: `http://localhost:5000/api`

## Authentication

Protected endpoints require a Bearer JWT token in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### System & Health

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | Server and database status check | No |

#### Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-30T09:30:00.000Z",
  "database": "connected"
}
```

---

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new traveler account |
| `POST` | `/auth/login` | Authenticate and obtain JWT token |
| `GET` | `/auth/me` | Fetch authenticated user profile |
| `POST` | `/auth/verify-email` | Verify email token or code |

---

### Destinations & Places

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/countries` | Retrieve list of supported countries and metadata |
| `GET` | `/countries/:code` | Retrieve specific country details and cities |
| `GET` | `/places` | Search & filter tourist attractions and places |
| `GET` | `/places/:id` | Retrieve detailed place info, rating, and photos |

---

### Trips & Itineraries

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/trips` | List trips for current user | Yes |
| `POST` | `/trips` | Create a new trip itinerary | Yes |
| `GET` | `/trips/:id` | Get details and items of a trip | Yes |
| `DELETE` | `/trips/:id` | Remove a trip itinerary | Yes |

---

### Bookings & Expenses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/bookings` | List user bookings (flights, stays, tours) | Yes |
| `POST` | `/bookings` | Create a new booking | Yes |
| `DELETE` | `/bookings/:id` | Cancel a booking | Yes |
| `GET` | `/currencies` | Retrieve latest currency conversion rates | No |
