/**
 * Validator Handlers - Certificate validation logic
 */

/**
 * Handle certificate validation
 */
export async function handleValidate(): Promise<void> {
  const input = document.getElementById('hash-input') as HTMLInputElement;
  const btn = document.getElementById('validate-btn') as HTMLButtonElement;
  const hash = input?.value?.trim() || '';

  const resultBox = document.getElementById('result') as HTMLElement;
  const resultTitle = document.getElementById('result-title') as HTMLElement;
  const resultMsg = document.getElementById('result-msg') as HTMLElement;
  const statusIcon = document.getElementById('status-icon') as HTMLElement;
  const certDetails = document.getElementById('cert-details') as HTMLElement;
  const viewLink = document.getElementById('view-link') as HTMLAnchorElement;

  // Info Fields
  const infoStudent = document.getElementById('info-student');
  const infoCourse = document.getElementById('info-course');
  const infoDate = document.getElementById('info-date');

  if (!hash) {
    input.classList.add('shake');
    input.style.borderColor = '#ef4444';
    setTimeout(() => {
      input.classList.remove('shake');
      input.style.borderColor = '';
    }, 500);
    return;
  }

  // Start Loading State
  btn.disabled = true;
  const originalText = btn.textContent || 'Validar Certificado';
  btn.textContent = 'Verificando Autenticidade...';

  resultBox.style.display = 'none';

  try {
    const res = await fetch(`/certificates/${hash}`);
    const data = await res.json();

    if (res.ok && data.data && data.data.isValid) {
      resultBox.className = 'result-box valid';
      statusIcon.className = 'status-icon ph-fill ph-check-circle';
      resultTitle.textContent = 'Certificado Autêntico';
      resultTitle.style.color = '#10b981';
      resultMsg.textContent =
        'Este documento foi emitido e validado pela plataforma Lykos.';

      // Fill Details
      if (infoStudent) infoStudent.textContent = data.data.studentName;
      if (infoCourse) infoCourse.textContent = data.data.courseTitle;
      if (infoDate) {
        infoDate.textContent = new Date(data.data.issuedAt).toLocaleDateString(
          'pt-BR',
        );
      }

      certDetails.style.display = 'block';
      viewLink.href = `/certificado?hash=${hash}`;
      viewLink.style.display = 'block';
    } else {
      throw new Error('Certificado não encontrado');
    }
  } catch (error) {
    resultBox.className = 'result-box invalid';
    statusIcon.className = 'status-icon ph-fill ph-x-circle';
    resultTitle.textContent = 'Código Inválido';
    resultTitle.style.color = '#ef4444';
    resultMsg.textContent =
      'Não encontramos nenhum certificado registrado com este código.';
    certDetails.style.display = 'none';
  } finally {
    resultBox.style.display = 'block';
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

/**
 * Setup validator handlers
 */
export function setupValidatorHandlers(): void {
  const btn = document.getElementById('validate-btn');
  const input = document.getElementById('hash-input');

  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleValidate();
    });
  }

  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleValidate();
      }
    });
  }
}
