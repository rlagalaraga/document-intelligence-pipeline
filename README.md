# Document Intelligence Pipeline

An AI-powered business document automation tool. Upload PDFs (invoices, contracts, reports, receipts) and get back structured, machine-readable data — powered by Claude AI.

## Stack

- **Backend:** Django + Django REST Framework
- **Frontend:** React (Vite)
- **Database:** PostgreSQL
- **AI:** Anthropic Claude API
- **PDF Parsing:** pdfplumber

## Project Structure

```
Automation/
├── backend/
│   ├── core/               # Django project (settings, urls, wsgi)
│   ├── documents/          # Django app
│   │   ├── migrations/
│   │   ├── services/
│   │   │   ├── classifier.py   # AI document classification
│   │   │   ├── extractor.py    # AI field extraction
│   │   │   └── pdf_parser.py   # PDF text extraction
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   └── manage.py
├── frontend/               # React app (Vite)
├── uploads/                # Uploaded documents (git-ignored)
├── venv/                   # Python virtual environment (git-ignored)
├── .env                    # Environment variables (git-ignored)
├── .gitignore
└── requirements.txt
```

## Setup

### 1. Clone and create virtual environment

```bash
git clone <repo-url>
cd Automation
python -m venv venv
source venv/Scripts/activate   # Windows
# source venv/bin/activate      # Mac/Linux
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 4. Run migrations

```bash
cd backend
python manage.py migrate
```

### 5. Start the Django dev server

```bash
python manage.py runserver
```

### 6. Start the React dev server

```bash
cd ../frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents/` | List all documents |
| POST | `/api/documents/upload/` | Upload and process a document |
| GET | `/api/documents/<id>/` | Get document details |
| DELETE | `/api/documents/<id>/` | Delete a document |

## How It Works

1. User uploads a PDF via the React frontend
2. Django receives the file and saves it to disk
3. `pdf_parser` extracts raw text from the PDF
4. `classifier` sends the text to Claude → returns document type (invoice, contract, etc.)
5. `extractor` sends the text + type to Claude → returns structured JSON fields
6. Result is saved to PostgreSQL and returned to the frontend
