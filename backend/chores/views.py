from datetime import date, datetime
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FamilyMember, Category, Chore, ChoreCompletion
from .serializers import (
    FamilyMemberSerializer, CategorySerializer,
    ChoreSerializer, ChoreCompletionSerializer,
)
from .calendar_utils import get_chores_for_range


class FamilyMemberViewSet(viewsets.ModelViewSet):
    queryset = FamilyMember.objects.all()
    serializer_class = FamilyMemberSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    http_method_names = ['get', 'post', 'patch', 'delete']


class ChoreViewSet(viewsets.ModelViewSet):
    queryset = Chore.objects.filter(is_active=True).select_related('category', 'assignee')
    serializer_class = ChoreSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def destroy(self, request, *args, **kwargs):
        chore = self.get_object()
        chore.is_active = False
        chore.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post', 'delete'], url_path='complete')
    def complete(self, request, pk=None):
        chore = self.get_object()
        date_str = request.data.get('date') or request.query_params.get('date')
        if not date_str:
            return Response({'error': 'date is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            occurrence_date = date.fromisoformat(date_str)
        except ValueError:
            return Response({'error': 'Invalid date format, use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)

        if request.method == 'POST':
            completion, created = ChoreCompletion.objects.get_or_create(
                chore=chore, date=occurrence_date
            )
            return Response(
                ChoreCompletionSerializer(completion).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )
        else:  # DELETE — uncomplete
            ChoreCompletion.objects.filter(chore=chore, date=occurrence_date).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


class CalendarView(APIView):
    def get(self, request):
        start_str = request.query_params.get('start')
        end_str = request.query_params.get('end')
        if not start_str or not end_str:
            return Response(
                {'error': 'start and end query params required (YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            start = date.fromisoformat(start_str)
            end = date.fromisoformat(end_str)
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
        if (end - start).days > 90:
            return Response({'error': 'Range too large (max 90 days)'}, status=status.HTTP_400_BAD_REQUEST)

        occurrences = get_chores_for_range(start, end)
        return Response(occurrences)
