import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useAccounts } from '../context/AccountsContext';
import { Wallet, Camera, Sparkles, Building2, RefreshCw, LogOut, LogIn, Menu, X, Target, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import AIReceiptScannerModal from './AIReceiptScannerModal';
import AIMonthlyInsightsModal from './AIMonthlyInsightsModal';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const { accounts, selectedAccountId, setSelectedAccountId } = useAccounts();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/landing');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        
                        {/* Logo & Main Navigation */}
                        <div className="flex items-center gap-6">
                            <Link to="/landing" onClick={closeMobileMenu} className="flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-primary via-purple-500 to-indigo-400 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-200">
                                <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl shadow-md">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                FinTrakr
                            </Link>

                            <div className="hidden lg:flex items-center space-x-1">
                                <Link
                                    to="/landing"
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive('/landing') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    Home
                                </Link>
                                {user && (
                                    <>
                                        <Link
                                            to="/dashboard"
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive('/dashboard') || isActive('/') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/accounts"
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive('/accounts') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            Accounts
                                        </Link>
                                        <Link
                                            to="/transactions"
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive('/transactions') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            Transactions
                                        </Link>
                                        <Link
                                            to="/budgets"
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive('/budgets') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            Budgets
                                        </Link>
                                        <Link
                                            to="/goals"
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive('/goals') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            Goals
                                        </Link>
                                        <Link
                                            to="/recurring"
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive('/recurring') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            Recurring
                                        </Link>
                                        <Link
                                            to="/analytics"
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${isActive('/analytics') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            Analytics
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action Tools & Auth Desktop */}
                        <div className="hidden lg:flex items-center gap-3">
                            {user && (
                                <>
                                    <select
                                        value={selectedAccountId}
                                        onChange={(e) => setSelectedAccountId(e.target.value)}
                                        className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-none rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary cursor-pointer"
                                    >
                                        <option value="all">🌐 All Accounts</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.name} (₹{Number(acc.balance).toLocaleString('en-IN')})
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => setIsScannerOpen(true)}
                                        className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
                                        title="Scan Receipt with Gemini AI"
                                    >
                                        <Camera className="h-4 w-4" />
                                        <span>Scan Receipt</span>
                                    </button>

                                    <button
                                        onClick={() => setIsInsightsOpen(true)}
                                        className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold px-3 py-2 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900 transition-all"
                                        title="AI Financial Health Audit"
                                    >
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                        <span>AI Report</span>
                                    </button>
                                </>
                            )}

                            <ThemeToggle />

                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    className="flex items-center gap-1.5 bg-primary hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all"
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span>Sign In</span>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Hamburger Controls */}
                        <div className="flex lg:hidden items-center gap-2">
                            <ThemeToggle />
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Toggle Navigation Menu"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
                        {user && (
                            <div className="pb-3 border-b border-gray-100 dark:border-gray-700 space-y-2">
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Select Active Account</label>
                                <select
                                    value={selectedAccountId}
                                    onChange={(e) => {
                                        setSelectedAccountId(e.target.value);
                                        closeMobileMenu();
                                    }}
                                    className="w-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-none rounded-xl px-3 py-2.5"
                                >
                                    <option value="all">🌐 All Accounts</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} (₹{Number(acc.balance).toLocaleString('en-IN')})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                to="/landing"
                                onClick={closeMobileMenu}
                                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive('/landing') ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'}`}
                            >
                                Home
                            </Link>

                            {user && (
                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={closeMobileMenu}
                                        className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive('/dashboard') || isActive('/') ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'}`}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/accounts"
                                        onClick={closeMobileMenu}
                                        className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive('/accounts') ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'}`}
                                    >
                                        Accounts
                                    </Link>
                                    <Link
                                        to="/transactions"
                                        onClick={closeMobileMenu}
                                        className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive('/transactions') ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'}`}
                                    >
                                        Transactions
                                    </Link>
                                    <Link
                                        to="/budgets"
                                        onClick={closeMobileMenu}
                                        className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive('/budgets') ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'}`}
                                    >
                                        Budgets
                                    </Link>
                                    <Link
                                        to="/goals"
                                        onClick={closeMobileMenu}
                                        className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive('/goals') ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'}`}
                                    >
                                        Goals
                                    </Link>
                                    <Link
                                        to="/recurring"
                                        onClick={closeMobileMenu}
                                        className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive('/recurring') ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'}`}
                                    >
                                        Recurring
                                    </Link>
                                    <Link
                                        to="/analytics"
                                        onClick={closeMobileMenu}
                                        className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive('/analytics') ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'}`}
                                    >
                                        Analytics
                                    </Link>
                                    <Link
                                        to="/settings"
                                        onClick={closeMobileMenu}
                                        className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isActive('/settings') ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'}`}
                                    >
                                        Settings
                                    </Link>
                                </>
                            )}
                        </div>

                        {user && (
                            <div className="pt-2 flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        setIsScannerOpen(true);
                                        closeMobileMenu();
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md"
                                >
                                    <Camera className="h-4 w-4" />
                                    <span>AI Receipt Scanner</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsInsightsOpen(true);
                                        closeMobileMenu();
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold py-2.5 rounded-xl border border-purple-200 dark:border-purple-800"
                                >
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    <span>Generate AI Monthly Insights</span>
                                </button>
                            </div>
                        )}

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            {user ? (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        closeMobileMenu();
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={closeMobileMenu}
                                    className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-2"
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span>Sign In</span>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <AIReceiptScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onReceiptScanned={(tx) => {
                    alert(`Receipt Parsed! ${tx.title} for ₹${tx.amount} added.`);
                }}
            />

            <AIMonthlyInsightsModal
                isOpen={isInsightsOpen}
                onClose={() => setIsInsightsOpen(false)}
            />
        </>
    );
};

export default Navbar;
