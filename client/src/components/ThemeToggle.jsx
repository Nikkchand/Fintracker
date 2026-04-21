import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-yellow-500 dark:text-blue-400"
            aria-label="Toggle Theme"
        >
            <div className="relative w-6 h-6">
                <Sun
                    className={`absolute inset-0 w-6 h-6 transition-transform duration-500 rotate-0 scale-100 ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : ''}`}
                />
                <Moon
                    className={`absolute inset-0 w-6 h-6 transition-transform duration-500 rotate-90 scale-0 opacity-0 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : ''}`}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
