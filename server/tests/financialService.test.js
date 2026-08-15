const {
  calculateBudgetUsage,
  calculateMonthlySummary,
  calculateNetWorth,
  calculateGoalProgress,
  getCurrentMonthPeriod
} = require('../services/financialService');

const currentPeriod = getCurrentMonthPeriod();

function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  console.log('\n==================================================');
  console.log('FINTRAKR FINANCIAL BUSINESS LOGIC TEST SUITE');
  console.log('==================================================\n');

  // TEST 1: Budget 50% usage
  const budgetFood = {
    id: 'b-1',
    category: 'Food',
    limit_amount: 2000,
    period_start: currentPeriod.period_start,
    period_end: currentPeriod.period_end
  };

  const txs50 = [
    { type: 'expense', category: 'Food', amount: 500, transaction_date: `${currentPeriod.period_start}` },
    { type: 'expense', category: 'Food', amount: 500, transaction_date: `${currentPeriod.period_start}` }
  ];

  const res50 = calculateBudgetUsage(budgetFood, txs50);
  assert(res50.spent === 1000, 'Spent amount is ₹1,000');
  assert(res50.remaining === 1000, 'Remaining limit is ₹1,000');
  assert(res50.percentage === 50, 'Percentage is 50%');
  assert(res50.status === 'healthy', 'Status is healthy');

  // TEST 2: Budget 125% usage (EXCEEDED)
  const txs125 = [
    { type: 'expense', category: 'Food', amount: 1000, transaction_date: `${currentPeriod.period_start}` },
    { type: 'expense', category: 'Food', amount: 1500, transaction_date: `${currentPeriod.period_start}` }
  ];

  const res125 = calculateBudgetUsage(budgetFood, txs125);
  assert(res125.spent === 2500, 'Spent amount is ₹2,500');
  assert(res125.remaining === -500, 'Remaining limit is -₹500');
  assert(res125.percentage === 125, 'Percentage is 125%');
  assert(res125.status === 'exceeded', 'Status is exceeded');

  // TEST 3: Previous month transaction must NOT count towards current budget
  const txPreviousMonth = [
    { type: 'expense', category: 'Food', amount: 1000, transaction_date: '2025-01-15' }
  ];
  const resPrev = calculateBudgetUsage(budgetFood, txPreviousMonth);
  assert(resPrev.spent === 0, 'Previous month transaction does not count towards current budget');
  assert(resPrev.percentage === 0, 'Percentage is 0%');

  // TEST 4: Unrelated category transaction must NOT count towards budget
  const txUnrelated = [
    { type: 'expense', category: 'Travel', amount: 1000, transaction_date: `${currentPeriod.period_start}` }
  ];
  const resUnrelated = calculateBudgetUsage(budgetFood, txUnrelated);
  assert(resUnrelated.spent === 0, 'Unrelated category transaction does not count towards Food budget');

  // TEST 5: Monthly Summary Calculation
  const summaryTxs = [
    { type: 'income', amount: 100000, transaction_date: `${currentPeriod.period_start}` },
    { type: 'expense', amount: 40000, transaction_date: `${currentPeriod.period_start}` }
  ];
  const summaryRes = calculateMonthlySummary(summaryTxs, currentPeriod);
  assert(summaryRes.income === 100000, 'Monthly income calculated as ₹1,00,000');
  assert(summaryRes.expenses === 40000, 'Monthly expenses calculated as ₹40,000');
  assert(summaryRes.savings === 60000, 'Monthly savings calculated as ₹60,000');
  assert(summaryRes.savingsRate === 60, 'Savings rate calculated as 60%');

  // TEST 6: Net Worth Calculation with Credit Card Liabilities
  const accounts = [
    { name: 'Checking', type: 'checking', balance: 150000 },
    { name: 'Savings', type: 'savings', balance: 300000 },
    { name: 'Credit Card', type: 'credit', balance: 25000 }
  ];
  const netWorthRes = calculateNetWorth(accounts);
  assert(netWorthRes === 425000, 'Net worth calculated as Assets (4.5L) - Liabilities (25k) = 4.25L');

  // TEST 7: Goal Progress Calculation
  const goal = { target_amount: 500000, current_amount: 320000 };
  const goalRes = calculateGoalProgress(goal);
  assert(goalRes.percentage === 64, 'Goal progress is 64%');
  assert(goalRes.remaining === 180000, 'Goal remaining is ₹1,80,000');

  console.log('\n==================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  return failed === 0;
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
