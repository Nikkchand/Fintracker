import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock profile update
            await new Promise(resolve => setTimeout(resolve, 500));
            // In a real app we'd update AuthContext state here too
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error updating profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Profile Information</h2>

                {message && (
                    <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            disabled
                            value={user?.email || ''}
                            className="w-full rounded-lg border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed p-2.5"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary p-2.5"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h2>
                    <button
                        onClick={() => signOut()} // Logout 
                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        Sign Out
                    </button>
                    {/* Delete account logic could be added here */}
                </div>
            </div>
        </div>
    );
};

export default Settings;
