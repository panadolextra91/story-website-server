# Getting Started & Development Instructions

## 1. Install Dependencies

```
npm install
```

## 2. Set Up Environment Variables

- Copy `.env.example` to `.env` and fill in the required values (see README below for details).

## 3. Run the Backend Server

```
npm run dev      # For development (with nodemon)
npm start        # For production
```

The server will start on [http://localhost:3000](http://localhost:3000) by default.

## 4. Run Tests

```
npm test
```
Or run specific test scripts in the `test/` directory using Node.js:
```
node test/test-reading-history.js
node test/test-user-preferences.js
node test/test-drafts-system.js
```

## 5. Prisma ORM Usage

### Access Prisma Studio (DB GUI)
```
npx prisma studio
```
Open the provided URL in your browser to visually inspect and edit your database.

### Make Changes to the Database Schema
1. Edit the `prisma/schema.prisma` file as needed.
2. Save your changes.

### Apply Migrations
```
npx prisma migrate dev --name <migration_name>
```
Replace `<migration_name>` with a descriptive name for your migration.

### Generate Prisma Client
```
npx prisma generate
```
This is usually done automatically with migrate, but you can run it manually if needed.

# Story Reading Backend

This is the backend API for a story reading website built with Node.js, Express, Prisma ORM, and PostgreSQL.

## Features

### Core Features
- User authentication and authorization with JWT
- Role-based access control (USER and ADMIN roles)
- Story management (create, read, update, delete)
- Chapter management with content and word count tracking
- Category management for organizing stories
- Comments and ratings system
- Bookmarks for saving favorite stories

### Advanced Features
- Sophisticated view counting with anti-duplicate measures
- Search functionality for finding stories by title
- Follow system for following authors and other users
- Reading history tracking with progress and last read position
- User preferences for customizing reading experience (font, theme)
- Drafts system for saving story and chapter drafts before publishing
- Image uploads using Cloudinary for user avatars and story covers

## Tech Stack

- **Node.js & Express**: Server framework
- **Prisma**: ORM for database operations
- **PostgreSQL**: Database
- **Docker**: Container for PostgreSQL database
- **JWT**: Authentication and token management
- **Bcrypt**: Password hashing and security
- **Cloudinary**: Cloud storage for images
- **Multer**: File upload handling
- **Express Middleware**: Custom middleware for error handling, authentication, and more

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Git
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd story-reading/backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration values including:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET` and `JWT_REFRESH_SECRET`: Secrets for JWT tokens
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials
- `CORS_ORIGIN`: Allowed origins for CORS

4. Start the PostgreSQL database with Docker
```bash
docker-compose up -d
```

5. Generate Prisma client and run migrations
```bash
npx prisma generate
npx prisma migrate dev
```

6. Seed the database with initial data (optional)
```bash
npx prisma db seed
```

7. Start the development server
```bash
npm run dev
```

The server will be running at http://localhost:3000.

## Project Structure

```
/src
  /config        # Configuration files
  /controllers   # Request handlers
  /middlewares   # Express middlewares
  /routes        # API routes
  /services      # Business logic
  /utils         # Utility functions
  app.js         # Express app setup
  server.js      # Server entry point
/prisma
  schema.prisma  # Database schema
  seed.js        # Database seeding
/test            # Test scripts
```

## Testing

The project includes test scripts for various features:

```bash
# Run reading history tests
node test/test-reading-history.js

# Run user preferences tests
node test/test-user-preferences.js

# Run drafts system tests
node test/test-drafts-system.js
```

## API Documentation

For detailed API documentation, refer to the `apis.md` file which contains:

- Complete list of all endpoints
- Request/response formats
- Authentication requirements
- Testing instructions for Postman

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT access tokens |
| `JWT_EXPIRES_IN` | Expiration time for access tokens |
| `JWT_REFRESH_SECRET` | Secret for JWT refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Expiration time for refresh tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CORS_ORIGIN` | Allowed origins for CORS |
| `NODE_ENV` | Environment (development, production) |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

Planned features for future development:

- Trending stories algorithm based on recent views/ratings
- Reading statistics to track reading time and stories completed
- Activity feed showing recent activities of followed users
- Real-time notifications for comments, ratings, new chapters
- Scheduled publishing for chapters
- Series/collections to group related stories
- Content warnings and age ratings
- Author analytics dashboard

## API Documentation

For a complete list of API endpoints and usage instructions, please refer to [apis.md](./apis.md).

## License

This project is licensed under the ISC License.

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/)
- [Cloudinary](https://cloudinary.com/)
