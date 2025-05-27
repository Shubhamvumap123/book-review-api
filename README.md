# Book Review API

A RESTful API built with Node.js and Express.js for managing books and reviews with JWT authentication.

## 🚀 Features

- **Authentication**: JWT-based user authentication and authorization
- **Book Management**: Add, view, and search books with detailed information
- **Review System**: Rate and review books with CRUD operations
- **Pagination**: Efficient pagination for books and reviews
- **Search**: Full-text search by title and author
- **Security**: Rate limiting, input validation, and secure headers
- **Database**: MongoDB with Mongoose ODM

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-review-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/book-review-api
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000`

## 📊 Database Schema

### User Schema
```javascript
{
  username: String (unique, 3-30 chars),
  email: String (unique, valid email),
  password: String (hashed, min 6 chars),
  timestamps: true
}
```

### Book Schema
```javascript
{
  title: String (required, max 200 chars),
  author: String (required, max 100 chars),
  genre: String (required, max 50 chars),
  description: String (optional, max 1000 chars),
  publishedYear: Number (optional, 1000-current year),
  isbn: String (optional, unique),
  addedBy: ObjectId (ref: User),
  timestamps: true
}
```

### Review Schema
```javascript
{
  book: ObjectId (ref: Book),
  user: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String (optional, max 1000 chars),
  timestamps: true,
  unique: [book, user] // One review per user per book
}
```

## 🔗 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Books

#### Add New Book (Protected)
```http
POST /api/books
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Fiction",
  "description": "A classic American novel",
  "publishedYear": 1925,
  "isbn": "978-0-7432-7356-5"
}
```

#### Get All Books (with pagination and filters)
```http
GET /api/books?page=1&limit=10&author=Fitzgerald&genre=Fiction
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `author` (optional): Filter by author (case-insensitive)
- `genre` (optional): Filter by genre (case-insensitive)

#### Get Book Details
```http
GET /api/books/:id?reviewPage=1&reviewLimit=5
```

**Query Parameters:**
- `reviewPage` (optional): Page number for reviews (default: 1)
- `reviewLimit` (optional): Reviews per page (default: 5, max: 50)

**Response:**
```json
{
  "book": {
    "id": "book-id",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Fiction",
    "description": "A classic American novel",
    "publishedYear": 1925,
    "isbn": "978-0-7432-7356-5",
    "averageRating": 4.2,
    "reviewCount": 15,
    "addedBy": {
      "username": "johndoe"
    }
  },
  "reviews": [
    {
      "id": "review-id",
      "rating": 5,
      "comment": "Excellent book!",
      "user": {
        "username": "jane"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "reviewPagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalReviews": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Reviews

#### Add Review (Protected)
```http
POST /api/books/:id/reviews
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Amazing book! Highly recommended."
}
```

#### Update Review (Protected)
```http
PUT /api/reviews/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review comment"
}
```

#### Delete Review (Protected)
```http
DELETE /api/reviews/:id
Authorization: Bearer <jwt-token>
```

### Search

#### Search Books
```http
GET /api/search?q=gatsby&page=1&limit=10
```

**Query Parameters:**
- `q` (required): Search query (searches title and author)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)

**Response:**
```json
{
  "query": "gatsby",
  "books": [
    {
      "id": "book-id",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "genre": "Fiction",
      "averageRating": 4.2,
      "reviewCount": 15
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalResults": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## 🧪 Example API Requests

### Using cURL

1. **Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. **Add a book (replace TOKEN with actual JWT):**
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "1984",
    "author": "George Orwell",
    "genre": "Dystopian Fiction",
    "description": "A dystopian social science fiction novel",
    "publishedYear": 1949
  }'
```

4. **Get all books with filters:**
```bash
curl "http://localhost:3000/api/books?page=1&limit=5&genre=Fiction"
```

5. **Search books:**
```bash
curl "http://localhost:3000/api/search?q=orwell&limit=10"
```

6. **Add a review (replace BOOK_ID and TOKEN):**
```bash
curl -X POST http://localhost:3000/api/books/BOOK_ID/reviews \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Brilliant and thought-provoking!"
  }'
```

### Using Postman

1. **Create a new collection** called "Book Review API"

2. **Set up environment variables:**
   - `base_url`: `http://localhost:3000`
   - `token`: (will be set after login)

3. **Authentication requests:**
   - POST `{{base_url}}/api/auth/signup`
   - POST `{{base_url}}/api/auth/login`
   - In login request, add to Tests tab:
     ```javascript
     if (pm.response.code === 200) {
       const response = pm.response.json();
       pm.environment.set("token", response.token);
     }
     ```

4. **Protected requests:**
   - Add to Headers: `Authorization: Bearer {{token}}`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Passwords hashed with bcryptjs
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using express-validator
- **Security Headers**: Helmet.js for secure HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Error Handling**: Sanitized error messages in production

## 📝 Design Decisions & Assumptions

### Authentication
- JWT tokens expire in 7 days by default
- Passwords must be at least 6 characters
- Email addresses are unique and case-insensitive
- Usernames are unique and 3-30 characters

### Reviews
- One review per user per book (enforced at database level)
- Ratings are integers from 1-5
- Users can only update/delete their own reviews
- Review comments are optional but limited to 1000 characters

### Pagination
- Default page size is 10 items
- Maximum page size is 100 for books, 50 for reviews and search
- Pagination includes helpful metadata (hasNext, hasPrev, etc.)

### Search
- Case-insensitive partial matching
- Searches both title and author fields
- Uses MongoDB text indexes for performance

### Data Validation
- Comprehensive input validation on all endpoints
- Sanitization of user inputs
- Proper error messages for validation failures

## 🚀 Performance Optimizations

- **Database Indexes**: 
  - Text index on title and author for search
  - Compound index on author and genre for filtering
  - Unique compound index on book+user for reviews

- **Pagination**: Efficient skip/limit queries
- **Population**: Selective field population to reduce data transfer
- **Aggregation**: Pre-calculated average ratings and review counts

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Complete Workflow Test
1. Register a user
2. Login to get JWT token
3. Add a book
4. Get all books
5. Get book details
6. Add a review
7. Update the review
8. Search for books
9. Delete the review

## 🐛 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "errors": [
    {
      "msg": "Validation error details",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## 🔧 Environment Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `MONGODB_URI` | MongoDB connection string | localhost:27017/book-review-api | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | 7d | No |
| `NODE_ENV` | Environment mode | development | No |

## 📈 Future Enhancements

- User profiles and avatars
- Book categories and tags
- Review voting (helpful/not helpful)
- Book recommendations based on ratings
- Image upload for book covers
- Social features (follow users, reading lists)
- Admin panel for content moderation
- Advanced search with filters
- Export reviews to PDF/CSV
- Email notifications for new reviews

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---


**Note**: Remember to change the `JWT_SECRET` in production and use environment-specific configurations for database connections and other sensitive settings.