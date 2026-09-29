# 🌴 TripMate - AI-Powered Travel Companion

TripMate is a full-stack smart travel management platform designed to help travelers discover destinations, plan detailed daily itineraries, manage packing checklists, track travel expenses, and organize trip documents seamlessly.

---

## ✨ Features

- 🌍 **Global Destination Explorer**: Browse world countries and curated tourist spots with high-resolution imagery and local insights.
- 📅 **Interactive Day-by-Day Itineraries**: Plan activities, dining, and accommodations for every leg of your trip.
- 🎒 **Smart Packing Assistant**: Category-organized packing checklists with progress tracking and quick toggle.
- 💰 **Budget & Expense Tracking**: Categorized expense breakdowns, multi-currency support, and payment receipt confirmations.
- 📬 **Interactive Mailbox**: View real-time email notifications, invoice receipts, and booking summaries.
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

---

## 📁 Project Structure

```
TripMate/
├── backend/
│   ├── server.js          # Express REST API endpoints
│   ├── db.js              # SQLite schema & database connection
│   ├── emailService.js    # Nodemailer email & receipt generators
│   ├── countries.json     # Global destination & country catalog
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # UI views (Explore, Itinerary, Packing, Expenses, Auth)
│   │   ├── App.jsx        # Root component & navigation
│   │   └── App.css        # Core styling & responsive design tokens
│   └── package.json
├── .gitignore
└── README.md
```

---

## 📄 License
ISC License
