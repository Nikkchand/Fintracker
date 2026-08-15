import { createContext, useContext } from 'react';
import { useFinance } from './FinanceContext';

const AccountsContext = createContext(null);

export const AccountsProvider = ({ children }) => {
  return <>{children}</>;
};

export const useAccounts = () => {
  const finance = useFinance();

  return {
    accounts: finance.accounts || [],
    selectedAccountId: finance.selectedAccountId || 'all',
    setSelectedAccountId: finance.setSelectedAccountId,
    addAccount: finance.addAccount,
    updateAccount: finance.updateAccount,
    deleteAccount: finance.deleteAccount,
    totalBalance: finance.summary?.netWorth || finance.summary?.balance || 0,
    loading: finance.loading
  };
};
