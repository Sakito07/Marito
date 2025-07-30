# Unbreakable

A full‑stack journaling, habit‑tracking, and productivity web application built with Node.js, Express, PostgreSQL on the backend and React + Vite + Tailwind CSS on the frontend. Unbreakable helps you build positive daily habits, keep a private journal, track tasks, practice meditation and productivity techniques, and customize your theme.

---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Demo Screenshot](#demo-screenshot)  
4. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Backend Setup](#backend-setup)  
   - [Frontend Setup](#frontend-setup)  
5. [Environment Variables](#environment-variables)  
6. [Available Scripts](#available-scripts)  
7. [API Reference](#api-reference)  
8. [Project Structure](#project-structure)  
9. [Contributing](#contributing)  
10. [License](#license)  

---

## Features

- **User Authentication**: Sign up, log in, secure password storage, JSON Web Tokens  
- **Habit Tracker**: Create, read, update, delete habits; mark daily completions  
- **Journal**: Private daily journaling with rich text support  
- **Tasks**: To‑do list CRUD operations  
- **Meditation & Productivity**: Guided meditations and productivity tools  
- **Theme Selector**: Light/dark mode toggle persisted in local storage  
- **Responsive UI**: Mobile‑first design with Tailwind CSS  
- **State Management**: Zustand for lightweight global state  

---

## Tech Stack

| Layer       | Technology                         |
| ----------- | ---------------------------------- |
| Backend     | Node.js, Express                   |
| Database    | PostgreSQL (pg)                    |
| Auth        | JSON Web Tokens (JWT)              |
| Frontend    | React, Vite, Tailwind CSS          |
| State Mgmt. | Zustand                            |
| Linting     | ESLint                             |

---

## Demo Screenshot

![Unbreakable Demo](public/screenshot-for-readme.png)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14+  
- [npm](https://www.npmjs.com/) v6+  
- [PostgreSQL](https://www.postgresql.org/) v12+  

### Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
### Backend Setup

**1. Copy the example environment file and fill in your credentials:**
```bash
cp .env.example .env
# then edit .env with your DB_USER, DB_PASSWORD, DB_HOST, DB_DATABASE, DB_PORT, jwtSecret

2. Install dependencies:
npm install

3. Start the development server (auto‑restarts on change):
npm run start



The frontend will be available at http://localhost:5173/ (or the port shown in your console).

Environment Variables
Create a .env file in the backend folder and define:

env
Copy
Edit
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_DATABASE=your_database
DB_PORT=5432
PORT=3000
jwtSecret=your_jwt_secret
nodeENV=development
Available Scripts
Backend (in /backend)
npm run start
Starts the Node.js server with automatic reload on changes.

npm run lint
Runs ESLint to check code quality.

Frontend (in /frontend)
npm run dev
Starts Vite dev server with hot module replacement.

npm run build
Bundles the app for production into /dist.

npm run preview
Serves the production build locally.

npm run lint
Runs ESLint on the React codebase.

API Reference
Base URL
bash
Copy
Edit
http://localhost:3000/api
Authentication
Endpoint	Method	Body	Description
/users/signup	POST	{ username, email, password }	Register a new user
/users/login	POST	{ email, password }	Log in and receive a JWT token

Include the token in Authorization: Bearer <token> for protected routes.

Habits
Endpoint	Method	Body	Description
/habits	GET	—	List all habits for the user
/habits	POST	{ title, frequency }	Create a new habit
/habits/:id	PUT	{ title, frequency }	Update habit by ID
/habits/:id	DELETE	—	Delete habit by ID
/habits/:id/check	POST	—	Mark habit as completed today

Journal
Endpoint	Method	Body	Description
/journal	GET	—	List all journal entries
/journal	POST	{ content }	Create a new entry
/journal/:id	PUT	{ content }	Update an entry by ID
/journal/:id	DELETE	—	Delete an entry by ID

Tasks
Endpoint	Method	Body	Description
/tasks	GET	—	List all tasks
/tasks	POST	{ title, dueDate }	Create a new task
/tasks/:id	PUT	{ title, dueDate }	Update a task by ID
/tasks/:id	DELETE	—	Delete a task by ID

Project Structure
bash
Copy
Edit
Unbreakable/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── database/         # DB connection
│   │   └── server.js         # App entry point
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── .gitignore
└── frontend/
    ├── public/               # Static assets (index.html, icons, screenshots)
    ├── src/
    │   ├── assets/           # Images, icons
    │   ├── components/       # Shared React components
    │   ├── constants/        # App constants
    │   ├── pages/            # Page-level components
    │   ├── store/            # Zustand stores
    │   └── App.jsx           # Main React component
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
Contributing
Fork the repository

Create a feature branch (git checkout -b feature/my-feature)

Commit your changes (git commit -m "feat: add my feature")

Push to your branch (git push origin feature/my-feature)

Open a Pull Request

Please follow the existing code style and include tests for new functionality.

License
This project is licensed under the MIT License. See the LICENSE file for details.
