# Quant AI Mobile Rebuild

This is the clean rebuilt mobile-friendly Quant AI project.

## Backend

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
notepad .env
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Frontend

```powershell
cd frontend
npm install
copy .env.local.example .env.local
npm run dev -- --port 3002
```

Open:

```text
http://localhost:3002/dashboard
```

## Mobile Local Testing

1. Set `frontend/.env.local` to:

```text
NEXT_PUBLIC_API_URL=http://YOUR-LAPTOP-IP:8000
```

2. Run backend:

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000
```

3. Run frontend:

```powershell
npm run dev:mobile
```

4. Open on phone:

```text
http://YOUR-LAPTOP-IP:3002/dashboard
```
