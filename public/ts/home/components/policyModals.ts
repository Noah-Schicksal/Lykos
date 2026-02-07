import { el, icon } from '../utils/dom.js';

/**
 * Renders a policy modal
 */
function renderPolicyModal(
  id: string,
  title: string,
  content: HTMLElement,
): HTMLElement {
  return el(
    'div',
    { id, className: 'policy-modal' },
    el(
      'div',
      { className: 'policy-modal-content' },
      el(
        'div',
        { className: 'policy-modal-header' },
        el('h2', null, title),
        el(
          'button',
          { className: 'policy-modal-close', 'data-modal': id },
          icon('close'),
        ),
      ),
      el('div', { className: 'policy-modal-body' }, content),
    ),
  );
}

/**
 * Renders terms modal content
 */
function renderTermsContent(): HTMLElement {
  const content = document.createDocumentFragment();

  const sections = [
    {
      title: '1. Aceitação dos Termos',
      text: 'Ao acessar e usar a plataforma Lykos, você concorda com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá usar nossos serviços.',
    },
    {
      title: '2. Uso da Plataforma',
      text: 'Você concorda em usar a plataforma apenas para fins legais e de acordo com estes Termos.',
    },
    {
      title: '3. Propriedade Intelectual',
      text: 'Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, vídeos e software, é propriedade da Lykos e protegido por leis de direitos autorais.',
    },
    {
      title: '4. Contas de Usuário',
      text: 'Você é responsável por manter a confidencialidade de sua conta e senha. Notifique-nos imediatamente sobre qualquer uso não autorizado de sua conta.',
    },
    {
      title: '5. Modificações',
      text: 'Reservamo-nos o direito de modificar estes termos a qualquer momento. Continuando a usar a plataforma após as alterações, você aceita os novos termos.',
    },
    {
      title: '6. Rescisão',
      text: 'Podemos encerrar ou suspender seu acesso à plataforma imediatamente, sem aviso prévio, por qualquer violação destes Termos de Uso.',
    },
  ];

  const container = el('div');
  sections.forEach((section) => {
    container.appendChild(el('h3', null, section.title));
    container.appendChild(el('p', null, section.text));
  });

  return container;
}

/**
 * Renders privacy modal content
 */
function renderPrivacyContent(): HTMLElement {
  const container = el('div');

  container.appendChild(el('h3', null, '1. Informações que Coletamos'));
  container.appendChild(
    el(
      'p',
      null,
      'Coletamos informações que você nos fornece diretamente, incluindo nome completo, endereço de e-mail, informações de perfil e histórico de cursos.',
    ),
  );

  container.appendChild(el('h3', null, '2. Como Usamos suas Informações'));
  container.appendChild(
    el(
      'p',
      null,
      'Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, processar transações e personalizar sua experiência de aprendizado.',
    ),
  );

  container.appendChild(el('h3', null, '3. Compartilhamento de Informações'));
  container.appendChild(
    el(
      'p',
      null,
      'Não vendemos suas informações pessoais. Podemos compartilhar informações apenas com instrutores dos cursos que você está matriculado e provedores de serviços terceirizados necessários.',
    ),
  );

  container.appendChild(el('h3', null, '4. Segurança dos Dados'));
  container.appendChild(
    el(
      'p',
      null,
      'Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração ou destruição.',
    ),
  );

  container.appendChild(el('h3', null, '5. Seus Direitos'));
  container.appendChild(
    el(
      'p',
      null,
      'Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento através das configurações de sua conta.',
    ),
  );

  return container;
}

/**
 * Renders security modal content
 */
function renderSecurityContent(): HTMLElement {
  const container = el('div');

  container.appendChild(el('h3', null, '1. Compromisso com a Segurança'));
  container.appendChild(
    el(
      'p',
      null,
      'A segurança dos seus dados é nossa prioridade máxima. Implementamos práticas e tecnologias de segurança líderes do setor para proteger sua informação.',
    ),
  );

  container.appendChild(el('h3', null, '2. Criptografia'));
  container.appendChild(
    el(
      'p',
      null,
      'Todas as informações sensíveis são criptografadas em trânsito usando SSL/TLS e em repouso usando criptografia AES-256.',
    ),
  );

  container.appendChild(el('h3', null, '3. Autenticação'));
  container.appendChild(
    el(
      'p',
      null,
      'Senhas devem ter no mínimo 8 caracteres. Sessões expiram automaticamente após inatividade.',
    ),
  );

  container.appendChild(el('h3', null, '4. Infraestrutura'));
  container.appendChild(
    el(
      'p',
      null,
      'Nossa plataforma é hospedada em servidores seguros com firewalls, backups regulares e monitoramento 24/7.',
    ),
  );

  container.appendChild(el('h3', null, '5. Conformidade'));
  container.appendChild(
    el(
      'p',
      null,
      'Cumprimos com regulamentações de proteção de dados, incluindo LGPD (Lei Geral de Proteção de Dados) e GDPR quando aplicável.',
    ),
  );

  return container;
}

/**
 * Renders all policy modals
 */
export function renderPolicyModals(): HTMLElement {
  const fragment = document.createDocumentFragment();

  fragment.appendChild(
    renderPolicyModal('terms-modal', 'Termos de Uso', renderTermsContent()),
  );
  fragment.appendChild(
    renderPolicyModal(
      'privacy-modal',
      'Política de Privacidade',
      renderPrivacyContent(),
    ),
  );
  fragment.appendChild(
    renderPolicyModal(
      'security-modal',
      'Política de Segurança',
      renderSecurityContent(),
    ),
  );

  const container = el('div');
  container.appendChild(fragment);
  return container;
}

/**
 * Sets up policy modal handlers
 */
export function setupPolicyModalHandlers(): void {
  const closeButtons = document.querySelectorAll('.policy-modal-close');

  closeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      if (modalId) {
        const modal = document.getElementById(modalId);
        modal?.classList.remove('active');
      }
    });
  });

  // Close on overlay click
  const modals = document.querySelectorAll('.policy-modal');
  modals.forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

/**
 * Shows a policy modal
 */
export function showPolicyModal(modalId: string): void {
  const modal = document.getElementById(modalId);
  modal?.classList.add('active');
}
