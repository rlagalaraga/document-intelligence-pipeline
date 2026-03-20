import anthropic
from django.conf import settings

DOCUMENT_TYPES = ["invoice", "contract", "report", "form", "receipt", "other"]

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def classify_document(text: str) -> str:
    """Classify a document into one of the known types."""
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=50,
        messages=[
            {
                "role": "user",
                "content": (
                    f"Classify the following document into exactly one of these types: "
                    f"{', '.join(DOCUMENT_TYPES)}.\n\n"
                    f"Respond with only the type, nothing else.\n\n"
                    f"Document (first 2000 chars):\n{text[:2000]}"
                ),
            }
        ],
    )
    result = message.content[0].text.strip().lower()
    return result if result in DOCUMENT_TYPES else "other"
