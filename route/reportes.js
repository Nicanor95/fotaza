import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createReport, showReport } from '../controller/reportes.js';

const reportesRouter = Router();

reportesRouter.use(authMiddleware);
reportesRouter.get('/:type/:id', showReport);
reportesRouter.post('/:type/:id', createReport);

export default reportesRouter;
