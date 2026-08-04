# Coimbatore Express - Backend API

A comprehensive Node.js/Express backend API for the Coimbatore Express news website, built with Prisma ORM and SQLite for development.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Article Management** - Full CRUD operations for articles with categories and authors
- **User Management** - Admin dashboard for managing users and permissions
- **Media Upload** - File upload system with image processing
- **Comments System** - Comment moderation and management
- **E-paper Management** - Digital newspaper issue management
- **Search & Filtering** - Advanced search and filtering capabilities
- **Dashboard Analytics** - Statistics and reporting for admins

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite (for development)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Create and migrate database**
   ```bash
   npx prisma db push
   ```

6. **Seed the database**
   ```bash
   npm run seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The server will be running on `http://localhost:5000`

## 🗄️ Database Setup

The backend uses Prisma ORM with SQLite for development. The database schema includes:

- **Users** - Admin and editor accounts
- **Authors** - Article authors and journalists
- **Categories** - Article categories
- **Articles** - News articles with full metadata
- **Comments** - Article comments with moderation
- **Media** - File uploads and media management
- **E-paper Issues** - Digital newspaper issues
- **Tags** - Article tagging system
- **Settings** - System configuration
- **Analytics** - Usage statistics

## 🔐 Default Admin Account

After seeding, use these credentials to access the admin panel:

- **Email:** admin@coimbatoreexpress.com
- **Password:** admin123

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/refresh` - Refresh token

### Public Routes
- `GET /api/public/featured-articles` - Get featured articles
- `GET /api/public/breaking-news` - Get breaking news
- `GET /api/public/trending` - Get trending articles
- `GET /api/public/category/:slug` - Get articles by category
- `GET /api/public/article/:slug` - Get single article
- `GET /api/public/search` - Search articles
- `GET /api/public/categories` - Get all categories
- `GET /api/public/sidebar` - Get sidebar data

### Articles
- `GET /api/articles` - Get all articles (with filters)
- `GET /api/articles/:slug` - Get single article
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `GET /api/articles/featured/list` - Get featured articles
- `GET /api/articles/breaking/list` - Get breaking news
- `GET /api/articles/trending/list` - Get trending articles
- `GET /api/articles/search` - Search articles

### Authors
- `GET /api/authors` - Get all authors
- `GET /api/authors/:id` - Get single author
- `POST /api/authors` - Create author
- `PUT /api/authors/:id` - Update author
- `DELETE /api/authors/:id` - Delete author
- `GET /api/authors/:id/stats` - Get author statistics

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `GET /api/categories/slug/:slug` - Get category by slug
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Comments
- `GET /api/comments` - Get comments for an article
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `PUT /api/comments/:id/status` - Moderate comment
- `GET /api/comments/moderation/pending` - Get pending comments

### Media Upload
- `POST /api/media/upload` - Upload single file
- `POST /api/media/upload-multiple` - Upload multiple files
- `GET /api/media` - Get all media files
- `GET /api/media/:id` - Get single media file
- `PUT /api/media/:id` - Update media metadata
- `DELETE /api/media/:id` - Delete media file

### E-paper
- `GET /api/epaper` - Get all e-paper issues
- `GET /api/epaper/:id` - Get single e-paper issue
- `POST /api/epaper` - Create e-paper issue
- `PUT /api/epaper/:id` - Update e-paper issue
- `DELETE /api/epaper/:id` - Delete e-paper issue
- `GET /api/epaper/:id/download` - Download e-paper PDF

### Admin Routes
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/analytics/articles` - Get article analytics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings
- `GET /api/admin/moderation` - Get content moderation queue

## 🔒 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **ADMIN** - Full access to all features
- **EDITOR** - Can manage articles, authors, and moderate content
- **AUTHOR** - Can create and edit their own articles
- **REPORTER** - Limited article creation access

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── routes/                # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── articles.js       # Article routes
│   │   ├── authors.js        # Author routes
│   │   ├── categories.js     # Category routes
│   │   ├── comments.js       # Comment routes
│   │   ├── media.js          # Media upload routes
│   │   ├── epaper.js         # E-paper routes
│   │   ├── public.js         # Public API routes
│   │   └── admin.js          # Admin routes
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # Authentication middleware
│   │   └── errorHandler.js  # Error handling
│   ├── utils/                # Utility functions
│   │   └── database.js      # Database connection
│   ├── seeds/               # Database seeders
│   │   └── seed.js         # Main seeder
│   └── server.js           # Main server file
├── uploads/                 # File upload directory
├── package.json            # Dependencies
├── .env                    # Environment variables
└── README.md              # This file
```

## 🔧 Configuration

Key environment variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## 🧪 Testing

To test the API endpoints:

1. Start the server
2. Use the seed script to create test data
3. Login to get a JWT token
4. Use the token to access protected routes

## 🚀 Deployment

For production deployment:

1. Switch to PostgreSQL database
2. Set `NODE_ENV=production`
3. Update `DATABASE_URL` for production database
4. Update CORS origins
5. Use strong JWT secrets
6. Set up proper file storage (AWS S3, etc.)
7. Configure reverse proxy (Nginx)
8. Set up SSL certificates

## 📝 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "errors": [ ... ] // Only for validation errors
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "stack": "..." // Only in development
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.