# Deployment Guide

## 1. Deploying the Backend (Render)

Render is excellent for hosting Python FastAPI applications.

### Steps:
1.  **Push your code to GitHub/GitLab**.
2.  **Sign up/Login to [Render](https://render.com/)**.
3.  Click **New +** -> **Web Service**.
4.  Connect your repository.
5.  Configure the service:
    -   **Name**: `hrms-backend` (or similar)
    -   **Root Directory**: `.` (or leave empty if repo root)
    -   **Runtime**: `Python 3`
    -   **Build Command**: `pip install -r backend/requirements.txt`
    -   **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6.  **Environment Variables**:
    -   Scroll down to "Environment Variables".
    -   Add `DATABASE_URL`: Your PostgreSQL connection string (you can use a Render PostgreSQL database or an external one like Neon).
    -   Add `PYTHON_VERSION`: `3.10.0` (optional but recommended).
7.  Click **Create Web Service**.

**Note**: If you are using a detailed folder structure, ensure `backend/requirements.txt` is the correct path for the build command.

## 2. Deploying the Frontend (Vercel)

Vercel is the best place to deploy Vite/React apps.

### Steps:
1.  **Sign up/Login to [Vercel](https://vercel.com/)**.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the options:
    -   **Framework Preset**: Select `Vite`.
    -   **Root Directory**: Click "Edit" and select `hrms-lite-frontend`.
    -   **Build Command**: `npm run build` (default).
    -   **Output Directory**: `dist` (default).
5.  **Environment Variables**:
    -   Add `VITE_API_URL`: The URL of your deployed backend (e.g., `https://hrms-backend.onrender.com`).
6.  Click **Deploy**.

## 3. Post-Deployment Check
-   Open your Vercel URL.
-   Try adding an employee to verify the backend connection.
-   If you see CORS errors, update the `origins` list in `backend/main.py` with your Vercel domain and redeploy the backend.
