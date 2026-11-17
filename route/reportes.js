import { Router } from 'express';
import { authMiddleware, moderatorMiddleware } from '../middleware/auth.js';
import {
	createReport,
	descartarReportesComentario,
	descartarReportesImagen,
	eliminarComentarioReportado,
	eliminarImagenReportada,
	listarReportesComentario,
	listarReportesImagen,
	showReport
} from '../controller/reportes.js';

const reportesRouter = Router();

reportesRouter.use(authMiddleware);
reportesRouter.get('/comentario/:id/reportes', listarReportesComentario);
reportesRouter.post('/comentario/:id/descartar', descartarReportesComentario);
reportesRouter.post('/comentario/:id/eliminar', eliminarComentarioReportado);
reportesRouter.get('/moderacion/imagenes', moderatorMiddleware, listarReportesImagen);
reportesRouter.post('/moderacion/imagenes/:id/eliminar', moderatorMiddleware, eliminarImagenReportada);
reportesRouter.post('/moderacion/imagenes/:id/descartar', moderatorMiddleware, descartarReportesImagen);
reportesRouter.get('/:type/:id', showReport);
reportesRouter.post('/:type/:id', createReport);

export default reportesRouter;
