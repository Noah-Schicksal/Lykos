import { Router } from 'express';
import path from 'path';

const viewRoutes = Router();

// Helper to serve HTML files
const serveView = (viewName: string) => {
    return (req: any, res: any) => {
        res.sendFile(path.join(__dirname, '../../public', viewName));
    };
};

// --- Mapeamento de Rotas de Visualização (Telas) ---

// Estudante
viewRoutes.get('/estudante', serveView('student.html'));

// Professor (Instrutor)
viewRoutes.get('/professor', serveView('instructor.html'));

// Carrinho de Compras
viewRoutes.get('/carrinho', serveView('cart.html'));

// Player de Curso (Aula)
// Nota: Rota parametrizada. O frontend deve ler o ID da URL.
// Exemplo: /aula/123
// O arquivo html (watch.html) precisa de JS para pegar o ID da URL.
viewRoutes.get('/aula/:id', serveView('player.html'));

viewRoutes.get('/inicio', serveView('index.html'));

export default viewRoutes;
