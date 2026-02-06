/**
 * Danger Zone Handlers - Toggle status, delete course
 */

import { AppUI } from '../../utils/ui.js';
import { getCurrentCourseId } from '../state/adminState.js';
import { showEmptyState } from './courseHandlers.js';
import { loadSidebarCourses } from './sidebarHandlers.js';

/**
 * Setup danger zone handlers
 */
export function setupDangerZoneHandlers(): void {
  const toggleStatusBtn = document.getElementById(
    'toggle-status',
  ) as HTMLButtonElement;
  const statusText = document.getElementById('status-text') as HTMLElement;
  const btnDelete = document.getElementById(
    'btn-delete-course',
  ) as HTMLButtonElement;

  // Toggle Switch Logic
  if (toggleStatusBtn) {
    toggleStatusBtn.addEventListener('click', () => {
      const isActive = toggleStatusBtn.classList.contains('active');

      if (isActive) {
        // Switching to OFF (Ready to Delete/Danger)
        toggleStatusBtn.classList.remove('active');
        toggleStatusBtn.classList.add('inactive');

        statusText.textContent = 'PERIGO';
        statusText.classList.remove('active');
        statusText.classList.add('inactive');

        // Enable Delete Button
        btnDelete.disabled = false;
        btnDelete.classList.remove('btn-delete-disabled');
        btnDelete.classList.add('btn-delete-active');
      } else {
        // Switching Back to ON (Safe)
        toggleStatusBtn.classList.add('active');
        toggleStatusBtn.classList.remove('inactive');

        statusText.textContent = 'SEGURO';
        statusText.classList.add('active');
        statusText.classList.remove('inactive');

        // Disable Delete Button
        btnDelete.disabled = true;
        btnDelete.classList.add('btn-delete-disabled');
        btnDelete.classList.remove('btn-delete-active');
      }
    });
  }

  // Delete Logic
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      const currentCourseId = getCurrentCourseId();
      if (currentCourseId && !btnDelete.disabled) {
        await deleteCourse(currentCourseId);
      }
    });
  }
}

/**
 * Reset danger zone to safe state
 */
export function resetDangerZone(): void {
  const toggleStatusBtn = document.getElementById(
    'toggle-status',
  ) as HTMLButtonElement;
  const statusText = document.getElementById('status-text') as HTMLElement;
  const btnDelete = document.getElementById(
    'btn-delete-course',
  ) as HTMLButtonElement;

  if (toggleStatusBtn) {
    toggleStatusBtn.classList.add('active');
    toggleStatusBtn.classList.remove('inactive');
  }
  if (statusText) {
    statusText.textContent = 'SEGURO';
    statusText.classList.add('active');
    statusText.classList.remove('inactive');
  }
  if (btnDelete) {
    btnDelete.disabled = true;
    btnDelete.classList.add('btn-delete-disabled');
    btnDelete.classList.remove('btn-delete-active');
  }
}

/**
 * Delete a course
 */
async function deleteCourse(id: string): Promise<void> {
  try {
    await AppUI.apiFetch(`/admin/courses/${id}`, { method: 'DELETE' });
    AppUI.showMessage('Curso excluído com sucesso', 'success');

    // Reset view
    showEmptyState();

    // Reload sidebar
    loadSidebarCourses(true);
  } catch (error) {
    console.error(error);
    AppUI.showMessage('Erro ao excluir curso', 'error');
  }
}
