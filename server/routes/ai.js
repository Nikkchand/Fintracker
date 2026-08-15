const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const db = require('../database/db');
const {
  calculateBudgetUsage,
  calculateMonthlySummary,
  calculateNetWorth,
  calculateGoalProgress
} = require('../services/financialService');

// POST /api/ai
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Message prompt is required' }
      });
    }

    // Read Gemini API Key exclusively from backend environment variable process.env.GEMINI_API_KEY
    const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

    // Generate authoritative database calculations for financial context
    const accounts = await db.getAccounts(userId);
    const transactions = await db.getTransactions(userId);
    const rawBudgets = await db.getBudgets(userId);
    const rawGoals = await db.getGoals(userId);

    const summary = calculateMonthlySummary(transactions);
    const netWorth = calculateNetWorth(accounts);
    const budgetStatusList = rawBudgets.map(b => calculateBudgetUsage(b, transactions));
    const goalStatusList = rawGoals.map(g => calculateGoalProgress(g));
    const recentTx = transactions.slice(0, 10);

    const financialContext = {
      netWorth: `₹${netWorth.toLocaleString('en-IN')}`,
      monthlyIncome: `₹${summary.income.toLocaleString('en-IN')}`,
      monthlyExpenses: `₹${summary.expenses.toLocaleString('en-IN')}`,
      monthlySavings: `₹${summary.savings.toLocaleString('en-IN')}`,
      savingsRate: `${summary.savingsRate}%`,
      budgets: budgetStatusList.map(b => `${b.category}: Spent ₹${b.spent} / Limit ₹${b.limit} (${b.percentage}% - ${b.status})`),
      goals: goalStatusList.map(g => `${g.name}: ₹${g.current_amount} / Target ₹${g.target_amount} (${g.percentage}%)`),
      recentTransactions: recentTx.map(t => `${t.transaction_date}: ${t.title} (${t.type}) ₹${t.amount} [${t.category}]`)
    };

    const systemPrompt = `You are FinTrakr's AI Financial Intelligence Assistant powered by Google Gemini.
You provide personalized, helpful, and concise financial advice based STRICTLY on the user's real database context below.
DO NOT fabricate or make up financial numbers outside of this context.

=== AUTHORITATIVE USER FINANCIAL CONTEXT ===
- Net Worth: ${financialContext.netWorth}
- Current Month Income: ${financialContext.monthlyIncome}
- Current Month Expenses: ${financialContext.monthlyExpenses}
- Savings: ${financialContext.monthlySavings} (Savings Rate: ${financialContext.savingsRate})
- Budgets: ${financialContext.budgets.length ? financialContext.budgets.join('; ') : 'No budgets set'}
- Goals: ${financialContext.goals.length ? financialContext.goals.join('; ') : 'No goals set'}
- Recent 10 Transactions: ${financialContext.recentTransactions.length ? financialContext.recentTransactions.join(' | ') : 'No transactions recorded'}

User Prompt: ${message}`;

    let aiResponse;

    if (geminiApiKey && geminiApiKey !== 'YOUR_GEMINI_API_KEY') {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const payload = {
          contents: [
            {
              parts: [{ text: systemPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        };

        const apiRes = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await apiRes.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          aiResponse = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
          console.warn('Gemini API Warning:', data.error.message);
        }
      } catch (geminiErr) {
        console.error('Gemini API fetch error:', geminiErr);
      }
    }

    // Intelligent Context-Aware Rule Fallback if Gemini key is not supplied or during local testing
    if (!aiResponse) {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('spend') || lowerMsg.includes('expense') || lowerMsg.includes('cost')) {
        const topCat = recentTx.length ? recentTx[0].category : 'various categories';
        aiResponse = `Based on your database records, your total expenses this month are ${financialContext.monthlyExpenses}. Your recent highest expense was in ${topCat}. Consider checking your Budgets page to keep spending under control!`;
      } else if (lowerMsg.includes('save') || lowerMsg.includes('saving') || lowerMsg.includes('net worth')) {
        aiResponse = `Your current Net Worth across linked accounts is ${financialContext.netWorth}. You've saved ${financialContext.monthlySavings} this month with a savings rate of ${financialContext.savingsRate}.`;
      } else if (lowerMsg.includes('budget') || lowerMsg.includes('limit')) {
        if (budgetStatusList.length > 0) {
          const exceeded = budgetStatusList.filter(b => b.status === 'exceeded');
          if (exceeded.length) {
            aiResponse = `Warning: You have exceeded budget limits in: ${exceeded.map(b => b.category).join(', ')}. Review your budget settings on the Budgets page.`;
          } else {
            aiResponse = `Your budgets are currently in healthy standing! Your overall monthly limit spending is tracked in real-time.`;
          }
        } else {
          aiResponse = `You don't have active budgets set yet. Head over to the Budgets manager to set spending caps!`;
        }
      } else {
        aiResponse = `Hello! I analyzed your financial context: Net Worth is ${financialContext.netWorth}, with ${financialContext.monthlyIncome} income and ${financialContext.monthlyExpenses} expenses this month. How can I help optimize your finances today?`;
      }
    }

    res.json({ success: true, response: aiResponse });
  } catch (err) {
    console.error('AI Route Error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to generate AI response' } });
  }
});

module.exports = router;
