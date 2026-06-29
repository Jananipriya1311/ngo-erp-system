# 🌿 NGO ERP System

A complete, web-based Enterprise Resource Planning (ERP) system built for Non-Governmental Organizations (NGOs). Manage beneficiaries, donations, expenses, programs, volunteers, documents, communications, and analytics — all in one place.

🔗 **Live Demo:** [https://ngo-erp-system.web.app](https://ngo-erp-system.web.app)

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Login Credentials](#login-credentials)
- [Role-Based Access](#role-based-access)
- [How to Run Locally](#how-to-run-locally)
- [How to Deploy](#how-to-deploy)
- [Firebase Setup](#firebase-setup)
- [Screenshots](#screenshots)

---

## 📖 About the Project

NGO ERP System is a fully responsive, offline-capable Progressive Web App (PWA) designed to help NGOs manage their day-to-day operations efficiently. It uses **Firebase Realtime Database** for cloud storage, supports **13 user roles** with different access levels, and works even without internet using a **Service Worker**.

---

## ✨ Features

| Module | Description |
|---|---|
| 📊 Dashboard | Real-time stats — beneficiaries, donations, expenses, balance, active programs |
| 👥 Beneficiaries | Add, edit, delete beneficiaries — individual, family, community |
| 💰 Donations | Record donations, generate receipts, track donor history |
| 💸 Expenses | Track expenses by category, program, vendor with invoice references |
| 📋 Programs | Manage NGO programs with budget tracking and utilization |
| 🤝 Volunteers | Manage volunteer profiles, skills, availability, emergency contacts |
| 📅 Calendar | Schedule and track events — field visits, meetings, training, drives |
| 📁 Documents | Upload and manage PDFs, Excel, Word, Image files by category |
| 📢 Communications | Role-based messaging, announcements, and newsletters |
| 📈 Analytics | Charts for donations vs expenses, beneficiary growth, program performance |
| ⚙️ Settings | Organization settings, currency, user preferences |
| 🔒 Role-Based Access | 13 roles with different permissions across all modules |
| 📶 Offline Support | Works without internet — syncs when back online (PWA + Service Worker) |
| 🔥 Firebase Realtime DB | All data stored and synced in real-time across all users |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure and UI |
| CSS3 | Styling and responsive design |
| JavaScript (Vanilla) | All logic and interactivity |
| Firebase Realtime Database | Cloud database — stores all NGO data |
| Firebase Hosting | Live deployment |
| Chart.js | Analytics charts and graphs |
| SheetJS (xlsx) | Export data to Excel |
| Font Awesome | Icons throughout the UI |
| Service Worker | Offline support and PWA |
| IndexedDB | Local offline data storage |

---

## 📁 Project Structure

```
ngo_project/
├── index.html              ← Main app (all pages in one file)
├── offline.html            ← Shown when app is offline
├── manifest.json           ← PWA manifest
├── firebase.json           ← Firebase Hosting config
├── .firebaserc             ← Firebase project config
├── css/
│   └── style.css           ← All styles
├── js/
│   ├── main.js             ← All JavaScript logic (~5900 lines)
│   └── service-worker.js   ← Offline / PWA support
├── data/                   ← Sample data (if any)
├── build/                  ← Build output
└── passwords.txt           ← Login credentials (for reference)
```

---

## 🔑 Role-Based Access

| Section | Who Can Access |
|---|---|
| Dashboard | Everyone |
| Beneficiaries | Admin, Program, Coordinator, Field, Outreach, Director, Board |
| Donations | Admin, Finance, Accountant, Director, Board, Auditor |
| Expenses | Admin, Finance, Accountant, Director, Board, Auditor |
| Programs | Admin, Program, Coordinator, Field, Outreach, Director, Board |
| Volunteers | Admin, Volunteer, HR, Coordinator, Director, Board |
| Calendar | Everyone |
| Documents | Everyone |
| Communications | Everyone (only Admin can send/post) |
| Analytics | Admin, Finance, Director, Board, Auditor, Guest |
| Settings | Admin only |

---

## 💻 How to Run Locally

### Step 1 — Clone the repository
```bash
git clone https://github.com/your-username/ngo-erp-system.git
cd ngo-erp-system
```

### Step 2 — Open with Live Server
- Open the project folder in **VS Code**
- Right click on `index.html`
- Click **Open with Live Server**

The app opens at `http://127.0.0.1:5500`

> **Note:** You need the **Live Server** extension in VS Code. Install it from the Extensions panel.

---

## 🚀 How to Deploy

### Step 1 — Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2 — Login to Firebase
```bash
firebase login
```

### Step 3 — Deploy
```bash
cd ngo_project
firebase deploy
```

### Step 4 — Open Live Site
```
https://ngo-erp-system.web.app
```

Press `Ctrl + Shift + R` after deploying to clear browser cache and see latest changes.

---

## 🔥 Firebase Setup

This project uses **Firebase Realtime Database**. The data is stored in these collections:

```
📂 Firebase Realtime Database
├── 📁 beneficiaries
├── 📁 donations
├── 📁 expenses
├── 📁 programs
├── 📁 volunteers
├── 📁 events
├── 📁 documents
├── 📁 messages
├── 📁 announcements
└── 📁 newsletters
```

To connect your own Firebase project:
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Realtime Database**
4. Copy your Firebase config
5. Replace the config in `index.html` (near the bottom of the file)

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

---




## 📄 License

This project is built for educational and NGO use purposes.
