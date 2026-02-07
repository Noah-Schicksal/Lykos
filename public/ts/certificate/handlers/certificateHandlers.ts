/**
 * Certificate Handlers - Certificate display and print logic
 */

import {
  setCurrentHash,
  setIsEmbedded,
  getIsEmbedded,
} from '../state/certificateState.js';

// Declare html2pdf for TypeScript compatibility (global library)
declare const html2pdf: any;

/**
 * Print the certificate
 */
export function printCertificate(): void {
  window.focus();
  setTimeout(() => {
    window.print();
  }, 250);
}

/**
 * Downloads the certificate as a PDF
 */
export function downloadPDF(): void {
  console.log('Using optimized native print for high-fidelity A4 output');
  setTimeout(() => {
    window.print();
  }, 100);
}

/**
 * Scale certificate for embedded mode
 */
function scaleCertificateForEmbed(): void {
  const container = document.querySelector('.cert-container') as HTMLElement;
  const certificate = document.getElementById('certificate') as HTMLElement;

  if (container && certificate) {
    const scale =
      Math.min(
        container.offsetWidth / certificate.offsetWidth,
        container.offsetHeight / certificate.offsetHeight,
      ) * 0.95;

    certificate.style.transform = `scale(${scale})`;
  }
}

/**
 * Load and display certificate
 */
export async function loadCertificate(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const hash = params.get('hash');
  const isEmbedded = params.get('embed') === 'true';

  setCurrentHash(hash);
  setIsEmbedded(isEmbedded);

  if (isEmbedded) {
    document.body.classList.add('embedded');
  }

  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error-msg');
  const certEl = document.getElementById('certificate');

  if (!hash) {
    loadingEl?.classList.add('hidden');
    errorEl?.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch(`/certificates/${hash}`);
    const data = await res.json();

    if (res.ok && data.data) {
      const cert = data.data;

      // Helper to update text safely
      const updateText = (id: string, text: string) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };

      updateText('student-name', cert.studentName);
      updateText('course-title', cert.courseTitle);
      updateText('instructor-name', cert.instructorName);
      updateText('cert-hash', cert.certificateHash);
      updateText(
        'issue-date',
        new Date(cert.issuedAt).toLocaleDateString('pt-BR'),
      );

      // Show content
      loadingEl?.classList.add('hidden');
      certEl?.classList.remove('hidden');

      if (isEmbedded) {
        setTimeout(scaleCertificateForEmbed, 100);
      }
    } else {
      throw new Error('Not found');
    }
  } catch (error) {
    console.error('Error loading certificate:', error);
    loadingEl?.classList.add('hidden');
    errorEl?.classList.remove('hidden');
  }
}

/**
 * Setup certificate handlers
 */
export function setupCertificateHandlers(): void {
  const printBtn = document.getElementById('btn-internal-print');
  if (printBtn) {
    printBtn.addEventListener('click', printCertificate);
  }
}

// Expose globally for legacy usage
(window as any).downloadPDF = downloadPDF;
(window as any).printCertificate = printCertificate;
