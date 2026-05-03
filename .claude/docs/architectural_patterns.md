# Architectural Patterns

Patterns that appear across multiple files in this codebase.

---

## 1. On-the-fly occurrence generation (no stored occurrences)

Chore occurrences are never persisted. `ChoreCompletion` only records *completed* dates (sparse). When the calendar needs a date range, `get_chores_for_range()` computes all expected occurrences by iterating active chores and calling `chore.occurs_on(date)` on each.

- Entry point: [backend/chores/calendar_utils.py:8](../../backend/chores/calendar_utils.py#L8)
- Recurrence logic lives on the model: [backend/chores/models.py:79](../../backend/chores/models.py#L79)
- Overdue carry-forward (high-priority only, up to 14 days back): [backend/chores/calendar_utils.py:39](../../backend/chores/calendar_utils.py#L39)

**Consequence:** Adding a new recurrence type requires changes in exactly two places: `Chore.occurs_on()` and the `RECURRENCE_CHOICES` constant, both in `models.py`.

---

## 2. Dual-field serializer pattern (FK id + nested detail)

Write fields use the FK integer id; read fields expose the full nested object under a `_detail` suffix. Both are present on the same serializer.

- Pattern: [backend/chores/serializers.py:20-27](../../backend/chores/serializers.py#L20)
- Matching TypeScript types mirror this: [frontend/src/types/index.ts:20-32](../../frontend/src/types/index.ts#L20)

Example: `Chore.category` (int, writable) + `Chore.category_detail` (Category object, read-only).

**Consequence:** When POSTing/PATCHing a chore, send `category: 3` (int). When reading, use `category_detail.name`.

---

## 3. Soft delete for chores

`Chore.is_active` acts as a soft-delete flag. The default queryset in `ChoreViewSet` filters to `is_active=True`. `DELETE /api/chores/{id}/` sets `is_active=False` rather than destroying the row (preserves completion history).

- ViewSet queryset: [backend/chores/views.py:28](../../backend/chores/views.py#L28)
- Override destroy: [backend/chores/views.py:33](../../backend/chores/views.py#L33)

---

## 4. React Query as the only client-side state store

There is no Redux, Zustand, or Context for server data. All server state (chores, family members, categories, calendar occurrences) lives in React Query's cache. `App.tsx` only holds UI state (current view, current date, open modal).

- Query hooks: [frontend/src/hooks/useCalendar.ts](../../frontend/src/hooks/useCalendar.ts)
- Global config (staleTime 30s, retry 1): [frontend/src/main.tsx:8](../../frontend/src/main.tsx#L8)

---

## 5. Invalidate-on-success cache pattern

Every mutation's `onSuccess` calls `qc.invalidateQueries()` with the affected query key(s). Mutations that affect calendar occurrences invalidate **both** `['chores']` and `['calendar']`.

- Toggle completion: [frontend/src/hooks/useCalendar.ts:36](../../frontend/src/hooks/useCalendar.ts#L36)
- Chore add/edit/delete: [frontend/src/components/chores/ChoreForm.tsx:36-47](../../frontend/src/components/chores/ChoreForm.tsx#L36)
- Family member mutations: [frontend/src/components/family/FamilyPanel.tsx:23-33](../../frontend/src/components/family/FamilyPanel.tsx#L23)
- Category mutations: [frontend/src/components/categories/CategoryPanel.tsx:23-33](../../frontend/src/components/categories/CategoryPanel.tsx#L23)

**Consequence:** Any new mutation that can affect what appears on the calendar must invalidate `['calendar']`.

---

## 6. Discriminated union for modal state

`App.tsx` holds a single `modal` state typed as a discriminated union. Opening any panel sets the variant; `onClose` always sets it to `null`.

- Type definition: [frontend/src/App.tsx:17](../../frontend/src/App.tsx#L17)
- Usage: [frontend/src/App.tsx:140-161](../../frontend/src/App.tsx#L140)

Adding a new modal: add a new variant to the `Modal` type, add a setter call, and add the conditional render.

---

## 7. Django serves the React SPA

The frontend is compiled by Vite into `backend/static/dist/` with predictable (non-hashed) filenames. Django's catch-all URL route returns `templates/index.html` for any non-API path, which loads those static assets.

- Vite output config: [frontend/vite.config.ts](../../frontend/vite.config.ts)
- Django catch-all route: [backend/config/urls.py](../../backend/config/urls.py)
- Django template: [backend/templates/index.html](../../backend/templates/index.html)

**Consequence:** After any frontend change, `npm run build` + `collectstatic` must be run before the server picks up the change in production (`DEBUG=False`).
