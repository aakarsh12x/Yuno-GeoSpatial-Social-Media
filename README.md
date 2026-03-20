# Yuno - Geospatial Social Media Platform

Live: https://frontend-6sa6005p4-aakarsh12xs-projects.vercel.app/

## Preview

![Yuno UI 1](https://github.com/user-attachments/assets/8593fec5-b255-482b-bbc3-b657316a15f6)
![Yuno UI 2](https://github.com/user-attachments/assets/e78e43d9-01fc-4a7c-bfc2-86666fdabccd)

## About

Yuno is a location-based social media platform that connects users based on proximity and shared interests. It enables real-time communication, nearby user discovery, and interactive mapping using geospatial queries.

## Key Features

- Location-based discovery within configurable radius (5km to 50km)  
- Real-time chat powered by WebSockets  
- Spark system for initiating connections  
- Interest-based matching and commonality scoring  
- Interactive map with nearby user visualization  
- Secure authentication with JWT  

## Tech Stack

### Frontend
- Next.js (App Router)  
- TypeScript  
- Tailwind CSS  
- Framer Motion  
- Socket.IO Client  

### Backend
- Node.js, Express.js  
- PostgreSQL with PostGIS  
- Socket.IO  
- JWT Authentication, bcrypt  

## Architecture Overview

- Frontend communicates with backend via REST APIs and WebSockets  
- PostgreSQL with PostGIS handles geospatial queries  
- Socket.IO manages real-time messaging and updates  
- JWT-based authentication secures user sessions  

## Setup

### Clone
```bash
git clone https://github.com/aakarsh12x/Yuno-GeoSpatial-Social-Media.git
cd Yuno-GeoSpatial-Social-Media
```

### Backend
```bash
cd Backend
npm install
```

Create `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yuno_db
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=5000
```

Setup database:
```bash
createdb yuno_db
psql yuno_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
npm run migrate
npm run seed
```

Run:
```bash
npm start
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## API Overview

### Auth
- POST `/api/auth/register`  
- POST `/api/auth/login`  

### Users
- GET `/api/users/profile`  
- PUT `/api/users/profile`  
- GET `/api/users/nearby`  

### Discovery
- GET `/api/discover`  

### Chat
- GET `/api/chat/chats`  
- POST `/api/chat/messages`  

### Sparks
- POST `/api/sparks/send`  
- POST `/api/sparks/:id/accept`  

## Project Structure

```
Yuno/
├── Frontend/
├── Backend/
```

## Deployment

- Frontend: Vercel  
- Backend: Any Node.js hosting with PostgreSQL + PostGIS  

## Author

Aakarsh  
https://github.com/aakarsh12x  
