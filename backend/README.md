# Task Manager API

A RESTful API built with Node.js, Express, and SQLite following SOLID design principles.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **RESTful API**: Full CRUD operations for all entities
- **SOLID Principles**: Clean architecture with separation of concerns
- **Database**: SQLite for development and testing
- **Security**: Helmet for security headers, CORS configuration
- **Validation**: Express-validator for request validation

## Architecture

### SOLID Principles Implementation

1. **Single Responsibility Principle (SRP)**
   - Each model handles only one entity
   - Controllers handle only HTTP request/response logic
   - Services handle only business logic

2. **Open/Closed Principle (OCP)**
   - BaseController can be extended for new entities
   - BaseModel provides common functionality that can be extended

3. **Liskov Substitution Principle (LSP)**
   - All models can be substituted with BaseModel
   - Controllers can be substituted with BaseController

4. **Interface Segregation Principle (ISP)**
   - Specific interfaces for different operations
   - AuthService only handles authentication concerns

5. **Dependency Inversion Principle (DIP)**
   - Controllers depend on abstractions (models)
   - Services are injected rather than instantiated

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `GET /api/tasks/family/:familyId` - Get tasks by family
- `GET /api/tasks/family/:familyId/stats` - Get task statistics

### Other Entities
Similar CRUD endpoints for:
- Families (`/api/families`)
- Family Members (`/api/family-members`)
- Contacts (`/api/contacts`)
- Doctors (`/api/doctors`)
- Appointments (`/api/appointments`)

## Installation

```bash
cd backend
npm install
```

## Environment Setup

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DB_PATH=./database.sqlite
CORS_ORIGIN=http://localhost:4200
```

## Running the API

```bash
# Development
npm run dev

# Production
npm start
```

## Database

The API uses SQLite for development. The database file (`database.sqlite`) will be created automatically on first run.

## Testing

```bash
npm test
```

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```
