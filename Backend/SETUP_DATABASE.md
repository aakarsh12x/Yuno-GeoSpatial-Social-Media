# Setting Up the Yuno Database

This guide will walk you through setting up a real PostgreSQL database for the Yuno application.

## Prerequisites

- PostgreSQL 12+ with PostGIS extension
- Node.js 14+ and npm
- Basic knowledge of database management

## Option 1: Local PostgreSQL Database

### Step 1: Install PostgreSQL and PostGIS

#### Windows
1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. During installation, select the PostGIS extension
3. Remember the password you set for the `postgres` user

#### macOS
```bash
brew install postgresql
brew install postgis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis
```

### Step 2: Create a Database

1. Open a terminal or command prompt
2. Log in to PostgreSQL:
   ```bash
   psql -U postgres
   ```
3. Create a database:
   ```sql
   CREATE DATABASE yuno_db;
   ```
4. Connect to the database:
   ```sql
   \c yuno_db
   ```
5. Install PostGIS extension:
   ```sql
   CREATE EXTENSION postgis;
   ```
6. Exit PostgreSQL:
   ```sql
   \q
   ```

### Step 3: Run the Setup Script

1. Navigate to the Backend directory
2. Run the setup script:
   ```bash
   npm run setup
   ```
   This will create a `.env` file with the database connection string.

## Option 2: Neon PostgreSQL (Cloud Database)

[Neon](https://neon.tech) is a serverless PostgreSQL service with a free tier that includes PostGIS support.

### Step 1: Create a Neon Account and Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Create a new database
4. Install the PostGIS extension:
   - Go to the SQL Editor
   - Run: `CREATE EXTENSION postgis;`

### Step 2: Get Your Connection String

1. In your Neon dashboard, go to the "Connection Details" tab
2. Copy the connection string (it looks like `postgresql://username:password@ep-something.region.aws.neon.tech/database`)

### Step 3: Set Up the Backend

1. Edit the `setup-neon-db.js` file with your Neon credentials, or
2. Use the connection string directly:
   ```bash
   npm run setup:conn "your-connection-string-here"
   ```

## Option 3: Any PostgreSQL Provider

You can use any PostgreSQL provider that supports PostGIS, such as:
- [ElephantSQL](https://www.elephantsql.com/)
- [Supabase](https://supabase.com/)
- [Render](https://render.com/)
- [AWS RDS](https://aws.amazon.com/rds/postgresql/)
- [DigitalOcean](https://www.digitalocean.com/products/managed-databases)

1. Create a PostgreSQL database with your provider
2. Install the PostGIS extension (if not automatically included)
3. Get your connection string
4. Run the setup script:
   ```bash
   npm run setup:conn "your-connection-string-here"
   ```

## Verifying Your Setup

After setting up the database, you can verify it's working correctly:

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Test the API endpoints:
   ```bash
   node test-api.js
   ```

## Database Schema

The Yuno database includes:

- **Users table**: Stores user profiles with geospatial data
- **Sparks table**: Manages friend requests between users
- **Chats table**: Tracks conversations between users
- **Messages table**: Stores individual messages in chats

The complete schema is defined in `database/schema.sql`.

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Check that PostgreSQL is running
2. Verify your connection string in the `.env` file
3. Make sure the PostGIS extension is installed
4. Check firewall settings if using a remote database

### Migration Errors

If migrations fail:

1. Check the database logs for specific errors
2. Ensure your PostgreSQL version is 12 or higher
3. Verify that the PostGIS extension is installed correctly

## Need Help?

If you need further assistance, please refer to:
- PostgreSQL documentation: [postgresql.org/docs](https://www.postgresql.org/docs/)
- PostGIS documentation: [postgis.net/docs](https://postgis.net/docs/)
