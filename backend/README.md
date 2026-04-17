# EIXIMARA Backend

A simple Node.js + Express backend with SQLite database for the EIXIMARA project management system.

## Quick Start

```bash
cd backend
npm install
npm start
```

The server will start at **http://localhost:3001**

## Default Admin Account

- **Email:** admin@eiximara.com
- **Password:** admin123

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (requires auth) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get user's projects (admin sees all) |
| GET | `/api/projects/:id` | Get single project |
| POST | `/api/projects` | Create new project (booking) |
| POST | `/api/projects/:id/payment` | Submit payment URL |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | Get all messages |
| GET | `/api/messages/project/:id` | Get project messages |
| POST | `/api/messages` | Send a message |
| GET | `/api/messages/unread/count` | Get unread count |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| PUT | `/api/admin/projects/:id/status` | Update project status |
| PUT | `/api/admin/projects/:id/verify-payment` | Verify payment |
| PUT | `/api/admin/projects/:id/payment-amount` | Set payment amount |
| PUT | `/api/admin/projects/:id/deliver` | Deliver project |
| PUT | `/api/admin/projects/:id/transfer-github` | Mark GitHub as transferred |
| GET | `/api/admin/users` | Get all users |

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database

The SQLite database is stored at `backend/eiximara.db` and includes:
- `users` - User accounts
- `projects` - Project bookings
- `messages` - User-admin communication
- `status_history` - Project status timeline

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `JWT_SECRET` | (default) | JWT signing secret (change in production!) |

## Project Structure

```
backend/
├── server.js          # Main Express server
├── database.js        # SQLite setup & schema
├── package.json       # Dependencies
├── middleware/
│   └── auth.js        # JWT authentication
└── routes/
    ├── auth.js        # Auth endpoints
    ├── projects.js    # Project endpoints
    ├── messages.js    # Message endpoints
    └── admin.js       # Admin endpoints
```
