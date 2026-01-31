// Student Dashboard JavaScript
// Handles create course toggle and basic interactions

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    // Toggle create course form
    const createCourseToggle = document.getElementById('create-course-toggle');
    const createCourseForm = document.getElementById('create-course-form');

    if (createCourseToggle && createCourseForm) {
      createCourseToggle.addEventListener('click', function() {
        createCourseForm.classList.toggle('active');
      });

      // Handle form submission
      createCourseForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const titleInput = document.getElementById('course-title');
        const descInput = document.getElementById('course-desc');

        if (!titleInput.value.trim()) {
          alert('Course title is required');
          return;
        }

        // Here you would typically send to API
        console.log('Creating course:', {
          title: titleInput.value,
          description: descInput.value
        });

        // Clear form
        titleInput.value = '';
        descInput.value = '';

        // Hide form
        createCourseForm.classList.remove('active');

        // Show success message (you can replace with a toast notification)
        alert('Course created successfully!');
      });
    }
  });
})();
