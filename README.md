# EmployeeAuthAPI - Fastify API with JWT Authentication

A modern Node.js REST API built with Fastify, PostgreSQL, and JWT authentication. This project demonstrates secure authentication and authorization patterns using bcrypt for password hashing and JWT tokens.

## Features

- 🚀 **Fastify Framework** - Fast and low-overhead web framework
- 🔐 **JWT Authentication** - Secure token-based authentication
- 🔑 **Password Hashing** - Bcrypt for secure password storage
- 🗄️ **PostgreSQL** - Robust relational database
- 🔒 **Environment Variables** - Secure configuration management
- 🛡️ **Protected Routes** - Middleware authentication for protected endpoints

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Modern-js
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```
JWT_SECRET=your_super_secret_key_here
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=employee_db
DB_PORT=5432
```

4. Set up the database:
Ensure PostgreSQL is running and create the `employee_db` database with a `users` table:
```sql
CREATE DATABASE employee_db;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
├── server.js       # Main Fastify server and API routes
├── db.js          # Database connection pool configuration
├── package.json   # Project dependencies and metadata
└── README.md      # This file
```

## API Endpoints

### Authentication

**POST** `/login`
- Login with username and password
- Returns JWT token on success
- Request body:
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

### Protected Routes

Add `@fastify/jwt` decorator to protect routes that require authentication.

## Dependencies

- **fastify** - Web framework
- **@fastify/jwt** - JWT authentication plugin
- **pg** - PostgreSQL client
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management

## Usage

Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000` (or configured port)

## Security Considerations

⚠️ **Important**: This is a demo project. For production use:
- Store credentials securely in a vault
- Use environment variables for all sensitive data
- Implement rate limiting
- Add input validation and sanitization
- Use HTTPS
- Implement proper error handling
- Add comprehensive logging
- Implement database backup strategy

## License

ISC

## Author

Hemamalini

---

For more information on Fastify, visit: https://www.fastify.io/
