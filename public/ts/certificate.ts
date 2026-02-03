/**
 * Certificate Handling Script
 * 
 * Note: This file exists to maintain build consistency after a git merge.
 * The primary certificate logic is now simplified to use high-fidelity browser printing.
 */

// Declare html2pdf for TypeScript compatibility (global library)
declare const html2pdf: any;

/**
 * Downloads the certificate as a PDF
 */
export function downloadPDF() {
    console.log('Using optimized native print for high-fidelity A4 output');

    // Use a small delay to ensure UI threads are clear
    setTimeout(() => {
        window.print();
    }, 100);
}

// Ensure globally available for button clicks if needed
(window as any).downloadPDF = downloadPDF;

// Minimal logic for the certificate page if loaded as a standalone script
document.addEventListener('DOMContentLoaded', () => {
    const printBtn = document.getElementById('btn-internal-print');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
});
