'use client';

import React from 'react';

// Same logic as app/admin/layout.tsx's blocking pre-paint script
// (localStorage['iksez_admin_theme'] + a class on <html>) — extracted so
// ThemeToggleButton (still used standalone on the login page) and the
// sidebar's profile-menu toggle (used everywhere post-login) share one
// implementation instead of each keeping its own copy.
export function useThemeToggle() {
  const [darkMode, setDarkMode] = React.useState(true);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('iksez_admin_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('iksez_admin_theme', 'light');
      }
      return next;
    });
  };

  return { darkMode, toggleDarkMode };
}
