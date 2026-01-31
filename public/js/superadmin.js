// Super Admin Database Viewer Script
// Handles database dump viewing and filtering

(function() {
  'use strict';

  let lastRows = null;

  // Get authentication token
  function getToken() {
    const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return prompt('Please enter the JWT token (admin):');
  }

  // Set status message
  function setStatus(text) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = text;
    }
  }

  // Load data from API
  async function load() {
    const token = getToken();

    if (!token) {
      setStatus('❌ Token not provided');
      return;
    }

    setStatus('⏳ Loading...');

    try {
      const response = await fetch('/admin/dump', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();
      lastRows = data.rows || [];
      render(lastRows);
      setStatus(`✅ Loaded ${lastRows.length} entries from database`);
    } catch (error) {
      setStatus('❌ Error: ' + error.message);
      console.error('Error loading data:', error);
    }
  }

  // Render table rows
  function render(rows) {
    const tbody = document.querySelector('#tbl tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const filterValue = (document.getElementById('filter').value || '').toLowerCase();

    for (const row of rows) {
      const key = String(row.key || '');
      const value = JSON.stringify(row.value, null, 2);

      // Apply filter
      if (filterValue &&
          !(key.toLowerCase().includes(filterValue) ||
            value.toLowerCase().includes(filterValue))) {
        continue;
      }

      // Create table row
      const tr = document.createElement('tr');

      // Key cell
      const tdKey = document.createElement('td');
      tdKey.textContent = key;

      // Value cell with pre element
      const tdVal = document.createElement('td');
      const pre = document.createElement('pre');
      pre.textContent = value;
      tdVal.appendChild(pre);

      tr.appendChild(tdKey);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    }

    // If no rows match filter
    if (tbody.children.length === 0 && filterValue) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 2;
      td.style.textAlign = 'center';
      td.style.padding = '2rem';
      td.style.color = 'var(--text-muted)';
      td.style.fontStyle = 'italic';
      td.textContent = 'No results found for "' + filterValue + '"';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  }

  // Load from cache (for filtering)
  async function loadCached() {
    if (!lastRows) {
      return load();
    }
    render(lastRows);
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', load);
    }

    // Filter input
    const filterInput = document.getElementById('filter');
    if (filterInput) {
      filterInput.addEventListener('input', loadCached);
    }

    // Initial load
    load();
  });
})();
