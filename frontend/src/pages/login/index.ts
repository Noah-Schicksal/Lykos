import '../../shared/styles/global.css';
import { el } from '../../shared/utils/dom';
import { apiRequest } from '../../services/api';

const app = document.getElementById('app');
const form = el('form', { className: 'login-form', onSubmit: async (e: Event) => {
    e.preventDefault();
    console.log('Tentando login...');
    // Logica de login aqui usando apiRequest
}}, 
    el('h1', {}, 'Login'),
    el('input', { type: 'email', placeholder: 'Email' }),
    el('input', { type: 'password', placeholder: 'Senha' }),
    el('button', { type: 'submit', className: 'btn' }, 'Entrar')
);

app?.appendChild(form);