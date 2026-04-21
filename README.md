# FinTrackr - Personal Finance Manager

A modern, full-stack personal finance application built with React, Node.js, and Supabase.

## Features
- **Dashboard**: Overview of finances with summary cards and charts.
- **Transactions**: Add, edit, delete, and filter transactions.
- **Budgets**: Set monthly limits and track usage.
- **Goals**: Create savings goals and track progress.
- **Analytics**: Visual breakdown of spending by category and time.
- **AI Assistant**: Chat with an AI for financial insights (Mocked or OpenAI).
- **Authentication**: Secure login and signup via Supabase.

## Prerequisites
- Node.js installed
- Supabase Project/Account

## Setup Instructions

### 1. Database Setup
1. Create a project on [Supabase.com](https://supabase.com/).
2. Go to the SQL Editor in Supabase.
3. Run the content of `server/database/schema.sql` to create tables and policies.
4. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Project Settings > API.

### 2. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies (if not already):
   ```bash
   npm install
   ```
3. Create a `.env` file (copy from `.env.example`) and fill in your details:
   ```
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   OPENAI_API_KEY=your_openai_key (optional)
   ```
4. Start the server:
   ```bash
   node index.js
   ```
   Server runs on http://localhost:5000.

### 3. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies (if not already):
   ```bash
   npm install
   ```
3. Create a `.env` file (copy from `.env.example`):
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   App runs on http://localhost:5173.

## Deployment
- **Frontend**: Ready for Vercel. Import the `client` folder.
- **Backend**: Deploy to Vercel (requires adaptation) or Render/Heroku.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Recharts, Lucide React
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
