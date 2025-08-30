# Yuno Backend

Backend server for the Yuno application.

## Database Setup

The Yuno backend requires a PostgreSQL database with PostGIS extension. You have several options to set up the database:

### Option 1: Local PostgreSQL Database

1. Install PostgreSQL and PostGIS on your local machine
2. Create a database for Yuno: `createdb yuno_db`
3. Install PostGIS extension: `psql -d yuno_db -c "CREATE EXTENSION postgis;"`
4. Run the setup script: `npm run setup`

### Option 2: Neon PostgreSQL (Cloud)

1. Create an account on [Neon](https://neon.tech/)
2. Create a new PostgreSQL database
3. Edit the `setup-neon-db.js` file with your Neon credentials
4. Run the setup script: `npm run setup:neon`

### Option 3: Any PostgreSQL Database with Connection String

1. Get a PostgreSQL connection string from any provider
2. Run the setup script with your connection string:
   ```
   npm run setup:conn "postgresql://username:password@host/database"
   ```

## Starting the Server

After setting up the database, you can start the server:

```
npm run dev
```

## API Documentation

The API documentation is available at `http://localhost:5000/api` when the server is running.

## Database Schema

The database schema is defined in `database/schema.sql`. It includes:

- Users table with geospatial capabilities
- Authentication and session management
- Sparks (friend requests) system
- Chat and messaging system

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development, production)
- `FRONTEND_URL`: URL of the frontend application

These are set up automatically by the setup scripts.