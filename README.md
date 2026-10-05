Markdown
# Crypto Project Filter Application

A full-stack web application built for the Spredo technical assessment. It fetches, filters, and presents cryptocurrency project data from the CoinGecko API using a FastAPI (Python) backend and a React (Vite) frontend.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.10+, FastAPI, `httpx`, Uvicorn
- **Frontend:** React, Vite, JavaScript, CSS / `useMemo`
- **External API:** CoinGecko Public REST API

---

## 📁 Repository Structure

```text
crypto-filter-app/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .gitignore
└── README.md
🚀 How to Run
Prerequisites
Node.js 18+

Python 3.10+

1. Run Backend
Bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
Backend server will start at http://localhost:8000

2. Run Frontend
Open a separate terminal window:

Bash
cd frontend
npm install
npm run dev
Frontend application will start at http://localhost:5173

📋 Features Completed
Backend (/backend)
Developed REST API endpoint (GET /api/projects) fetching from CoinGecko API.

Implemented backend filtering based on criteria:

Market Capitalization > 0

24h Trading Volume > $50,000

Fully Diluted Valuation (FDV) < $100M

Reduced pagination size (per_page=50) to mitigate API response latency.

Added custom request headers to handle third-party Cloudflare challenge behavior.

Frontend (/frontend)
Interactive UI rendering cryptocurrency project cards/table.

Real-time client-side search by project name or symbol (e.g., eth → Ethereum).

User-configurable FDV threshold filter.

Client-side sorting options for Market Capitalization and 24h Trading Volume.

Defensive UI state management for loading, errors, and empty results.

⚠️ Assumptions & Limitations
API Rate Limiting: The free public tier of CoinGecko enforces strict rate limits (HTTP 429) and Cloudflare checks, which can cause response delays or empty results during peak request frequency.

Data Availability: Endpoint fields such as total_value_locked (TVL) or preview_listing require Pro API endpoints or secondary calls per coin, so fallback filters were applied to maintain acceptable response speeds.

🔮 Next Steps & Potential Improvements
Server-Side Caching: Implement an in-memory TTL cache (e.g., Redis or FastAPI memory cache) to store API responses for 60 seconds and eliminate external rate-limiting bottlenecks.

Mock Data Fallback: Add automated mock dataset fallback to serve UI smoothly during third-party API downtime.

Server Pagination: Add server-side page/limit controls for larger datasets.
