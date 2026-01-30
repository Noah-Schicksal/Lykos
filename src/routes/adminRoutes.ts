import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { CourseService } from '../services/courseService';

const router = Router();

/**
 * @swagger
 * /admin/courses:
 *   get:
 *     summary: Lista todos os cursos (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos os cursos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - requer role ADMIN
 */
router.get(
  '/courses',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  async (req, res, next) => {
    try {
      const courseService = new CourseService();

      // Busca todos os cursos com limite alto para admin ver todos
      const result = await courseService.list(1, 1000);

      res.json({
        success: true,
        data: result.courses,
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /admin/courses/{id}:
 *   delete:
 *     summary: Exclui qualquer curso (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do curso
 *     responses:
 *       200:
 *         description: Curso excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - requer role ADMIN
 *       404:
 *         description: Curso não encontrado
 */
router.delete(
  '/courses/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  async (req, res, next) => {
    try {
      // Pega o ID do curso (pode vir como string ou array, pega sempre o primeiro)
      const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const courseService = new CourseService();

      // Verifica se o curso existe
      const course = await courseService.getById(courseId);

      // Admin pode deletar qualquer curso
      // Passa o user do request (que contém role ADMIN)
      await courseService.delete(courseId, req.user);

      res.json({
        success: true,
        message: 'Curso excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
