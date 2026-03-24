import csv
import json

from django.db.models import Avg, Count
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer
from .services.pdf_parser import extract_text_from_pdf
from .services.classifier import classify_document
from .services.extractor import extract_fields


class DocumentListView(APIView):
    def get(self, request):
        documents = Document.objects.filter(owner=request.user)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)


class DocumentUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        upload_serializer = DocumentUploadSerializer(data=request.data)
        if not upload_serializer.is_valid():
            return Response(upload_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES["file"]
        document = Document.objects.create(
            owner=request.user,
            file=upload_serializer.validated_data["file"],
            original_filename=uploaded_file.name,
            status="processing",
        )

        try:
            text = extract_text_from_pdf(document.file.path)
            doc_type = classify_document(text)
            extracted = extract_fields(text, doc_type)

            document.document_type = doc_type
            document.extracted_data = extracted
            document.confidence = extracted.pop("confidence", None)
            document.anomalies = extracted.pop("anomalies", [])
            document.status = "done"
            document.processed_at = timezone.now()
        except Exception as e:
            document.status = "failed"
            document.error_message = str(e)

        document.save()
        return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)


class DocumentDetailView(APIView):
    def get(self, request, pk):
        try:
            document = Document.objects.get(pk=pk, owner=request.user)
        except Document.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(DocumentSerializer(document).data)

    def delete(self, request, pk):
        try:
            document = Document.objects.get(pk=pk, owner=request.user)
        except Document.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        document.file.delete(save=False)
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentStatsView(APIView):
    def get(self, request):
        qs = Document.objects.filter(owner=request.user)
        total = qs.count()
        done = qs.filter(status="done").count()
        failed = qs.filter(status="failed").count()
        avg_confidence = qs.filter(
            status="done", confidence__isnull=False
        ).aggregate(avg=Avg("confidence"))["avg"]

        by_type = (
            qs.filter(status="done")
            .values("document_type")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        return Response({
            "total": total,
            "done": done,
            "failed": failed,
            "avg_confidence": round(avg_confidence, 2) if avg_confidence else None,
            "by_type": list(by_type),
        })


class DocumentExportView(APIView):
    def get(self, request):
        documents = Document.objects.filter(owner=request.user, status="done")
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="documents.csv"'

        writer = csv.writer(response)
        writer.writerow([
            "ID", "Filename", "Type", "Confidence", "Anomalies",
            "Uploaded At", "Processed At", "Extracted Data",
        ])

        for doc in documents:
            writer.writerow([
                doc.id,
                doc.original_filename,
                doc.document_type,
                doc.confidence,
                "; ".join(doc.anomalies) if doc.anomalies else "",
                doc.uploaded_at.strftime("%Y-%m-%d %H:%M"),
                doc.processed_at.strftime("%Y-%m-%d %H:%M") if doc.processed_at else "",
                json.dumps(doc.extracted_data),
            ])

        return response
