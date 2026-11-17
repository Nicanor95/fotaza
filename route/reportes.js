import { Router } from 'express';
import { authMiddleware, moderatorMiddleware } from '../middleware/auth.js';
import {
	createReport,
	listarReportesImagen,
	showReport
} from '../controller/reportes.js';

const reportesRouter = Router();

reportesRouter.use(authMiddleware);
reportesRouter.get('/moderacion/imagenes', moderatorMiddleware, listarReportesImagen);
reportesRouter.get('/:type/:id', showReport);
reportesRouter.post('/:type/:id', createReport);

export default reportesRouter;
