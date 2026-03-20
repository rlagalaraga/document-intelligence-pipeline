from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id",
            "original_filename",
            "document_type",
            "status",
            "extracted_data",
            "confidence",
            "anomalies",
            "error_message",
            "uploaded_at",
            "processed_at",
        ]
        read_only_fields = [
            "id",
            "document_type",
            "status",
            "extracted_data",
            "confidence",
            "anomalies",
            "error_message",
            "uploaded_at",
            "processed_at",
        ]


class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["file"]
