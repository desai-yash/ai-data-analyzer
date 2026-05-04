# AI Data Analyzer

AI Data Analyzer is a MERN stack application for uploading CSV or Excel files, previewing the first 10 rows, generating AI-powered dataset insights, asking natural-language questions, and reviewing saved analysis history.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Axios, react-hot-toast
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- AI: Groq Chat Completions API
- Parsing: `multer`, `xlsx`, `csv-parser`

## Setup

Install root tooling, backend dependencies, and frontend dependencies:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

Create backend environment variables:

```bash
cd server
copy .env.example .env
```

Create frontend environment variables:

```bash
cd client
copy .env.example .env
```

Run both apps from the project root:

```bash
npm run dev
```

Or run each app separately:

```bash
npm --prefix server run dev
npm --prefix client run dev
```

## Getting Your Groq API Key

1. Go to https://console.groq.com
2. Sign in or create a Groq account.
3. Open API Keys and create a new key.
4. Copy it into `server/.env` as `GROQ_API_KEY`.

Keep this key server-side only; never expose it through Vite client variables.

## Environment Variables

Backend `server/.env`:

- `PORT`: Express server port.
- `MONGO_URI`: MongoDB connection string.
- `GROQ_API_KEY`: Groq API key used by the AI service.
- `GROQ_MODEL`: Groq model ID. Defaults to `llama-3.3-70b-versatile`.
- `CLIENT_URL`: Allowed frontend origin for CORS.
- `GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
- `GOOGLE_CALLBACK_URL`: (Optional) Google callback URL, defaults to `http://localhost:5000/api/auth/google/callback`.
- `SESSION_SECRET`: Secret used to sign session cookies.
- `UPLOAD_DIR`: Temporary file upload directory.
- `MAX_FILE_SIZE_MB`: Upload size limit.

Frontend `client/.env`:

- `VITE_API_URL`: Backend API base URL, for example `http://localhost:5000/api`. If unset, the app defaults to `http://localhost:5000/api`.

## Available Routes

- `POST /api/upload`: Upload a CSV, XLS, or XLSX file. Parses data, stores dataset metadata, and returns the dataset.
- `GET /api/upload/:id`: Fetch one dataset.
- `POST /api/analyze/insights`: Body `{ datasetId }`. Calls Groq, saves an Analysis, and returns insights, anomalies, recommendations, and chart suggestion.
- `POST /api/analyze/ask`: Body `{ datasetId, question }`. Calls Groq, saves the answer, and returns plain text answer plus Analysis.
- `GET /api/history`: Returns all saved analyses with dataset info.
- `GET /api/history/:id`: Returns one saved analysis.
- `DELETE /api/history/:id`: Deletes one saved analysis.

## Notes

- Login is optional. Anonymous users can upload and analyze data, but datasets and history are only saved for logged-in users.

Excel parsing uses `xlsx` because it is part of the requested stack. `npm audit` may report unresolved advisories for that package; consider stricter upload controls or an alternate parser before production use.
