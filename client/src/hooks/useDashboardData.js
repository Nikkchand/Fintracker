import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const useDashboardData = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState({
        income: 0,
        expenses: 0,
        balance: 0,
        savings: 0
    });

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch transactions
                const txQuery = query(collection(db, 'transactions'), where('user_id', '==', user.uid));
                const txDocs = await getDocs(txQuery);
                const txData = txDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Sort transactions by date descending natively in UI since we aren't using complex indexes yet
                txData.sort((a, b) => new Date(b.date) - new Date(a.date));
                setTransactions(txData);

                // Fetch Goals
                const goalsQuery = query(collection(db, 'goals'), where('user_id', '==', user.uid));
                const goalsDocs = await getDocs(goalsQuery);
                const goalsData = goalsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setGoals(goalsData);

                // Calculate summary
                const income = txData
                    .filter(t => t.type === 'income')
                    .reduce((acc, curr) => acc + Number(curr.amount), 0);

                const expenses = txData
                    .filter(t => t.type === 'expense')
                    .reduce((acc, curr) => acc + Number(curr.amount), 0);

                setSummary({
                    income,
                    expenses,
                    balance: income - expenses,
                    savings: income > expenses ? income - expenses : 0
                });

                setLoading(false);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return { transactions, goals, summary, loading, error };
};
