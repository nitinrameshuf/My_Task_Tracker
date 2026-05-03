# Home Chores — Jetson Nano Setup Guide

**Stack:** Django 4.2 · PostgreSQL · React 18 · TypeScript · Vite · Tailwind CSS  
**Target:** Nvidia Jetson Nano 2GB · Ubuntu 18.04 (ARM64)

---

## 1. System prerequisites

```bash
sudo apt-get update && sudo apt-get upgrade -y

# Python 3.8 via deadsnakes PPA
sudo apt-get install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt-get update
sudo apt-get install -y python3.8 python3.8-venv python3.8-dev

# pip for Python 3.8
curl -sS https://bootstrap.pypa.io/get-pip.py | python3.8

# PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib libpq-dev

# Node.js 18 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Build tools (needed for psycopg2)
sudo apt-get install -y build-essential
```

---

## 2. PostgreSQL setup

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql

sudo -u postgres psql <<'SQL'
CREATE USER todouser WITH PASSWORD 'todopass';
CREATE DATABASE tododb OWNER todouser;
GRANT ALL PRIVILEGES ON DATABASE tododb TO todouser;
SQL
```

> Change the password in production — also set the `DB_PASSWORD` env var below.

---

## 3. Backend (Django)

```bash
cd ~/Desktop/code/todo/backend

# Create and activate virtualenv
python3.8 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Create a superuser if you want Django admin
# python manage.py createsuperuser
```

### Environment variables (optional overrides)

| Variable | Default | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | dev key | Set a real secret in production |
| `DJANGO_DEBUG` | `True` | Set `False` in production |
| `DJANGO_ALLOWED_HOSTS` | `localhost 127.0.0.1 0.0.0.0` | Space-separated hosts |
| `DB_NAME` | `tododb` | PostgreSQL database name |
| `DB_USER` | `todouser` | PostgreSQL user |
| `DB_PASSWORD` | `todopass` | PostgreSQL password |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |

Set them before starting the server:
```bash
export DB_PASSWORD="your-secure-password"
```

---

## 4. Frontend (React + Vite)

```bash
cd ~/Desktop/code/todo/frontend
npm install
npm run build
```

This compiles TypeScript and outputs the app into `backend/static/dist/`.

### Collect static files into Django's STATIC_ROOT

```bash
cd ~/Desktop/code/todo/backend
source venv/bin/activate
python manage.py collectstatic --noinput
```

---

## 5. Run the app

```bash
cd ~/Desktop/code/todo/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

Open a browser on the Jetson Nano (or any device on the same network) and visit:

```
http://localhost:8000
```

---

## 6. Auto-start on boot (optional)

Create a systemd service so the app starts automatically after a reboot:

```bash
sudo nano /etc/systemd/system/homechores.service
```

Paste:
```ini
[Unit]
Description=Home Chores Django App
After=network.target postgresql.service

[Service]
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/Desktop/code/todo/backend
Environment="DB_PASSWORD=your-secure-password"
ExecStart=/home/YOUR_USERNAME/Desktop/code/todo/backend/venv/bin/python manage.py runserver 0.0.0.0:8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable homechores
sudo systemctl start homechores
```

---

## 7. Development workflow

Run backend and frontend dev servers simultaneously for live reloading:

**Terminal 1 — Django:**
```bash
cd ~/Desktop/code/todo/backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 — Vite dev server (with hot reload):**
```bash
cd ~/Desktop/code/todo/frontend
npm run dev
```

Then open `http://localhost:5173` — Vite proxies `/api` calls to Django on port 8000.

---

## 8. Re-deploying frontend changes

After editing any frontend code:
```bash
cd ~/Desktop/code/todo/frontend
npm run build

cd ~/Desktop/code/todo/backend
source venv/bin/activate
python manage.py collectstatic --noinput
# Then restart the Django server (or it picks up static changes automatically in DEBUG=True)
```

---

## Project structure

```
todo/
├── backend/
│   ├── chores/              # Django app: models, views, serializers
│   ├── config/              # Django settings, urls, wsgi
│   ├── static/dist/         # Vite build output (committed or generated)
│   ├── staticfiles/         # collectstatic output
│   ├── templates/index.html # Django template that loads the React SPA
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/             # API client
    │   ├── components/      # React components
    │   │   ├── calendar/    # DayView, WeekView, MonthView, CalendarHeader
    │   │   ├── chores/      # ChoreCard, ChoreForm
    │   │   ├── family/      # FamilyPanel
    │   │   ├── categories/  # CategoryPanel
    │   │   └── ui/          # Badge, Modal, ColorPicker
    │   ├── hooks/           # React Query hooks
    │   └── types/           # TypeScript interfaces
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```
