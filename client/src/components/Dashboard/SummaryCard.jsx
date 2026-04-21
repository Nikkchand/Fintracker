import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from 'lucide-react';

const SummaryCard = ({ title, amount, type }) => {
    let icon, colorClass, bgClass;

    switch (type) {
        case 'income':
            icon = <ArrowUpRight className="h-6 w-6 text-emerald-500" />;
            colorClass = 'text-emerald-500';
            bgClass = 'bg-emerald-100 dark:bg-emerald-900/30';
            break;
        case 'expense':
            icon = <ArrowDownRight className="h-6 w-6 text-red-500" />;
            colorClass = 'text-red-500';
            bgClass = 'bg-red-100 dark:bg-red-900/30';
            break;
        case 'savings':
            icon = <Wallet className="h-6 w-6 text-indigo-500" />;
            colorClass = 'text-indigo-500';
            bgClass = 'bg-indigo-100 dark:bg-indigo-900/30';
            break;
        default: // balance
            icon = <DollarSign className="h-6 w-6 text-blue-500" />;
            colorClass = 'text-blue-500';
            bgClass = 'bg-blue-100 dark:bg-blue-900/30';
    }

    // Format currency
    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className={`text-2xl font-bold mt-1 ${colorClass}`}>{formattedAmount}</h3>
                </div>
                <div className={`p-3 rounded-xl ${bgClass}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;
