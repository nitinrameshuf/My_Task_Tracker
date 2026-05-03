from django.db import models


class FamilyMember(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#6366f1')  # hex color
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    color = models.CharField(max_length=7, default='#64748b')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Chore(models.Model):
    PRIORITY_HIGH = 'high'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_LOW = 'low'
    PRIORITY_CHOICES = [
        (PRIORITY_HIGH, 'High'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_LOW, 'Low'),
    ]

    RECURRENCE_NONE = 'none'
    RECURRENCE_DAILY = 'daily'
    RECURRENCE_WEEKLY = 'weekly'
    RECURRENCE_MONTHLY = 'monthly'
    RECURRENCE_CHOICES = [
        (RECURRENCE_NONE, 'None'),
        (RECURRENCE_DAILY, 'Daily'),
        (RECURRENCE_WEEKLY, 'Weekly'),
        (RECURRENCE_MONTHLY, 'Monthly'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='chores'
    )
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)
    assignee = models.ForeignKey(
        FamilyMember, on_delete=models.SET_NULL, null=True, blank=True, related_name='chores'
    )

    recurrence_type = models.CharField(
        max_length=10, choices=RECURRENCE_CHOICES, default=RECURRENCE_NONE
    )
    # For weekly: JSON list of weekday ints 0=Mon … 6=Sun, e.g. [0, 2, 4]
    recurrence_days = models.JSONField(default=list, blank=True)
    # For monthly: day of month 1–31
    recurrence_day_of_month = models.IntegerField(null=True, blank=True)

    start_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def occurs_on(self, date):
        """Return True if this chore is scheduled to occur on the given date."""
        if not self.is_active:
            return False
        if date < self.start_date:
            return False
        if self.recurrence_type == self.RECURRENCE_NONE:
            return date == self.start_date
        if self.recurrence_type == self.RECURRENCE_DAILY:
            return True
        if self.recurrence_type == self.RECURRENCE_WEEKLY:
            return date.weekday() in (self.recurrence_days or [])
        if self.recurrence_type == self.RECURRENCE_MONTHLY:
            return date.day == self.recurrence_day_of_month
        return False


class ChoreCompletion(models.Model):
    chore = models.ForeignKey(Chore, on_delete=models.CASCADE, related_name='completions')
    date = models.DateField()
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('chore', 'date')
        ordering = ['-date']

    def __str__(self):
        return f'{self.chore.name} — {self.date}'
