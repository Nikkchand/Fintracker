import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Camera, Wallet, AlertTriangle, RefreshCw, BrainCircuit, ArrowRight, CheckCircle2, Star, Shield, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const Landing = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            q: 'How does the AI Receipt Scanner work?',
            a: 'Simply upload or snap a photo of any paper receipt or digital bill. Our multimodal Gemini AI automatically parses the transaction title, amount, category, and date, filling in your transaction form in seconds.'
        },
        {
            q: 'Can I track multiple bank accounts and credit cards?',
            a: 'Yes! FinTrakr allows you to add unlimited checking, savings, credit cards, investment accounts, and cash wallets to monitor your total net worth in one unified dashboard.'
        },
        {
            q: 'How do Smart Budget Alerts notify me?',
            a: 'When your categorical spending reaches 80% or exceeds 100% of your allocated monthly limit, FinTrakr displays high-priority visual flags and budget warning banners to prevent overspending.'
        },
        {
            q: 'Is my financial data secure?',
            a: 'Security is our highest priority. All data is encrypted in transit and at rest using bank-grade 256-bit SSL encryption and backed by secure Google Firebase infrastructure.'
        }
    ];

    return (
        <div className="space-y-24 pb-20">
            {/* HERO SECTION */}
            <section className="relative pt-12 pb-16 overflow-hidden">
                {/* Background Glow Accents */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10 px-4">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-primary dark:text-indigo-300 text-xs font-bold shadow-sm animate-pulse">
                        <Sparkles className="h-4 w-4" />
                        <span>Introducing FinTrakr 2.0 with Gemini AI Vision & Budget Engine</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1]">
                        Manage Your Finances with <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            AI Intelligence & Ease
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
                        An all-in-one AI personal finance platform. Track multi-bank balances, scan paper receipts with AI, automate recurring subscriptions, and get smart budget warnings.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            to="/signup"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-base shadow-xl shadow-indigo-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            <span>Get Started Free</span>
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            to="/dashboard"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-extrabold text-base border border-gray-200 dark:border-gray-700 shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <span>Explore Live Dashboard</span>
                        </Link>
                    </div>

                    {/* Trust Badges */}
                    <div className="pt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-emerald-500" /> Bank-Grade 256-bit Encryption
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No Credit Card Required
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> 4.9/5 Rating (2,400+ Users)
                        </span>
                    </div>
                </div>

                {/* Hero Mockup Showcase */}
                <div className="max-w-6xl mx-auto mt-16 px-4">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        {/* Interactive Tab Switcher */}
                        <div className="flex flex-wrap gap-2 pb-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <TrendingUp className="h-4 w-4" />
                                Smart Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('scanner')}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'scanner' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <Camera className="h-4 w-4" />
                                AI Receipt Scanner
                            </button>
                            <button
                                onClick={() => setActiveTab('accounts')}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'accounts' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <Wallet className="h-4 w-4" />
                                Multi-Bank Accounts
                            </button>
                            <button
                                onClick={() => setActiveTab('budgets')}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'budgets' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <AlertTriangle className="h-4 w-4" />
                                Budget Threshold Alerts
                            </button>
                        </div>

                        {/* Interactive Tab Preview Windows */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 min-h-[300px]">
                            {activeTab === 'dashboard' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-5 rounded-2xl text-white shadow-md">
                                            <p className="text-xs text-indigo-100 font-medium">Total Balance</p>
                                            <p className="text-3xl font-black mt-1">₹10,05,000</p>
                                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-2 inline-block">Across 4 Accounts</span>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 font-medium">Monthly Income</p>
                                            <p className="text-3xl font-extrabold text-emerald-600 mt-1">₹1,85,000</p>
                                            <span className="text-xs text-emerald-500 font-semibold mt-2 block">+12% vs last month</span>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 font-medium">Monthly Expenses</p>
                                            <p className="text-3xl font-extrabold text-rose-600 mt-1">₹68,400</p>
                                            <span className="text-xs text-emerald-600 font-semibold mt-2 block">Well within budget</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'scanner' && (
                                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-indigo-200 dark:border-indigo-900 flex flex-col sm:flex-row items-center gap-6 animate-fade-in">
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border border-indigo-200 text-center">
                                        <Camera className="h-12 w-12 text-primary mx-auto mb-2" />
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Scan Receipt Photo</p>
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <div className="inline-block bg-emerald-100 text-emerald-800 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full">
                                            Gemini AI 98.8% Accuracy
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Starbucks Coffee & Bakery</h4>
                                        <p className="text-sm text-gray-500">Extracted Amount: <strong className="text-emerald-600 font-bold">₹450.00</strong> • Category: <strong>Food</strong></p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'accounts' && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl text-white shadow-md">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">Checking</span>
                                        <h4 className="font-bold text-lg">HDFC Checking</h4>
                                        <p className="text-2xl font-black mt-2">₹1,45,000</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-md">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">Savings</span>
                                        <h4 className="font-bold text-lg">ICICI Emergency</h4>
                                        <p className="text-2xl font-black mt-2">₹3,20,000</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-5 rounded-2xl text-white shadow-md">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-purple-200">Credit Card</span>
                                        <h4 className="font-bold text-lg">Axis Rewards</h4>
                                        <p className="text-2xl font-black mt-2">-₹24,500</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'budgets' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4 rounded-2xl flex items-center gap-3">
                                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Food & Dining Threshold Alert (88% Used)</h4>
                                            <p className="text-xs text-amber-700 dark:text-amber-300">Spent ₹13,200 of ₹15,000 limit.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* METRICS COUNTER */}
            <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 py-12 text-white">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <h3 className="text-4xl font-black">₹100M+</h3>
                        <p className="text-xs text-indigo-200 mt-1 uppercase font-semibold tracking-wider">Transactions Processed</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-black">45,000+</h3>
                        <p className="text-xs text-indigo-200 mt-1 uppercase font-semibold tracking-wider">Active Monthly Users</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-black">99.4%</h3>
                        <p className="text-xs text-indigo-200 mt-1 uppercase font-semibold tracking-wider">AI Vision Accuracy</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-black">4.9 / 5</h3>
                        <p className="text-xs text-indigo-200 mt-1 uppercase font-semibold tracking-wider">User Satisfaction Score</p>
                    </div>
                </div>
            </section>

            {/* FEATURES GRID */}
            <section className="max-w-6xl mx-auto px-4 space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                        Everything You Need to Master Your Money
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-sm">
                        Built for modern professionals looking for effortless AI automation and complete financial clarity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl w-fit text-primary mb-6">
                            <Camera className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Receipt Scanner</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Snap or upload any paper invoice. Gemini AI parses merchant name, totals, date, and category automatically.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all">
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/60 rounded-2xl w-fit text-purple-600 mb-6">
                            <Wallet className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Multi-Bank Account Hub</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Track checking, savings, credit cards, investment funds, and cash wallets with consolidated net worth totals.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all">
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/60 rounded-2xl w-fit text-amber-600 mb-6">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Smart Budget Alerts</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get early warning flags when your category spend reaches 80% or exceeds 100% of your allocated monthly cap.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl w-fit text-emerald-600 mb-6">
                            <RefreshCw className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Recurring Subscriptions</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Schedule recurring rent, salaries, and subscriptions (Netflix, Spotify) with 1-click auto-processing engine.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/60 rounded-2xl w-fit text-blue-600 mb-6">
                            <BrainCircuit className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Monthly Insights</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get personalized financial health scores (0-100), customized cost-cutting tips, and savings action plans.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all">
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 rounded-2xl w-fit text-rose-600 mb-6">
                            <Shield className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Firebase Cloud Backups</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Your transactions sync seamlessly across devices using Firebase Firestore and Google Auth security.
                        </p>
                    </div>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section className="max-w-5xl mx-auto px-4 space-y-12">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-gray-500 text-sm">Start free today and upgrade as your finances grow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Starter</h3>
                            <p className="text-xs text-gray-500 mt-1">For casual expense tracking</p>
                            <p className="text-4xl font-black mt-4 text-gray-900 dark:text-white">Free</p>
                            <ul className="mt-6 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Up to 2 Bank Accounts</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 10 AI Receipt Scans / mo</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Basic Monthly Analytics</li>
                            </ul>
                        </div>
                        <Link to="/signup" className="mt-8 py-3 rounded-xl border border-primary text-primary text-center font-bold text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">
                            Get Started Free
                        </Link>
                    </div>

                    <div className="bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-8 rounded-3xl shadow-2xl relative flex flex-col justify-between transform md:-translate-y-4">
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-indigo-950 text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-md">
                            Most Popular
                        </span>
                        <div>
                            <h3 className="text-xl font-bold">Pro AI</h3>
                            <p className="text-xs text-indigo-200 mt-1">For power users & smart savers</p>
                            <p className="text-4xl font-black mt-4">₹499 <span className="text-sm text-indigo-200 font-normal">/ mo</span></p>
                            <ul className="mt-6 space-y-3 text-xs text-indigo-100">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-300" /> Unlimited Bank Accounts</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-300" /> Unlimited AI Receipt Scanning</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-300" /> Smart Budget Threshold Alerts</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-300" /> Gemini Monthly Insights & Reports</li>
                            </ul>
                        </div>
                        <Link to="/signup" className="mt-8 py-3.5 rounded-xl bg-amber-400 text-indigo-950 text-center font-black text-xs hover:bg-amber-300 transition-colors shadow-lg">
                            Start 14-Day Free Trial
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Business</h3>
                            <p className="text-xs text-gray-500 mt-1">For freelancers & small businesses</p>
                            <p className="text-4xl font-black mt-4 text-gray-900 dark:text-white">₹1,499 <span className="text-sm text-gray-500 font-normal">/ mo</span></p>
                            <ul className="mt-6 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Everything in Pro</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Multi-user Collaboration</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Export CSV / Tax Reports</li>
                            </ul>
                        </div>
                        <Link to="/signup" className="mt-8 py-3 rounded-xl border border-gray-300 text-gray-800 dark:text-gray-200 text-center font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="max-w-4xl mx-auto px-4 space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                    <p className="text-gray-500 text-xs">Got questions? We've got answers.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <button
                                onClick={() => toggleFaq(idx)}
                                className="w-full p-5 text-left flex justify-between items-center font-bold text-gray-900 dark:text-white text-sm"
                            >
                                <span>{faq.q}</span>
                                {openFaq === idx ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                            </button>
                            {openFaq === idx && (
                                <div className="px-5 pb-5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="pt-12 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
                <p>© 2026 FinTrakr AI Finance Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
