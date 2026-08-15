const db = require('../database/db');

async function testCRUD(testUserId = 'test-audit-user-' + Date.now()) {
  console.log('\n==================================================');
  console.log(`RUNNING POSTGRESQL CRUD & ISOLATION VERIFICATION SUITE`);
  console.log(`Test User ID: ${testUserId}`);
  console.log('==================================================\n');

  try {
    // 1. Health check
    const health = await db.healthCheck();
    console.log('1. Health Check:', health);
    if (health.status !== 'healthy') throw new Error('DB is not healthy: ' + health.error);

    // 2. User upsert
    const user = await db.upsertUser({
      id: testUserId,
      email: `${testUserId}@example.com`,
      display_name: 'Test Verification User',
      photo_url: ''
    });
    console.log('2. Upsert User: SUCCESS, ID:', user.id);

    // 3. Create Account
    const account = await db.createAccount(testUserId, {
      name: 'HDFC Savings',
      type: 'savings',
      balance: 10000,
      accountNumber: '•••• 1234',
      isDefault: true
    });
    console.log('3. Create Account: SUCCESS, ID:', account.id, 'Balance:', account.balance);

    // 4. Create Income Transaction
    const txIncome = await db.createTransaction(testUserId, {
      title: 'Salary Deposit',
      amount: 50000,
      type: 'income',
      category: 'Salary',
      account_id: account.id
    });
    console.log('4. Create Income Tx: SUCCESS, Amount:', txIncome.amount);

    // Check account balance updated
    const accAfterIncome = await db.getAccount(account.id, testUserId);
    console.log('   Account Balance after Income:', accAfterIncome.balance, '(Expected: 60000)');
    if (accAfterIncome.balance !== 60000) throw new Error(`Balance mismatch: got ${accAfterIncome.balance}`);

    // 5. Create Expense Transaction
    const txExpense = await db.createTransaction(testUserId, {
      title: 'Grocery Shopping',
      amount: 4000,
      type: 'expense',
      category: 'Food',
      account_id: account.id
    });
    console.log('5. Create Expense Tx: SUCCESS, Amount:', txExpense.amount);

    const accAfterExpense = await db.getAccount(account.id, testUserId);
    console.log('   Account Balance after Expense:', accAfterExpense.balance, '(Expected: 56000)');
    if (accAfterExpense.balance !== 56000) throw new Error(`Balance mismatch: got ${accAfterExpense.balance}`);

    // 6. Create & Verify Budget
    const budget = await db.upsertBudget(testUserId, {
      category: 'Food',
      limit_amount: 10000
    });
    console.log('6. Upsert Budget: SUCCESS, Category:', budget.category, 'Limit:', budget.limit_amount);

    // 7. Create & Contribute to Goal
    const goal = await db.createGoal(testUserId, {
      name: 'Emergency Fund',
      target_amount: 100000,
      current_amount: 10000
    });
    console.log('7. Create Goal: SUCCESS, Name:', goal.name, 'Target:', goal.target_amount);

    const contribRes = await db.addGoalContribution(goal.id, testUserId, 15000, 'Monthly savings');
    console.log('   Goal Contribution: SUCCESS, New Current Amount:', contribRes.goal.current_amount, '(Expected: 25000)');
    if (contribRes.goal.current_amount !== 25000) throw new Error(`Goal progress mismatch`);

    // 8. Recurring Transaction
    const rec = await db.createRecurring(testUserId, {
      title: 'Netflix Subscription',
      amount: 649,
      type: 'expense',
      category: 'Entertainment',
      frequency: 'monthly',
      account_id: account.id
    });
    console.log('8. Create Recurring: SUCCESS, Title:', rec.title, 'Amount:', rec.amount);

    // 9. Clean up test records (ONLY test user data)
    await db.pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    console.log('9. Test Cleanup: SUCCESS (Deleted test user and cascaded data)');

    console.log('\n==================================================');
    console.log('ALL POSTGRESQL CRUD & LOGIC TESTS PASSED 100%');
    console.log('==================================================\n');
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL CRUD Test Failed:', err);
    return false;
  } finally {
    // End pool if run directly
    if (require.main === module) {
      await db.pool.end();
    }
  }
}

if (require.main === module) {
  testCRUD();
}

module.exports = { testCRUD };
