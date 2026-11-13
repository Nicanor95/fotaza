import { Notificacion } from '../models/Notificacion.js';

// Devuelve las notificaciones del usuario autenticado.
export async function listar(req, res) {
	const notificaciones = await Notificacion.findAll({
		where: { usuario_id: req.user.id },
		order: [['createdAt', 'DESC']]
	});
	return res.json(notificaciones);
}

// Marca una notificación como vista.
export async function marcarVisto(req, res) {
	const id = Number(req.params.id);
	const notificacion = await Notificacion.findByPk(id);

	if (!notificacion || Number(notificacion.usuario_id) !== Number(req.user.id)) {
		return res.status(404).json({ error: 'Notificación no encontrada' });
	}

	notificacion.visto = true;
	await notificacion.save();
	return res.json({ ok: true });
}
