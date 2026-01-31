# Task Manager

A full-featured task management web application built with Node.js, Express, MongoDB, and vanilla JavaScript. Includes user authentication, real-time statistics, and a modern responsive UI.

## Features

### Core Features
- ✅ Create, view, update, and delete tasks (CRUD)
- ✅ Task priority levels (Low, Medium, High)
- ✅ Due date tracking with overdue alerts
- ✅ Filter by status and priority
- ✅ Search tasks by title or description
- ✅ Sort by date, priority, or due date

### Advanced Features
- 🔐 **User Authentication** - JWT-based login/register system
- 📊 **Dashboard Statistics** - Real-time task metrics and completion rate
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📥 **Export to CSV** - Download tasks for external use
- ⌨️ **Keyboard Shortcuts** - Ctrl+N (new task), Ctrl+/ (search), Esc (close)
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop

## Tech Stack

**Frontend:**
- HTML5, CSS3 (CSS Variables for theming)
- Vanilla JavaScript (ES6+)

**Backend:**
- Node.js with Express.js
- JWT for authentication
- bcrypt for password hashing

**Database:**
- MongoDB with Mongoose ODM

## Project Structure

```
├── models/
│   ├── Task.js          # Task schema with priority & due dates
│   └── User.js          # User schema with password hashing
├── routes/
│   ├── taskRoutes.js    # Task CRUD + stats + export
│   └── authRoutes.js    # Login, register, user info
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── public/
│   ├── index.html       # Main HTML with modals
│   ├── styles.css       # Responsive styles + dark mode
│   └── app.js           # Frontend application logic
├── server.js            # Express server entry point
├── package.json
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (local or Atlas)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/meet1785/globaltrendass.git
   cd globaltrendass
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/taskmanager
   PORT=3000
   JWT_SECRET=your-secret-key-here
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (with filters) |
| GET | `/api/tasks/stats/summary` | Get task statistics |
| GET | `/api/tasks/export/csv` | Export tasks as CSV |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Query Parameters

```
GET /api/tasks?status=pending&priority=high&search=meeting&sortBy=dueDate
```

- `status` - Filter by status (pending, in-progress, completed)
- `priority` - Filter by priority (low, medium, high)
- `search` - Search in title and description
- `sortBy` - Sort field (createdAt, dueDate, priority)
- `order` - Sort order (asc, desc)

### Example Requests

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com", "password": "secret123"}'
```

**Create task (authenticated):**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "Complete project", "priority": "high", "dueDate": "2024-02-15"}'
```

## Screenshots

The application includes:
- Dashboard with task statistics and completion rate
- Add task form with priority and due date
- Filterable and searchable task list
- Color-coded priorities and overdue indicators
- Login/Register modal
- Dark mode toggle

## Future Improvements

- Email notifications for due tasks
- Task categories/tags
- Drag and drop reordering
- Collaborative task sharing
- Mobile app version

## License

ISC

## Future Improvements

- User authentication
- Task due dates
- Search functionality
- Drag and drop reordering
- Task categories/tags

## License

ISC