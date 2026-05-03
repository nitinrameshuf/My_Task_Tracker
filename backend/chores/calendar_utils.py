from datetime import date, timedelta
from .models import Chore, ChoreCompletion


MAX_OVERDUE_LOOKBACK_DAYS = 14


def get_chores_for_range(start: date, end: date) -> list[dict]:
    """
    Return all chore occurrences (including overdue carry-overs) for [start, end].
    Each occurrence is a dict matching CalendarChoreSerializer.
    """
    chores = list(Chore.objects.filter(is_active=True).select_related('category', 'assignee'))

    # Collect all dates we need completions for (range + lookback for overdue)
    lookback_start = start - timedelta(days=MAX_OVERDUE_LOOKBACK_DAYS)
    completions = set(
        ChoreCompletion.objects.filter(
            date__gte=lookback_start, date__lte=end
        ).values_list('chore_id', 'date')
    )

    occurrences = []

    for current_date in _date_range(start, end):
        for chore in chores:
            if chore.occurs_on(current_date):
                completed = (chore.id, current_date) in completions
                occurrences.append(_make_occurrence(chore, current_date, completed, False, None))

        # Attach overdue high-priority chores (not already shown today from normal schedule)
        if start <= current_date <= end:
            overdue = _find_overdue(chores, current_date, completions, occurrences)
            occurrences.extend(overdue)

    return occurrences


def _find_overdue(chores, target_date: date, completions: set, existing: list) -> list[dict]:
    overdue = []
    existing_ids_today = {o['id'] for o in existing if o['date'] == target_date}

    for chore in chores:
        if chore.priority != Chore.PRIORITY_HIGH:
            continue
        if chore.id in existing_ids_today:
            continue

        # Look back up to MAX_OVERDUE_LOOKBACK_DAYS for a missed occurrence
        for delta in range(1, MAX_OVERDUE_LOOKBACK_DAYS + 1):
            past_date = target_date - timedelta(days=delta)
            if past_date < chore.start_date:
                break
            if chore.occurs_on(past_date) and (chore.id, past_date) not in completions:
                # Found an uncompleted high-priority occurrence — carry it forward
                overdue.append(_make_occurrence(chore, target_date, False, True, past_date))
                existing_ids_today.add(chore.id)
                break

    return overdue


def _make_occurrence(chore, occurrence_date: date, is_completed: bool, is_overdue: bool, overdue_from) -> dict:
    return {
        'id': chore.id,
        'name': chore.name,
        'description': chore.description,
        'priority': chore.priority,
        'category': {
            'id': chore.category.id,
            'name': chore.category.name,
            'color': chore.category.color,
            'created_at': chore.category.created_at.isoformat(),
        } if chore.category else None,
        'assignee': {
            'id': chore.assignee.id,
            'name': chore.assignee.name,
            'color': chore.assignee.color,
            'created_at': chore.assignee.created_at.isoformat(),
        } if chore.assignee else None,
        'recurrence_type': chore.recurrence_type,
        'recurrence_days': chore.recurrence_days or [],
        'recurrence_day_of_month': chore.recurrence_day_of_month,
        'start_date': chore.start_date.isoformat(),
        'date': occurrence_date.isoformat(),
        'is_completed': is_completed,
        'is_overdue': is_overdue,
        'overdue_from': overdue_from.isoformat() if overdue_from else None,
    }


def _date_range(start: date, end: date):
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)
