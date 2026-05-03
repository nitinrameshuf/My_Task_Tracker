# Home Chores

A single-screen shared family chore board. No auth — designed to run on one shared device (Jetson Nano 2GB, Ubuntu 18.04) and be viewed in a browser.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 4.2, Django REST Framework |
| Database | PostgreSQL (via psycopg2-binary) |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Data fetching | TanStack React Query v5 |
| Date utils | date-fns |

## Key Directories

```
backend/
  chores/           # Single Django app: models, views, serializers, URLs
  config/           # Django settings, root urls.py, wsgi.py
  templates/        # index.html — Django template that boots the React SPA
  static/dist/      # Vite build output (generated, not committed)
  staticfiles/      # collectstatic output (generated)

frontend/
  src/
    api/            # Thin fetch wrapper + all API calls (client.ts)
    types/          # Shared TypeScript interfaces (index.ts)
    hooks/          # React Query hooks — single source of truth for server state
    components/
      calendar/     # DayView, WeekView, MonthView, CalendarHeader
      chores/       # ChoreCard (display), ChoreForm (add/edit modal)
      family/       # FamilyPanel modal
      categories/   # CategoryPanel modal
      ui/           # Badge, Modal, ColorPicker (generic primitives)
    Sidebar.tsx     # Navigation, legend, family/category lists
    App.tsx         # Root: view state, date state, modal state
```

## Essential Commands

### Backend

```bash
cd backend
python3.8 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # Dev server at :5173, proxies /api → :8000
npm run build        # Outputs to backend/static/dist/
```

### After frontend build (production)

```bash
cd backend && python manage.py collectstatic --noinput
```

## Domain Model (quick reference)

- `FamilyMember` — name + hex color
- `Category` — name + hex color, user-created
- `Chore` — name, priority, category, assignee, recurrence rule, start_date, is_active
- `ChoreCompletion` — (chore, date) pair; sparse — only exists when completed
- Occurrences are **computed on-the-fly** by `calendar_utils.py`, never stored

See [backend/chores/models.py](backend/chores/models.py) for the full model definitions.

## Additional Documentation

| File | When to consult |
|---|---|
| [.claude/docs/architectural_patterns.md](.claude/docs/architectural_patterns.md) | Adding new endpoints, new React state, new components, or changing the calendar/overdue logic |
