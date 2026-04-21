# FinTracker - Personal Finance Manager

A modern, full-stack personal finance application built with React and Google Firebase (Serverless).

## Features
- **Dashboard**: Real-time overview of finances with summary cards and charts.
- **Transactions**: Add, edit, delete, and filter transactions smoothly.
- **Budgets**: Set monthly limits and track your categorical usage.
- **Goals**: Create savings goals and track financial progress.
- **Analytics**: Visual breakdown of spending by category and time.
- **Authentication**: Secure Google Sign-In and Email Authentication via Firebase Auth.
- **Serverless Data**: Direct, lightning fast queries via Cloud Firestore.

## Prerequisites
- Node.js installed
- Google Firebase Account

## Setup Instructions

### 1. Firebase Setup
1. Create a project on the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Authentication** (Google & Email/Password providers).
3. Under Firestore Rules, configure your permissions to lock down data by `user_id`.
4. Register a Web App in the project settings and copy your Firebase SDK config keys.

### 2. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure your `.env` file is properly configured with your Firebase variables:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment
This app is fully optimized for **Firebase Hosting**.
Run these commands locally to deploy your project to the web:
```bash
cd client
npm run build
cd ..
firebase deploy --only hosting
```

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Recharts, Lucide React
- **Backend / Database**: Google Firebase (Authentication, Cloud Firestore, Hosting)
