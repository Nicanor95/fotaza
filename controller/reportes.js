import { Comentario } from '../models/Comentario.js';
import { Imagen } from '../models/Imagen.js';
import { ReporteComentario } from '../models/ReporteComentario.js';
import { ReporteImagen } from '../models/ReporteImagen.js';

async function getTarget(type, id) {
	if (type === 'imagen') {
		const image = await Imagen.findByPk(id);
		return image ? { image } : null;
	}

	if (type === 'comentario') {
		const comment = await Comentario.findByPk(id);
		if (!comment) {
			return null;
		}
		const image = await Imagen.findByPk(comment.parent_id);
		return image ? { comment, image } : null;
	}

	return null;
}

function parseTargetId(value) {
	const id = Number(value);
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function showReport(req, res) {
	const id = parseTargetId(req.params.id);
	const target = id && await getTarget(req.params.type, id);
	if (!target) {
		return res.status(404).render('fourohfour');
	}

	return res.render('report', { reportType: req.params.type, targetId: id });
}

export async function createReport(req, res) {
	const id = parseTargetId(req.params.id);
	const target = id && await getTarget(req.params.type, id);
	if (!target) {
		return res.status(404).render('fourohfour');
	}

	const motivo = typeof req.body.motivo === 'string' ? req.body.motivo.trim() : '';
	if (!motivo || motivo.length > 255) {
		return res.status(400).render('report', {
			reportType: req.params.type,
			targetId: id,
			motivo: req.body.motivo,
			error: 'El motivo es obligatorio y no puede superar los 255 caracteres.'
		});
	}

	if (req.params.type === 'imagen') {
		await ReporteImagen.create({
			img_id: target.image.id,
			usuario_id: req.user.id,
			motivo
		});
	} else if (req.params.type === 'comentario'){
		await ReporteComentario.create({
			comentario_id: target.comment.id,
			usuario_id: req.user.id,
			motivo
		});
	}

	return res.redirect(`/post/album/${target.image.publicacion_id}/${target.image.id}`);
}
