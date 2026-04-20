# StadiumSync

**Goal:** A frictionless stadium experience.

StadiumSync is a comprehensive full-stack application designed to enhance the experience of stadium attendees by reducing friction in ticketing, food ordering, seat finding, and real-time updates.

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** Flask (Python)

## Getting Started

### Prerequisites
- Node.js & npm
- Python 3.8+

### Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### Setup Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

## Deployment (Render.com)

StadiumSync is optimized for a 100% free deployment on [Render.com](https://render.com).

### 1. Backend (Web Service)
1. Sign up/log in to Render and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set the following config:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app` (Render will automatically pick up the `Procfile`)
4. Click **Create Web Service**. Wait for it to build and copy the generated Render URL (e.g., `https://stadiumsync-backend.onrender.com`).

### 2. Frontend (Static Site)
1. Create a new **Static Site** on Render.
2. Connect the same GitHub repository.
3. Set the following config:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
4. Add an **Environment Variable**:
   - `VITE_API_BASE_URL` = `<Your Backend Web Service URL from step 1>`
5. Click **Create Static Site**. Your front end will be built using the correct API url.
