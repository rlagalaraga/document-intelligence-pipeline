import json
import anthropic
from django.conf import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

EXTRACTION_PROMPTS = {
    "invoice": """Extract the following fields from this invoice and return as JSON:
{
  "vendor_name": "",
  "invoice_number": "",
  "invoice_date": "",
  "due_date": "",
  "total_amount": "",
  "currency": "",
  "line_items": [{"description": "", "quantity": "", "unit_price": "", "total": ""}],
  "tax_amount": "",
  "notes": ""
}""",
    "contract": """Extract the following fields from this contract and return as JSON:
{
  "parties": [],
  "effective_date": "",
  "expiry_date": "",
  "contract_type": "",
  "key_obligations": [],
  "payment_terms": "",
  "governing_law": "",
  "termination_clause": ""
}""",
    "report": """Extract the following fields from this report and return as JSON:
{
  "title": "",
  "author": "",
  "date": "",
  "summary": "",
  "key_findings": [],
  "recommendations": []
}""",
    "receipt": """Extract the following fields from this receipt and return as JSON:
{
  "merchant_name": "",
  "date": "",
  "items": [{"description": "", "amount": ""}],
  "subtotal": "",
  "tax": "",
  "total": "",
  "payment_method": ""
}""",
    "form": """Extract all labeled fields from this form and return as JSON:
{
  "form_title": "",
  "fields": {}
}""",
    "other": """Extract any key information from this document and return as JSON:
{
  "title": "",
  "date": "",
  "key_information": {}
}""",
}


def extract_fields(text: str, document_type: str) -> dict:
    """Extract structured fields from document text based on its type."""
    prompt = EXTRACTION_PROMPTS.get(document_type, EXTRACTION_PROMPTS["other"])

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        messages=[
            {
                "role": "user",
                "content": (
                    f"{prompt}\n\n"
                    f"After extracting the fields, also add two keys to the JSON:\n"
                    f"- \"confidence\": a number from 0.0 to 1.0 indicating how confident you are in the extraction\n"
                    f"- \"anomalies\": a list of strings describing any suspicious or unusual values found "
                    f"(e.g. unusually high amounts, missing required fields, inconsistent dates). "
                    f"Use an empty list if nothing is suspicious.\n\n"
                    f"Return only valid JSON, no explanation.\n\n"
                    f"Document text:\n{text[:4000]}"
                ),
            }
        ],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw_extraction": raw, "parse_error": True}
