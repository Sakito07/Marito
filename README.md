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
