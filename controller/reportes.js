import { Comentario } from '../models/Comentario.js';
import { Imagen } from '../models/Imagen.js';
import { ImagenEliminada } from '../models/ImagenEliminada.js';
import { Publicacion } from '../models/Publicacion.js';
import { ReporteComentario } from '../models/ReporteComentario.js';
import { ReporteImagen } from '../models/ReporteImagen.js';
import { Rule } from '../models/Rule.js';
import { Usuario } from '../models/Usuario.js';
import sequelize from '../models/config.js';

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

async function getCommentReportTarget(id) {
	const comment = await Comentario.findByPk(id);
	if (!comment) {
		return null;
	}

	const image = await Imagen.findByPk(comment.parent_id, {
		attributes: ['id', 'publicacion_id']
	});
	if (!image) {
		return null;
	}

	const publication = await Publicacion.findByPk(image.publicacion_id, {
		attributes: ['usuario_id']
	});
	return publication ? { comment, image, publication } : null;
}

function canManageCommentReports(req, target) {
	return Boolean(
		req.user?.moderador ||
		Number(target.publication.usuario_id) === Number(req.user?.id)
	);
}

export async function showReport(req, res) {
	const id = parseTargetId(req.params.id);
	const target = id && await getTarget(req.params.type, id);
	if (!target) {
		return res.status(404).render('fourohfour');
	}

	const rules = await Rule.findAll({ order: [['id', 'ASC']] });
	return res.render('report', {
		reportType: req.params.type,
		targetId: id,
		rules,
		selectedRuleIds: []
	});
}

