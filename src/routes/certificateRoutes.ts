import { Router } from 'express';
import { CertificationController } from '../controllers/certificationController';

const certificateRoutes = Router();
const certificationController = new CertificationController();

// Acesso público para validação
certificateRoutes.get('/:hash', (req, res, next) => certificationController.validate(req, res, next));

export default certificateRoutes;
