import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const studentRoutes = Router();
const studentController = new StudentController();

// Todas as rotas de estudante requerem autenticação
studentRoutes.use(authMiddleware);

// Rotas exclusivas para alunos (ou instrutores que também são alunos em outros cursos)
// A princípio qualquer usuário autenticado pode ser um estudante se tiver matriculado.
// Mas se quisermos restringir a ROLE, usaríamos roleMiddleware(['STUDENT']).
// O prompt diz "Acesso: Aluno". Vamos restringir.

studentRoutes.get('/my-courses', roleMiddleware(['STUDENT', 'INSTRUCTOR']), (req, res, next) => studentController.listMyCourses(req, res, next));
studentRoutes.get('/my-courses/:id', roleMiddleware(['STUDENT', 'INSTRUCTOR']), (req, res, next) => studentController.getCourseDetails(req, res, next));
studentRoutes.post('/courses/:id/certificate', roleMiddleware(['STUDENT', 'INSTRUCTOR']), (req, res, next) => studentController.issueCertificate(req, res, next));

export default studentRoutes;
