# FinTrakr AI Assistant - Advanced Troubleshooting

## Common Error Messages & Solutions

### ERROR 1: "Sorry, I'm having trouble connecting right now."

**What's happening:** Frontend can't reach backend

**Solutions in order:**

1. **Check if backend is running**
   ```powershell
   # In Terminal 1, should see:
   # Server running on port 5000
   
   # If not running, do:
   cd server
   npm start
   ```

2. **Check if API key is set**
   ```powershell
   # Open: server\.env
   # Should have:
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   
   # NOT: OPENAI_API_KEY=sk-...TOQA (incomplete)
   ```

3. **Check network connection**
   ```powershell
   # Test endpoint in PowerShell:
   curl http://localhost:5000/api/ai -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"message":"test"}'
   
   # Should return JSON, not error
   ```

---

### ERROR 2: "ERR_CONNECTION_REFUSED"

**What's happening:** Backend server is not running or wrong port

**Solution:**

```powershell
# Terminal 1:
cd d:\FinTrakr\server
npm start

# Should output:
# Server running on port 5000

# If you get "port already in use":
# 1. Find what's using port 5000:
netstat -ano | findstr :5000

# 2. Kill it:
taskkill /PID <PID_NUMBER> /F

# 3. Try again:
npm start
```

---

### ERROR 3: "401 Unauthorized" or "Invalid API Key"

**What's happening:** OpenAI API key is invalid or missing

**Solution:**

1. **Check API key format**
   ```
   ✅ Correct: sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ❌ Wrong: sk-...TOQA (incomplete)
   ❌ Wrong: YOUR_OPENAI_API_KEY (placeholder)
   ```

2. **Get new API key**
   - Go to: https://platform.openai.com/api/keys
   - Click red X to delete old key (if needed)
   - Create new secret key
   - Copy immediately (only shown once)

3. **Update .env file**
   ```
   # server\.env
   OPENAI_API_KEY=sk-proj-<PASTE_HERE>
   ```

4. **Restart backend**
   ```powershell
   # Terminal 1: Ctrl+C to stop
   # Wait 2 seconds
   npm start
   ```

---

### ERROR 4: "ENOENT: no such file or directory, open '.env'"

**What's happening:** .env file doesn't exist

**Solution:**

```powershell
# In server folder, create .env:
cd d:\FinTrakr\server

# Using PowerShell:
@"
PORT=5000
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
"@ | Out-File -Encoding UTF8 ".env"

# Then restart:
npm start
```

---

### ERROR 5: "npm: command not found"

**What's happening:** Node.js not installed

**Solution:**

1. Download from: https://nodejs.org/
2. Install (default settings)
3. Restart PowerShell
4. Try again: `npm start`

---

### ERROR 6: "Cannot find module 'dotenv'"

**What's happening:** Dependencies not installed

**Solution:**

```powershell
cd d:\FinTrakr\server
npm install
npm start
```

---

### ERROR 7: Frontend shows "Unable to reach server" in console

**What's happening:** Frontend can't connect to backend API

**Solutions:**

1. **Check base URL**
   ```
   File: client\src\lib\api.js
   Should have: baseURL: 'http://localhost:5000/api'
   ```

2. **Check if ports match**
   ```
   Backend: PORT=5000 in server\.env
   Frontend: baseURL=http://localhost:5000 in api.js
   Must match!
   ```

3. **Restart frontend**
   ```powershell
   # Terminal 2: Ctrl+C
   # Wait 2 seconds
   npm run dev
   ```

---

## Browser Console Debugging

**How to check detailed errors:**

1. Open application in browser
2. Press `F12` to open DevTools
3. Click "Console" tab
4. Try AI Assistant again
5. Look for red error messages

**Example console output:**

```
POST http://localhost:5000/api/ai 500 (Internal Server Error)
Error: Failed to generate AI response
```

**This means:**
- Backend is running ✅
- But OpenAI API key is invalid ❌

---

## Testing Each Component

### Test 1: Backend is running
```powershell
# In PowerShell:
curl http://localhost:5000/api/ai -Method GET

# If running, response will come back
# If not running, error: "The underlying connection was closed"
```

### Test 2: API key is valid
```powershell
# In PowerShell:
$body = @{ message = "Hello" } | ConvertTo-Json
curl -Uri "http://localhost:5000/api/ai" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# If key is valid, you get JSON response with AI text
# If key is invalid, error about OpenAI authentication
```

### Test 3: Frontend can reach backend
```javascript
// In browser console (F12):
fetch('http://localhost:5000/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test' })
}).then(r => r.json()).then(console.log)

// Should return: { response: "..." }
```

---

## Environment Variables Checklist

**File location:** `d:\FinTrakr\server\.env`

```
✅ PORT=5000
   - Must be 5000 or match frontend's baseURL

✅ OPENAI_API_KEY=sk-proj-xxxxxxx...
   - Must start with 'sk-proj-'
   - Must be complete (170+ characters)
   - Must be from https://platform.openai.com/api/keys
   - Must NOT be placeholder text

✅ SUPABASE_URL=https://gghhlplmzadihbaaogqs.supabase.co
   - Already set, don't change

✅ SUPABASE_KEY=eyJhbGci...
   - Already set, don't change
```

---

## Firewall / Network Issues

**If you get "Network Error" despite everything running:**

1. **Check Windows Firewall**
   ```powershell
   # Allow Node.js through firewall:
   # Settings > Privacy & Security > Firewall > Advanced
   # Add incoming rule for node.exe
   ```

2. **Try accessing from same machine**
   ```
   http://localhost:5173  (Frontend)
   http://localhost:5000  (Backend)
   
   Should both work
   ```

3. **Check system hosts file**
   ```powershell
   # Should have:
   127.0.0.1   localhost
   ::1         localhost
   
   # File: C:\Windows\System32\drivers\etc\hosts
   ```

---

## Complete Debug Checklist

Run through this checklist:

- [ ] OpenAI account exists at https://platform.openai.com
- [ ] Payment method added to OpenAI account
- [ ] API key created at https://platform.openai.com/api/keys
- [ ] API key starts with `sk-proj-`
- [ ] API key copied fully (no truncation)
- [ ] `server\.env` has complete API key
- [ ] `server\.env` is saved
- [ ] `npm install` run in server folder
- [ ] Backend starts with `npm start`
- [ ] Backend shows "Server running on port 5000"
- [ ] `npm install` run in client folder
- [ ] Frontend starts with `npm run dev`
- [ ] Browser opened to http://localhost:5173
- [ ] User is logged in
- [ ] AI Assistant button visible (bottom right)
- [ ] Message sends without error
- [ ] AI response appears

---

## Still Not Working?

**Last Resort - Nuclear Option:**

```powershell
# Stop both terminals (Ctrl+C)

# Delete everything and start fresh:
cd d:\FinTrakr

# Remove node_modules and reinstall:
rm server\node_modules -Force -Recurse
rm client\node_modules -Force -Recurse

cd server
npm cache clean --force
npm install

cd ..\client
npm cache clean --force
npm install

# Go back and start both:
cd ..\server
npm start

# In new terminal:
cd d:\FinTrakr\client
npm run dev
```

---

## Getting Help

1. **Check browser console** (F12) for exact error message
2. **Check backend terminal** for error logs
3. **Verify API key** is complete and valid
4. **Search error message** on Google/Stack Overflow
5. **Check OpenAI status page**: https://status.openai.com/

