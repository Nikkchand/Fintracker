# FinTrakr AI Assistant - Final Setup Instructions

## 🔴 PROBLEM IDENTIFIED

Your `server\.env` file has:
```
OPENAI_API_KEY=sk-...TOQA
```

This is **INCOMPLETE**. It should be a full key like:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...
```

---

## ✅ SOLUTION - COPY & PASTE STEPS

### STEP 1: Get Your Full OpenAI API Key (5 minutes)

**1. Open browser:**
```
https://platform.openai.com/api/keys
```

**2. If you don't have an account:**
   - Click "Sign up"
   - Create account
   - Verify email
   - Add payment method (required for API access)

**3. Click: "Create new secret key"**

**4. Copy the ENTIRE key**
   - It looks like: `sk-proj-aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3...`
   - It's approximately 170+ characters long
   - Has NO spaces

**5. Keep it safe**
   - Save in a text file temporarily
   - Don't share it
   - Don't upload to GitHub

---

### STEP 2: Update Your .env File

**Open:** `d:\FinTrakr\server\.env`

**Current content:**
```
PORT=5000
SUPABASE_URL=https://gghhlplmzadihbaaogqs.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaGhscGxtemFkaWhiYWFvZ3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzI1ODEsImV4cCI6MjA4NjMwODU4MX0.tZzX5DtqAVFhg9gnO5p65Ec8Ram0u63Hi_rhNgr11x4
OPENAI_API_KEY=sk-...TOQA
```

**Replace the last line:**
- **Delete:** `OPENAI_API_KEY=sk-...TOQA`
- **Add:** `OPENAI_API_KEY=sk-proj-YOUR_FULL_KEY_HERE`

**Example (don't use this, it's fake):**
```
PORT=5000
SUPABASE_URL=https://gghhlplmzadihbaaogqs.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaGhscGxtemFkaWhiYWFvZ3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzI1ODEsImV4cCI6MjA4NjMwODU4MX0.tZzX5DtqAVFhg9gnO5p65Ec8Ram0u63Hi_rhNgr11x4
OPENAI_API_KEY=sk-proj-aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

**Save file:** `Ctrl+S`

---

### STEP 3: Install Backend Dependencies

**Open PowerShell and run:**

```powershell
cd d:\FinTrakr\server
npm install
```

**This installs:**
- ✅ Express (web server)
- ✅ OpenAI (AI library)
- ✅ Dotenv (environment variables)
- ✅ CORS (frontend communication)

**Expected time:** 2-3 minutes

---

### STEP 4: Start Backend Server

**In same PowerShell:**

```powershell
npm start
```

**You should see:**
```
Server running on port 5000
```

**⚠️ IMPORTANT:** Keep this terminal open! Don't close it.

---

### STEP 5: Start Frontend Application

**Open NEW PowerShell window:**

```powershell
cd d:\FinTrakr\client
npm install
npm run dev
```

**You should see:**
```
Local:   http://localhost:5173/
```

---

### STEP 6: Test the AI Assistant

1. **Open browser** → http://localhost:5173
2. **Login** with email/Google
3. **Look for** AI Assistant button (bottom right corner, purple box with robot icon)
4. **Click it** to open chat
5. **Type:** "Hello" or "How much have I spent?"
6. **Press Send**

✅ **Expected:** AI responds with financial advice
❌ **If error:** See troubleshooting below

---

## 🚨 WHAT IF IT STILL DOESN'T WORK?

### Problem: Backend terminal shows error

**Solution:** Check if API key is correctly formatted
```powershell
# Terminal 1: Stop backend (Ctrl+C)
# Verify server\.env has complete key (170+ chars)
# Restart: npm start
```

### Problem: Browser shows "trouble connecting"

**Check:**
1. **Terminal 1** still shows "Server running on port 5000"? If not, run `npm start`
2. **Open DevTools** (F12) → Console → any red errors?
3. **Refresh browser** (Ctrl+R)

### Problem: API key error in backend

**This means:**
- Backend is running ✅
- But API key is invalid ❌

**Solution:**
1. Go to https://platform.openai.com/api/keys
2. Copy the COMPLETE key (not truncated)
3. Update `server\.env`
4. Restart backend: `npm start`

### Problem: "Port 5000 already in use"

**Solution:**
```powershell
# Find what's using port 5000:
netstat -ano | findstr :5000

# Kill the process (replace 1234 with actual PID):
taskkill /PID 1234 /F

# Try again:
npm start
```

---

## 📋 Quick Reference - Copy & Paste Commands

```powershell
# =========================
# TERMINAL 1 - BACKEND
# =========================
cd d:\FinTrakr\server
npm install
npm start
# Keep this running!

# =========================
# TERMINAL 2 - FRONTEND (New window)
# =========================
cd d:\FinTrakr\client
npm install
npm run dev

# Then visit: http://localhost:5173
```

---

## 🎯 How to Know It's Working

✅ Backend terminal shows: `Server running on port 5000`
✅ Frontend terminal shows: `http://localhost:5173` with local URL
✅ AI Assistant button appears in app (bottom right)
✅ Clicking button opens chat interface
✅ Messages send without errors
✅ AI responds with text (not error messages)

---

## 💰 Pricing Reminder

After you set up:
- Each AI message costs ~$0.0005
- You get $5 free credit when signing up
- That's about 10,000 test messages for free!
- For daily use: probably $1-5 per month

---

## 📚 Support Files Created

Created these help files in your project:
- **QUICK_FIX.md** - 5-minute quick fix
- **AI_ASSISTANT_SETUP_GUIDE.md** - Detailed guide
- **TROUBLESHOOTING.md** - Common errors & solutions
- **quick_setup.ps1** - Automated setup script

---

## 🆘 If Everything Fails

**Try this nuclear option:**

```powershell
# Stop both terminals (Ctrl+C each)
# Then run:

cd d:\FinTrakr\server
rmdir node_modules -Force -Recurse
npm cache clean --force
npm install
npm start

# In new terminal:
cd d:\FinTrakr\client
rmdir node_modules -Force -Recurse
npm cache clean --force
npm install
npm run dev
```

---

## ✨ Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Get OpenAI API key | 5 min |
| 2 | Update `.env` file | 1 min |
| 3 | Run `npm install` (server) | 2 min |
| 4 | Run `npm start` (server) | instant |
| 5 | Run `npm install` + `npm run dev` (client) | 2 min |
| 6 | Test in browser | 1 min |
| **TOTAL** | | **11 minutes** |

---

## 🎉 Next Steps After Setup

Once working, you can:
- Ask AI for financial advice
- Ask about your spending (if you add transactions)
- Get budget recommendations
- Analyze your financial data
- Use all other features (Dashboard, Budgets, Goals, Analytics)

---

**Good luck! You've got this! 🚀**

For detailed troubleshooting, see: **TROUBLESHOOTING.md**

