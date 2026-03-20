from django.urls import path
from . import views

urlpatterns = [
    path("", views.DocumentListView.as_view(), name="document-list"),
    path("upload/", views.DocumentUploadView.as_view(), name="document-upload"),
    path("export/", views.DocumentExportView.as_view(), name="document-export"),
    path("stats/", views.DocumentStatsView.as_view(), name="document-stats"),
    path("<int:pk>/", views.DocumentDetailView.as_view(), name="document-detail"),
]
