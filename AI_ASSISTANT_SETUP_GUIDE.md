# FinTrakr AI Assistant Setup & Troubleshooting Guide

## Issues Identified:
1. ❌ OpenAI API key is incomplete in `.env` file
2. ❌ Backend server may not be running
3. ❌ Frontend cannot connect to backend

---

## STEP-BY-STEP SOLUTION

### STEP 1: Get OpenAI API Key
**Duration: 5-10 minutes**

1. **Go to OpenAI Website**
   - Open: https://platform.openai.com/

2. **Sign Up or Log In**
   - If you don't have an account, click "Sign up" and create one
   - Verify your email

3. **Add Payment Method**
   - Go to: https://platform.openai.com/account/billing/overview
   - Click "Add to credit balance" or "Set up paid account"
   - Add a credit card (you need at least $5 for API access)

4. **Create API Key**
   - Go to: https://platform.openai.com/api/keys
   - Click "Create new secret key"
   - Copy the key immediately (you won't see it again)
   - Format: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Save the Key Safely**
   - Keep it in a secure location
   - DO NOT share it or commit it to public GitHub

---

### STEP 2: Update Server Configuration

1. **Open the Server .env File**
   - File location: `d:\FinTrakr\server\.env`

2. **Update the OPENAI_API_KEY**
   
   **Current:**
   ```
   PORT=5000
   SUPABASE_URL=https://gghhlplmzadihbaaogqs.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   OPENAI_API_KEY=sk-...TOQA
   ```

   **Replace with:**
   ```
   PORT=5000
   SUPABASE_URL=https://gghhlplmzadihbaaogqs.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
   ```

   Replace `sk-proj-YOUR_ACTUAL_KEY_HERE` with your actual key from OpenAI

---

### STEP 3: Install Backend Dependencies

```bash
cd d:\FinTrakr\server
npm install
```

This will install:
- express (web framework)
- openai (OpenAI API library)
- cors (enables frontend-backend communication)
- dotenv (loads environment variables)

---

### STEP 4: Start Backend Server

**Open a new terminal and run:**

```bash
cd d:\FinTrakr\server
npm start
```

**Expected Output:**
```
Server running on port 5000
```

**Keep this terminal open while using the application.**

---

### STEP 5: Verify Frontend Configuration

The frontend API is already configured correctly at `client/src/lib/api.js`:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});
```

This means:
- ✅ Frontend expects backend at `http://localhost:5000`
- ✅ All requests go to `/api/` endpoints

---

### STEP 6: Start Frontend Application

**In another terminal:**

```bash
cd d:\FinTrakr\client
npm install
npm run dev
```

**Expected Output:**
```
Local:   http://localhost:5173/
```

---

### STEP 7: Test the Connection

1. **Open the Application**
   - Go to http://localhost:5173/ in your browser

2. **Login with Test Account**
   - Use Google Sign-In or Email authentication

3. **Test AI Assistant**
   - Click the "AI Assistant" button (bottom right)
   - Type a message like:
     - "How much did I spend?"
     - "Give me budget tips"
     - "Tell me about my finances"

4. **Check for Errors**
   - Open browser DevTools (F12)
   - Check Console tab for error messages
   - Backend should log the request

---

## Troubleshooting Checklist

### ❌ Still getting "trouble connecting"?

**1. Verify Backend is Running**
```bash
# In server terminal, should see:
Server running on port 5000
```

**2. Check OpenAI API Key Format**
- Should start with: `sk-proj-`
- Should be ~170+ characters long
- No spaces or special characters

**3. Verify Port 5000 is Free**
```powershell
netstat -ano | findstr :5000
```
If something is using it, change PORT in `.env` to 5001

**4. Test Endpoint Directly**
```bash
curl -X POST http://localhost:5000/api/ai -H "Content-Type: application/json" -H "Authorization: Bearer mock-token-123" -d "{\"message\":\"Hello\"}"
```

**5. Check for Typos**
- Verify `.env` file has NO extra spaces
- Verify API key is EXACT copy from OpenAI

**6. Restart Services**
```bash
# Kill backend (Ctrl+C in terminal)
# Wait 5 seconds
# Run: npm start again

# Refresh frontend browser (Ctrl+R)
```

---

## File Locations Reference

| Component | Location | Status |
|-----------|----------|--------|
| Backend Server | `d:\FinTrakr\server\index.js` | Needs API key ✅ |
| Server Config | `d:\FinTrakr\server\.env` | **UPDATE THIS** |
| Frontend API | `d:\FinTrakr\client\src\lib\api.js` | Correct ✅ |
| AI Component | `d:\FinTrakr\client\src\components\AIAssistant.jsx` | Correct ✅ |

---

## Quick Start Commands

```bash
# Terminal 1: Start Backend
cd d:\FinTrakr\server
npm install
npm start

# Terminal 2: Start Frontend (after backend is running)
cd d:\FinTrakr\client
npm install
npm run dev
```

---

## API Flow Diagram

```
User Types Message
        ↓
Frontend (React) → AIAssistant.jsx
        ↓
api.post('/ai', {message})
        ↓
Backend (Express) at http://localhost:5000/api/ai
        ↓
OpenAI API (requires valid API key)
        ↓
Response → Frontend → Display in Chat
```

---

## What Each Service Does

### OpenAI API
- Processes your messages
- Provides AI-powered responses
- Requires valid API key and payment method
- Charges per request (very affordable: ~$0.0005 per request)

### Backend Server (Node.js/Express)
- Acts as intermediary between frontend and OpenAI
- Handles authentication
- Processes user data
- Securely stores API key

### Frontend (React)
- Displays chat interface
- Sends user messages to backend
- Shows AI responses
- No direct access to API key (secure)

---

## Expected Behavior After Setup

✅ AI Assistant button appears in bottom-right corner
✅ Opens a chat window when clicked
✅ Messages send without errors
✅ AI responds with financial advice
✅ No "trouble connecting" errors

---

## Monthly Cost Estimate

- **Light Usage (10-20 messages/day)**: ~$0.50/month
- **Medium Usage (50-100 messages/day)**: ~$2-5/month
- **Heavy Usage (200+ messages/day)**: ~$10-20/month

You get $5 free credit with OpenAI account.

---

## Support Resources

- OpenAI API Docs: https://platform.openai.com/docs/
- Express.js Docs: https://expressjs.com/
- Troubleshooting Guide: Check browser console (F12) for detailed error messages

