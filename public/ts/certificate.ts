// Make function global for debugging/fallback
(window as any).downloadPDF = downloadPDF;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Certificate script loaded');
    const btnDownload = document.getElementById('btn-download');
    if (btnDownload) {
        console.log('Download button found, attaching listener');
        btnDownload.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Download button clicked');
            downloadPDF();
        });
    } else {
        console.error('Download button not found (id="btn-download")');
    }
});

function downloadPDF() {
    console.log('Starting PDF download process...');

    if (typeof html2pdf === 'undefined') {
        console.error('html2pdf library not loaded');
        alert('Erro: Biblioteca PDF não carregada. Tente recarregar a página.');
        return;
    }

    const element = document.querySelector('.cert-frame') as HTMLElement;
    const studentNameElement = document.getElementById('student-name');
    const studentName = studentNameElement && studentNameElement.textContent
        ? studentNameElement.textContent.trim()
        : 'Aluno';

    if (!element) {
        console.error('Certificate element (.cert-frame) not found');
        alert('Erro: Elemento do certificado não encontrado.');
        return;
    }

    console.log('Element found, generating PDF for:', studentName);

    const opt = {
        margin: 0, // No margin to fit exactly on A4 landscape
        filename: `Certificado - ${studentName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: true, // Enable html2canvas logging
            scrollX: 0,
            scrollY: 0,
            allowTaint: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    try {
        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                console.log('PDF download initiated successfully');
            })
            .catch((err: any) => {
                console.error('Error during PDF generation:', err);
                alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
            });
    } catch (err) {
        console.error('Unexpected error calling html2pdf:', err);
        alert('Erro inesperado ao gerar PDF.');
    }
}
