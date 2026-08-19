'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeToggle } from '@/hooks/useThemeToggle';

// Standalone icon-button form of the toggle — used on the login page (no
// sidebar there to host it). Inside the admin panel itself, the toggle now
// lives in AdminSidebar's profile dropdown instead (see UserMenu-style
// "Light Mode" row there), not here.
export function ThemeToggleButton({ className = '' }: { className?: string }) {
  const { darkMode, toggleDarkMode } = useThemeToggle();

  return (
    <button
      onClick={toggleDarkMode}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
      className={`p-2.5 rounded-full text-slate-500 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 backdrop-blur transition-colors border border-slate-200 dark:border-slate-700/80 ${className}`}
    >
      {darkMode ? <Sun className="w-4 h-4 text-primary-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
    </button>
  );
}
