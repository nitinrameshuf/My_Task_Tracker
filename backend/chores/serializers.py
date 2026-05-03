from rest_framework import serializers
from .models import FamilyMember, Category, Chore, ChoreCompletion


class FamilyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMember
        fields = ['id', 'name', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChoreSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    assignee_detail = FamilyMemberSerializer(source='assignee', read_only=True)

    class Meta:
        model = Chore
        fields = [
            'id', 'name', 'description', 'category', 'category_detail',
            'priority', 'assignee', 'assignee_detail',
            'recurrence_type', 'recurrence_days', 'recurrence_day_of_month',
            'start_date', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChoreCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoreCompletion
        fields = ['id', 'chore', 'date', 'completed_at']
        read_only_fields = ['id', 'completed_at']


class CalendarChoreSerializer(serializers.Serializer):
    """A single chore occurrence as returned by the calendar endpoint."""
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField()
    priority = serializers.CharField()
    category = CategorySerializer()
    assignee = FamilyMemberSerializer(allow_null=True)
    recurrence_type = serializers.CharField()
    recurrence_days = serializers.ListField(child=serializers.IntegerField())
    recurrence_day_of_month = serializers.IntegerField(allow_null=True)
    start_date = serializers.DateField()
    date = serializers.DateField()
    is_completed = serializers.BooleanField()
    is_overdue = serializers.BooleanField()
    overdue_from = serializers.DateField(allow_null=True)
