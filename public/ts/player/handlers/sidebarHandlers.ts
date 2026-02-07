/**
 * Sidebar Handlers - Toggle sidebar, accordion, class selection
 */

import { getCurrentClassId } from '../state/playerState.js';

/**
 * Setup sidebar toggle and responsive behavior
 */
export function setupSidebarHandlers(): void {
  const layout = document.querySelector('.player-layout') as HTMLElement;
  const btnToggle = document.getElementById(
    'btn-toggle-sidebar',
  ) as HTMLElement;
  const sidebar = document.querySelector('.player-sidebar') as HTMLElement;
  const backdrop = document.querySelector(
    '.sidebar-overlay-backdrop',
  ) as HTMLElement;

  if (!layout || !btnToggle || !sidebar || !backdrop) return;

  const toggleSidebar = (forceState?: boolean) => {
    const isMobile = window.innerWidth <= 1024;

    if (isMobile) {
      // Mobile: Toggle drawer open/closed
      const isOpen =
        forceState !== undefined
          ? forceState
          : !sidebar.classList.contains('sidebar-open');

      if (isOpen) {
        sidebar.classList.add('sidebar-open');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        sidebar.classList.remove('sidebar-open');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }

      // Update icon
      const icon = btnToggle.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = isOpen ? 'close' : 'view_sidebar';
      }
    } else {
      // Desktop: Toggle collapse state
      const isCollapsed =
        forceState !== undefined
          ? forceState
          : !layout.classList.contains('sidebar-collapsed');

      if (isCollapsed) {
        layout.classList.add('sidebar-collapsed');
        localStorage.setItem('player_sidebar_collapsed', 'true');
      } else {
        layout.classList.remove('sidebar-collapsed');
        localStorage.setItem('player_sidebar_collapsed', 'false');
      }

      // Ensure sidebar is not in drawer mode
      sidebar.classList.remove('sidebar-open');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  btnToggle.addEventListener('click', () => toggleSidebar());

  // Close drawer when clicking backdrop
  backdrop.addEventListener('click', () => {
    if (sidebar.classList.contains('sidebar-open')) {
      toggleSidebar(false);
    }
  });

  // Close drawer on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('sidebar-open')) {
      toggleSidebar(false);
    }
  });

  // Close drawer when selecting a class
  const modulesList = document.getElementById('modules-list');
  if (modulesList) {
    modulesList.addEventListener('click', () => {
      if (
        window.innerWidth <= 1024 &&
        sidebar.classList.contains('sidebar-open')
      ) {
        setTimeout(() => toggleSidebar(false), 300);
      }
    });
  }

  // Restore desktop state if was collapsed
  const isMobile = window.innerWidth <= 1024;
  if (!isMobile) {
    const savedState =
      localStorage.getItem('player_sidebar_collapsed') === 'true';
    if (savedState) toggleSidebar(true);
  }
}

/**
 * Setup tabs navigation (if present)
 */
export function setupTabs(): void {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Remove active from all
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      // Add active to clicked
      btn.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}
