import { Building2, PiggyBank, CreditCard, TrendingUp, Wallet, Star, MoreVertical, Trash2 } from 'lucide-react';
import { useAccounts } from '../../context/AccountsContext';

const ICON_MAP = {
    Building2: Building2,
    PiggyBank: PiggyBank,
    CreditCard: CreditCard,
    TrendingUp: TrendingUp,
    Wallet: Wallet
};

const AccountCard = ({ account }) => {
    const { updateAccount, deleteAccount, selectedAccountId, setSelectedAccountId } = useAccounts();
    const IconComponent = ICON_MAP[account.icon] || Wallet;
    const isSelected = selectedAccountId === account.id;

    const handleSetDefault = (e) => {
        e.stopPropagation();
        updateAccount(account.id, { isDefault: true });
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to remove ${account.name}?`)) {
            deleteAccount(account.id);
        }
    };

    return (
        <div
            onClick={() => setSelectedAccountId(isSelected ? 'all' : account.id)}
            className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${account.color || 'from-indigo-600 to-purple-700'} shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-xl ${isSelected ? 'ring-4 ring-primary dark:ring-indigo-400 scale-[1.02]' : ''}`}
        >
            {/* Background Accent Pill */}
            <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                        <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <span className="text-xs uppercase tracking-wider text-white/75 font-semibold">
                            {account.type}
                        </span>
                        <h3 className="text-lg font-bold truncate max-w-[180px]">{account.name}</h3>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSetDefault}
                        title={account.isDefault ? "Default Account" : "Make Default"}
                        className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${account.isDefault ? 'bg-amber-400/30 text-amber-300' : 'bg-white/10 hover:bg-white/20 text-white/70'}`}
                    >
                        <Star className={`h-4 w-4 ${account.isDefault ? 'fill-amber-300' : ''}`} />
                    </button>
                    <button
                        onClick={handleDelete}
                        title="Delete Account"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/30 text-white/70 hover:text-red-200 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-xs text-white/80 font-mono tracking-widest">{account.accountNumber}</p>
                <div className="flex justify-between items-baseline pt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        ₹{Number(account.balance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                    {isSelected && (
                        <span className="text-xs bg-white text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                            Active Filter
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountCard;
