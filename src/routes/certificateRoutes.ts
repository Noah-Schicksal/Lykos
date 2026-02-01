import { Router } from 'express';
import { CertificationController } from '../controllers/certificationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const certificateRoutes = Router();
const certificationController = new CertificationController();

// Rota autenticada - deve vir ANTES da rota /:hash para não conflitar
certificateRoutes.get('/user/me', authMiddleware, (req, res, next) =>
  certificationController.getUserCertificates(req, res, next),
);

// Acesso público para validação
certificateRoutes.get('/:hash', (req, res, next) =>
  certificationController.validate(req, res, next),
);

export default certificateRoutes;
