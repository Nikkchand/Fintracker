require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const openAiKey = (process.env.OPENAI_API_KEY || "").trim().replace(/^["']|["']$/g, '');

const openai = new OpenAI({ apiKey: openAiKey });

// In-Memory Data Store
let transactions = [];
let goals = [];
let budgets = [];

// Authentication Middleware - Mocked
const authenticateUser = async (req, res, next) => {
  // Always attach dummy user
  req.user = { id: '12345678-1234-1234-1234-123456789012' };
  next();
};

// Routes

// --- AI ASSISTANT ---
app.post('/api/ai', authenticateUser, async (req, res) => {
  const { message } = req.body;
  const user_id = req.user.id;

  try {
    const userTransactions = transactions
      .filter(t => t.user_id === user_id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    const context = JSON.stringify(userTransactions);

    const systemPrompt = `You are an AI Finance Assistant for FinTrackr. 
        Analyze the user's financial data provided in context.
        Current Transactions Context: ${context}
        
        Provide helpful, concise financial advice, budget tips, or spending analysis.
        If the API key is invalid or missing, this is mocked, but try to be helpful based on the prompt.`;

    let aiResponse;

    if (openAiKey && openAiKey !== 'YOUR_OPENAI_API_KEY') {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "gpt-3.5-turbo",
      });
      aiResponse = completion.choices[0].message.content;
    } else {
      // Mock Response
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('spend') || lowerMsg.includes('expense')) {
        aiResponse = "Based on your recent transactions, you seem to be spending mostly on " +
          (userTransactions.length ? userTransactions[0].category : "various items") + ". Try to set a budget for this category.";
      } else if (lowerMsg.includes('save') || lowerMsg.includes('saving')) {
        aiResponse = "To save more, try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Reduce dining out to boost savings!";
      } else if (lowerMsg.includes('budget')) {
        aiResponse = "I recommend setting a monthly budget for your highest expense categories. Check the Budgets page to set limits.";
      } else {
        aiResponse = "I can help you analyze your finances. Ask me about your spending, savings, or budget tips!";
      }
    }

    res.json({ response: aiResponse });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

// --- TRANSACTIONS ---
app.get('/api/transactions', authenticateUser, async (req, res) => {
  const user_id = req.user.id;
  const data = transactions.filter(t => t.user_id === user_id).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(data);
});

app.post('/api/transactions', authenticateUser, async (req, res) => {
  const { title, amount, type, category, date, notes } = req.body;
  const user_id = req.user.id;
  const newTransaction = {
    id: Date.now().toString(),
    user_id,
    title,
    amount,
    type,
    category,
    date,
    notes,
    created_at: new Date().toISOString()
  };
  transactions.push(newTransaction);
  res.json(newTransaction);
});

app.delete('/api/transactions/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const index = transactions.findIndex(t => t.id === id && t.user_id === user_id);
  if (index !== -1) {
    transactions.splice(index, 1);
    res.json({ message: 'Transaction deleted' });
  } else {
    res.status(404).json({ error: 'Transaction not found' });
  }
});

// --- GOALS ---
app.get('/api/goals', authenticateUser, async (req, res) => {
  const user_id = req.user.id;
  const data = goals.filter(g => g.user_id === user_id);
  res.json(data);
});

app.post('/api/goals', authenticateUser, async (req, res) => {
  const { name, target_amount, deadline } = req.body;
  const user_id = req.user.id;
  const newGoal = {
    id: Date.now().toString(),
    user_id,
    name,
    target_amount,
    current_amount: 0,
    deadline,
    created_at: new Date().toISOString()
  };
  goals.push(newGoal);
  res.json(newGoal);
});

app.patch('/api/goals/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { current_amount } = req.body;
  const user_id = req.user.id;
  const goal = goals.find(g => g.id === id && g.user_id === user_id);
  if (goal) {
    goal.current_amount = current_amount;
    res.json(goal);
  } else {
    res.status(404).json({ error: 'Goal not found' });
  }
});

// --- BUDGETS ---
app.get('/api/budgets', authenticateUser, async (req, res) => {
  const user_id = req.user.id;
  const data = budgets.filter(b => b.user_id === user_id);
  res.json(data);
});

app.post('/api/budgets', authenticateUser, async (req, res) => {
  const { category, amount, month } = req.body;
  const user_id = req.user.id;
  const newBudget = {
    id: Date.now().toString(),
    user_id,
    category,
    amount,
    month,
    created_at: new Date().toISOString()
  };
  budgets.push(newBudget);
  res.json(newBudget);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
