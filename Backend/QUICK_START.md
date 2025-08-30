# Yuno Backend Quick Start Guide

This guide will help you quickly get started with the Yuno backend using a real PostgreSQL database.

## Option 1: Use a Local PostgreSQL Database

### Prerequisites
- PostgreSQL installed with PostGIS extension
- Node.js and npm installed

### Steps
1. Create a PostgreSQL database:
   ```
   createdb yuno_db
   ```

2. Install PostGIS extension:
   ```
   psql -d yuno_db -c "CREATE EXTENSION postgis;"
   ```

3. Run the setup script:
   ```
   npm run setup
   ```

4. Start the server:
   ```
   npm run dev
   ```

## Option 2: Use a Cloud PostgreSQL Database (Recommended)

### Prerequisites
- A PostgreSQL database with PostGIS from a provider like Neon, Supabase, or ElephantSQL
- Node.js and npm installed

### Steps
1. Get your PostgreSQL connection string from your provider
   (e.g., `postgresql://username:password@host/database`)

2. Run the setup script with your connection string:
   ```
   npm run setup:conn "your-connection-string-here"
   ```

3. Start the server:
   ```
   npm run dev
   ```

## Option 3: Quick Start with Connection String

If you already have a connection string, you can start the server directly:

```
npm run start:db "your-connection-string-here"
```

## Testing the API

After starting the server, you can test the API endpoints:

```
npm run test:api
```

## Available Scripts

- `npm run dev`: Start the development server
- `npm run setup`: Set up with local PostgreSQL
- `npm run setup:neon`: Set up with Neon PostgreSQL
- `npm run setup:conn`: Set up with any connection string
- `npm run migrate`: Run database migrations
- `npm run start:db`: Start server with a connection string
- `npm run test:api`: Test API endpoints

## Troubleshooting

If you encounter issues:

1. Make sure PostgreSQL is running
2. Check that PostGIS extension is installed
3. Verify your connection string is correct
4. See `SETUP_DATABASE.md` for detailed instructions

## Next Steps

After setting up the backend:

1. Start the frontend application
2. Create a user account
3. Explore the API at http://localhost:5000/api
