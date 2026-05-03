from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FamilyMemberViewSet, CategoryViewSet, ChoreViewSet, CalendarView

router = DefaultRouter()
router.register('family-members', FamilyMemberViewSet, basename='family-member')
router.register('categories', CategoryViewSet, basename='category')
router.register('chores', ChoreViewSet, basename='chore')

urlpatterns = [
    path('', include(router.urls)),
    path('calendar/', CalendarView.as_view(), name='calendar'),
]