export async function createReport(req, res) {
	const id = parseTargetId(req.params.id);
	const target = id && await getTarget(req.params.type, id);
	if (!target) {
		return res.status(404).render('fourohfour');
	}

	const rules = await Rule.findAll({ order: [['id', 'ASC']] });
	const formData = {
		reportType: req.params.type,
		targetId: id,
		rules,
		selectedRuleIds: []
	};
	if (req.params.type === 'imagen' && await ReporteImagen.findOne({
		where: {
			img_id: target.image.id,
			usuario_id: req.user.id
		}
	})) {
		return res.status(409).render('report', {
			...formData,
			error: 'Ya reportaste esta imagen.'
		});
	}

	const submittedRuleValues = Array.isArray(req.body.rules)
		? req.body.rules
		: typeof req.body.rules === 'string' ? [req.body.rules] : [];
	const selectedRuleIds = [...new Set(submittedRuleValues.map(String))];
	formData.selectedRuleIds = selectedRuleIds;
	const parsedRuleIds = selectedRuleIds.map(Number);
	if (
		parsedRuleIds.length === 0 ||
		parsedRuleIds.some((ruleId) => !Number.isSafeInteger(ruleId) || ruleId < 1)
	) {
		return res.status(400).render('report', {
			...formData,
			error: 'Selecciona al menos una regla de la comunidad.'
		});
	}

	const selectedRules = await Rule.findAll({ where: { id: parsedRuleIds } });
	if (selectedRules.length !== parsedRuleIds.length) {
		return res.status(400).render('report', {
			...formData,
			error: 'La selección contiene una regla inválida.'
		});
	}
	const ruleTextById = new Map(selectedRules.map((rule) => [Number(rule.id), rule.text]));
	const motivo = parsedRuleIds.map((ruleId) => ruleTextById.get(ruleId)).join('; ');
	if (motivo.length > 255) {
		return res.status(400).render('report', {
			...formData,
			error: 'La selección de reglas supera el límite permitido.'
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

export async function listarReportesImagen(req, res) {
	const reportes = await ReporteImagen.findAll({
		attributes: ['img_id', [sequelize.fn('COUNT', sequelize.col('img_id')), 'cantidad']],
		group: ['img_id'],
		having: sequelize.literal('COUNT(*) >= 3'),
		order: [[sequelize.literal('COUNT(*)'), 'DESC']]
	});

	const counts = new Map(reportes.map((reporte) => [
		Number(reporte.img_id),
		Number(reporte.get('cantidad'))
	]));
	if (counts.size === 0) {
		return res.json([]);
	}

	const images = await Imagen.findAll({
		where: { id: [...counts.keys()] },
		attributes: ['id', 'publicacion_id', 'metadata', 'blob', 'description']
	});
	const reports = await ReporteImagen.findAll({
		where: { img_id: [...counts.keys()] },
		attributes: ['img_id', 'motivo'],
		order: [['createdAt', 'DESC']]
	});
	const reasonsByImage = new Map();
	for (const report of reports) {
		const id = Number(report.img_id);
		const reasons = reasonsByImage.get(id) || [];
		if (report.motivo && !reasons.includes(report.motivo)) {
			reasons.push(report.motivo);
		}
		reasonsByImage.set(id, reasons);
	}
	const imageById = new Map(images.map((image) => [Number(image.id), image]));
	const result = [...counts].flatMap(([id, cantidad]) => {
		const image = imageById.get(id);
		return image ? [{
			id,
			publicacion_id: image.publicacion_id,
			data: `${image.metadata}${image.blob.toString('base64')}`,
			description: image.description,
			cantidad,
			motivos: reasonsByImage.get(id) || []
		}] : [];
	});

	return res.json(result);
}

export async function listarReportesComentario(req, res) {
	const id = parseTargetId(req.params.id);
	const target = id && await getCommentReportTarget(id);
	if (!target) {
		return res.status(404).json({ error: 'Comentario no encontrado.' });
	}
	if (!canManageCommentReports(req, target)) {
		return res.status(403).json({ error: 'No tienes permiso para consultar estos reportes.' });
	}

	const reports = await ReporteComentario.findAll({
		where: { comentario_id: target.comment.id },
		attributes: ['id', 'motivo', 'createdAt'],
		include: [{ model: Usuario, attributes: ['nombre'] }],
		order: [['createdAt', 'DESC']]
	});

	return res.json(reports.map((report) => ({
		id: report.id,
		motivo: report.motivo,
		fecha: report.createdAt,
		reportante: report.Usuario?.nombre || 'Usuario'
	})));
}

export async function descartarReportesComentario(req, res) {
	const id = parseTargetId(req.params.id);
	const target = id && await getCommentReportTarget(id);
	if (!target) {
		return res.status(404).json({ error: 'Comentario no encontrado.' });
	}
	if (!canManageCommentReports(req, target)) {
		return res.status(403).json({ error: 'No tienes permiso para descartar estos reportes.' });
	}

	await ReporteComentario.destroy({ where: { comentario_id: target.comment.id } });
	return res.json({ ok: true });
}

export async function eliminarComentarioReportado(req, res) {
	const id = parseTargetId(req.params.id);
	const target = id && await getCommentReportTarget(id);
	if (!target) {
		return res.status(404).json({ error: 'Comentario no encontrado.' });
	}
	if (!canManageCommentReports(req, target)) {
		return res.status(403).json({ error: 'No tienes permiso para eliminar este comentario.' });
	}

	await sequelize.transaction(async (transaction) => {
		await ReporteComentario.destroy({
			where: { comentario_id: target.comment.id },
			transaction
		});
		await target.comment.destroy({ transaction });
	});

	return res.json({ ok: true });
}

async function getModeratedImage(value) {
	const id = parseTargetId(value);
	if (!id) {
		return null;
	}

	const image = await Imagen.findByPk(id);
	if (!image) {
		return null;
	}

	const count = await ReporteImagen.count({ where: { img_id: id } });
	return count >= 3 ? image : null;
}

export async function eliminarImagenReportada(req, res) {
	const image = await getModeratedImage(req.params.id);
	if (!image) {
		return res.status(404).json({ error: 'Imagen reportada no encontrada.' });
	}

	await sequelize.transaction(async (transaction) => {
		await ImagenEliminada.create({
			id: image.id,
			user_id: image.usuario_id,
			moderator_id: req.user.id
		}, { transaction });
		const removedImageCount = await ImagenEliminada.count({
			where: { user_id: image.usuario_id },
			transaction
		});
		if (removedImageCount >= 3) {
			await Usuario.update(
				{ banned: true },
				{ where: { id: image.usuario_id }, transaction }
			);
		}
		await ReporteImagen.destroy({ where: { img_id: image.id }, transaction });
		await image.destroy({ transaction });
	});

	return res.json({ ok: true });
}

export async function descartarReportesImagen(req, res) {
	const image = await getModeratedImage(req.params.id);
	if (!image) {
		return res.status(404).json({ error: 'Imagen reportada no encontrada.' });
	}

	await ReporteImagen.destroy({ where: { img_id: image.id } });
	return res.json({ ok: true });
}
