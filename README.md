# Task Manager

A simple task management web application built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- Create, view, update, and delete tasks
- Filter tasks by status (Pending, In Progress, Completed)
- Responsive design that works on mobile and desktop
- Clean and intuitive UI

## Tech Stack

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript

**Backend:**
- Node.js
- Express.js

**Database:**
- MongoDB

## Project Structure

```
├── models/
│   └── Task.js          # Mongoose task model
├── routes/
│   └── taskRoutes.js    # API routes for tasks
├── public/
│   ├── index.html       # Main HTML file
│   ├── styles.css       # Stylesheet
│   └── app.js           # Frontend JavaScript
├── server.js            # Express server entry point
├── package.json
└── README.md
```

## Prerequisites

Make sure you have the following installed:
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
   ```
   MONGO_URI=mongodb://localhost:27017/taskmanager
   PORT=3000
   ```
   
   Or if using MongoDB Atlas:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskmanager
   PORT=3000
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks?status=pending` | Get tasks by status |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Example Request

**Create a task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Node.js", "description": "Complete the tutorial", "status": "pending"}'
```

## Screenshots

The app includes:
- A form to add new tasks with title, description, and status
- A task list with status indicators (color-coded)
- Edit and delete functionality for each task
- Filter dropdown to view tasks by status

## Future Improvements

- User authentication
- Task due dates
- Search functionality
- Drag and drop reordering
- Task categories/tags

## License

ISC