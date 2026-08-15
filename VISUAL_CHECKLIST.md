# FinTrakr AI Assistant - VISUAL SETUP CHECKLIST

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    AI ASSISTANT - SETUP CHECKLIST                        ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## PHASE 1️⃣: GET YOUR API KEY (5 minutes)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Go to OpenAI Website                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🌐 Open browser → https://platform.openai.com/                 │
│                                                                 │
│   ☐ Account exists?         YES → Go to step 2                 │
│   ☐ Account exists?         NO → Click "Sign up"               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Add Payment Method                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 💳 Go to: https://platform.openai.com/account/billing          │
│                                                                 │
│   ☐ Click "Add to credit balance" or "Set up paid account"    │
│   ☐ Add credit card or payment method                          │
│   ☐ Minimum $5 needed                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Get API Key                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🔑 Go to: https://platform.openai.com/api/keys                │
│                                                                 │
│   ☐ Click "+ Create new secret key"                            │
│   ☐ Copy the entire key (starts with: sk-proj-)               │
│   ☐ Paste it somewhere safe (you won't see it again!)         │
│                                                                 │
│ ⚠️ Key should look like:                                       │
│    sk-proj-aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ...         │
│    (170+ characters, no spaces)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 2️⃣: UPDATE YOUR PROJECT (2 minutes)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Edit .env File                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📝 Open: d:\FinTrakr\server\.env                               │
│                                                                 │
│   ☐ Find line: OPENAI_API_KEY=sk-...TOQA                      │
│   ☐ Delete that line completely                                │
│   ☐ Add new line: OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE        │
│   ☐ Paste your actual key from Step 3                          │
│   ☐ Save file (Ctrl+S)                                         │
│                                                                 │
│ ❌ WRONG:                                                       │
│    OPENAI_API_KEY=sk-...TOQA                                   │
│    OPENAI_API_KEY=sk-proj-                                     │
│                                                                 │
│ ✅ CORRECT:                                                     │
│    OPENAI_API_KEY=sk-proj-aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0...   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 3️⃣: INSTALL DEPENDENCIES (3 minutes)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Install Backend                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🖥️ Open PowerShell                                             │
│                                                                 │
│   ☐ Run: cd d:\FinTrakr\server                                 │
│   ☐ Run: npm install                                           │
│   ☐ Wait for "added XX packages" message                       │
│                                                                 │
│ Expected:                                                       │
│   added 45 packages in 2m                                      │
│                                                                 │
│   If error "npm: not found" → Install Node.js first           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 6: Install Frontend                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🖥️ Open new PowerShell                                         │
│                                                                 │
│   ☐ Run: cd d:\FinTrakr\client                                 │
│   ☐ Run: npm install                                           │
│   ☐ Wait for "added XX packages" message                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 4️⃣: START SERVICES (instant)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: Start Backend (TERMINAL 1)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🚀 In first PowerShell (in server folder):                     │
│                                                                 │
│   ☐ Run: npm start                                             │
│   ☐ Wait for: "Server running on port 5000"                   │
│   ☐ ⚠️ KEEP THIS TERMINAL OPEN!                               │
│                                                                 │
│ Expected output:                                                │
│   ┌──────────────────────────────────────────────┐            │
│   │ Server running on port 5000                  │            │
│   │ Listening on http://localhost:5000           │            │
│   └──────────────────────────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 8: Start Frontend (TERMINAL 2)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🚀 In second PowerShell (in client folder):                    │
│                                                                 │
│   ☐ Run: npm run dev                                           │
│   ☐ Wait for: http://localhost:5173/                          │
│                                                                 │
│ Expected output:                                                │
│   ┌──────────────────────────────────────────────┐            │
│   │ Local:   http://localhost:5173/              │            │
│   └──────────────────────────────────────────────┘            │
│                                                                 │
│ ☐ Browser opens automatically                                 │
│   If not → Open http://localhost:5173 manually                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 5️⃣: TEST IT! (1 minute)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 9: Login                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🔐 In browser window:                                          │
│                                                                 │
│   ☐ See login page? Click Google or Email sign-in             │
│   ☐ Create account or login                                    │
│   ☐ You're now in the dashboard                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Step 10: Test AI Assistant                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🤖 Look for AI Assistant:                                      │
│                                                                 │
│   ☐ Bottom right corner of screen                              │
│   ☐ See purple button with robot icon?                         │
│   ☐ Click it to open chat window                               │
│                                                                 │
│ 💬 Send a message:                                             │
│                                                                 │
│   ☐ Type: "Hello" or "How much have I spent?"                 │
│   ☐ Click Send button (or press Enter)                         │
│   ☐ Wait 2-3 seconds for response                              │
│                                                                 │
│ ✅ SUCCESS:                                                     │
│    AI responds with helpful financial advice                   │
│                                                                 │
│ ❌ FAILED:                                                      │
│    Error message appears → See troubleshooting                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 FINAL VERIFICATION

```
╔══════════════════════════════════════════════════════════════════╗
║              CONFIRM EVERYTHING IS WORKING                       ║
╚══════════════════════════════════════════════════════════════════╝

Terminal 1 (Backend):
  ☐ Shows "Server running on port 5000"
  ☐ New request logs appear when you send AI messages

Terminal 2 (Frontend):
  ☐ Shows "http://localhost:5173" 
  ☐ No error messages in terminal

Browser:
  ☐ Application loads without errors
  ☐ AI Assistant button visible
  ☐ Chat opens when clicked
  ☐ Messages send successfully
  ☐ AI responds with text (not errors)

Browser Console (F12):
  ☐ Click "Console" tab
  ☐ No red error messages
  ☐ Should see successful POST to /api/ai

✅ If all checked → YOU DID IT! 🎉
❌ If any failed → Check TROUBLESHOOTING.md
```

---

## 🆘 QUICK TROUBLESHOOTING

```
Problem: "Sorry, I'm having trouble connecting"
─────────────────────────────────────────────────
☐ Check Terminal 1: Is it running?
☐ Check .env: Is API key complete (170+ chars)?
☐ Refresh browser (Ctrl+R)
☐ Restart backend: Ctrl+C → npm start

Problem: "Port 5000 already in use"
──────────────────────────────────
☐ Run: netstat -ano | findstr :5000
☐ Kill: taskkill /PID <NUMBER> /F
☐ Try: npm start again

Problem: "Cannot find module 'openai'"
───────────────────────────────────────
☐ In server folder: npm install

Problem: "npm: command not found"
───────────────────────────────────
☐ Install Node.js: https://nodejs.org/
☐ Restart PowerShell after install
```

---

## 📚 HELP RESOURCES

Created in your project folder:
- **SETUP_STEPS.md** ← Detailed instructions (you are here)
- **QUICK_FIX.md** ← 5-minute quick fix
- **AI_ASSISTANT_SETUP_GUIDE.md** ← Comprehensive guide
- **TROUBLESHOOTING.md** ← Common errors & solutions

---

## 🎓 HOW IT WORKS (After Setup)

```
You type: "What should I budget?"
        ↓
Frontend sends to Backend
        ↓
Backend sends to OpenAI API (uses your key)
        ↓
OpenAI (GPT-3.5) generates response
        ↓
Response sent back to Backend
        ↓
Backend sends to Frontend
        ↓
You see: "Based on your expenses, try the 50/30/20 rule..."
```

---

## ✨ YOU'RE ALL SET!

Once working, explore these features:
- 📊 Dashboard - Overview of your finances
- 💸 Transactions - Track income/expenses
- 💰 Budgets - Set spending limits
- 🎯 Goals - Track savings targets
- 📈 Analytics - Visualize spending patterns
- 🤖 AI Assistant - Get financial advice!

---

**Start with PHASE 1️⃣ above and work through each phase!**

**Questions? Check TROUBLESHOOTING.md** ❓

