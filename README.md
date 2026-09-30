# 🌴 TripMate - AI-Powered Travel Companion

[![GitHub Pages](https://img.shields.io/badge/Live_Demo-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://dharun-07-byte.github.io/TripMate/)
[![CI](https://img.shields.io/github/actions/workflow/status/Dharun-07-byte/TripMate/ci.yml?branch=main&style=for-the-badge&logo=githubactions&label=CI)](https://github.com/Dharun-07-byte/TripMate/actions)
[![React 19](https://img.shields.io/badge/Frontend-React_19_%26_Vite-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Express 5](https://img.shields.io/badge/Backend-Node_%26_Express-68a063?style=for-the-badge&logo=node.js)](https://expressjs.com/)

> 🌐 **Live Web Application:** [https://dharun-07-byte.github.io/TripMate/](https://dharun-07-byte.github.io/TripMate/)

TripMate is a full-stack smart travel management platform designed to help travelers discover destinations, plan detailed daily itineraries, manage packing checklists, track travel expenses, and organize trip documents seamlessly.

---

## ✨ Features

- 🌍 **Global Destination Explorer**: Browse world countries and curated tourist spots with high-resolution imagery and local insights.
- 📅 **Interactive Day-by-Day Itineraries**: Plan activities, dining, and accommodations for every leg of your trip.
- 🎒 **Smart Packing Assistant**: Category-organized packing checklists with progress tracking and quick toggle.
- 💰 **Budget & Expense Tracking**: Categorized expense breakdowns, multi-currency support, and payment receipt confirmations.
- 📬 **Interactive Mailbox**: View digital invoice receipts, booking summaries, and transaction history.
- 🔐 **Authentication & User Profiles**: Secure JWT authentication, custom profile preferences, and currency settings.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, Vanilla CSS Design System
- **Backend**: Node.js, Express 5, SQLite3, JSONWebTokens, Nodemailer
- **Database**: SQLite (Zero-config embedded relational database)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/Dharun-07-byte/TripMate.git
cd TripMate
```

### 3. Backend Setup
```bash
cd backend
npm install
node server.js
```
The backend server runs on `http://localhost:5000`.

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be live at `http://localhost:5173`.

### 5. Running Tests
Run all backend and frontend unit tests:
```bash
npm test
```
Or test independently:
```bash
# Backend unit tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test
```

---

## 📚 Documentation

Detailed documentation is available in the [`docs/`](./docs) folder:
- **[System Architecture & Design](./docs/ARCHITECTURE.md)**: Architecture diagrams, tech stack choices, and data flows.
- **[REST API Reference](./docs/API.md)**: Complete endpoint schemas, request/response payloads, and authentication headers.
- **[Contributing Guidelines](./CONTRIBUTING.md)**: Coding standards, development workflow, and PR checklist.
- **[Security Policy](./SECURITY.md)**: Reporting guidelines and vulnerability management.

---

## 📁 Project Structure

```
TripMate/
├── .github/
│   ├── workflows/         # GitHub Actions CI & Pages deployment
│   └── ISSUE_TEMPLATE/    # Bug report & feature request templates
├── docs/                  # Architecture & REST API specifications
├── backend/
│   ├── server.js          # Express REST API endpoints & health check
│   ├── db.js              # SQLite schema, relations & query indexes
│   ├── emailService.js    # Nodemailer email & receipt generators
│   ├── countries.json     # Global destination catalog
│   └── test/              # Backend unit test suites
├── frontend/
│   ├── src/
│   │   ├── components/    # UI views (Explore, Itinerary, Packing, Expenses, Auth)
│   │   ├── utils/         # Trip calculation & currency formatting helpers
│   │   ├── App.jsx        # Root component & navigation
│   │   └── App.css        # Core styling & responsive design tokens
│   ├── public/
│   │   └── manifest.json  # Web App Manifest (PWA)
│   └── package.json
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── README.md
```

---

## 📄 License
ISC License

