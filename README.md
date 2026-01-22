# HRMS Lite

A lightweight Human Resource Management System (HRMS) designed to manage employee records and track daily attendance. This project is a full-stack web application built with a modern tech stack.

## Features

### Core Functionalities
- **Employee Management**: Add, View, and Delete employees.
- **Attendance Management**: Mark daily attendance, validate dates, and prevent duplicates.

### Bonus Features
- **Attendance Dashboard**: Visual summary and heatmap of attendance.
- **Date Filtering**: Filter records by date.
- **Stats**: Employee-specific attendance statistics.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), PostgreSQL, SQLAlchemy

## Setup & Running Locally

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in `backend/` with your database URL:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/hrms_db
   ```
5. Run the server:
   ```bash
   uvicorn backend.main:app --reload
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd hrms-lite-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
