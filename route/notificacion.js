import 'dotenv/config';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { listar, marcarVisto } from '../controller/notificacion.js';

const notificacionRouter = Router();

notificacionRouter.use(authMiddleware);

// Devuelve las notificaciones del usuario autenticado.
notificacionRouter.get("/", listar);

// Marca una notificación como vista.
notificacionRouter.post("/:id/visto", marcarVisto);

export default notificacionRouter;
