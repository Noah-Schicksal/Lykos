// Theme Toggle Script
// Handles dark/light mode switching with localStorage persistence

(function() {
  'use strict';

  // Check for saved theme preference or default to dark mode
  const currentTheme = localStorage.getItem('theme') || 'dark';

  // Apply theme on page load
  if (currentTheme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
      // Toggle theme on button click
      themeToggle.addEventListener('click', function() {
        document.documentElement.classList.toggle('light');

        // Save preference to localStorage
        if (document.documentElement.classList.contains('light')) {
          localStorage.setItem('theme', 'light');
        } else {
          localStorage.setItem('theme', 'dark');
        }
      });
    }
  });
})();
