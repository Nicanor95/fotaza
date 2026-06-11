import { Valoracion } from "../models/Valoracion.js";
import { Imagen } from "../models/Imagen.js";
import { Sequelize } from "sequelize";

async function valorate(user_id, img_id, value) {
	// With the values for user_id, img_id, and value, add or update a valoration
	try {
		await Valoracion.upsert({
			usuario_id: Number(user_id),
			img_id: Number(img_id),
			valor: Number(value)
		});
		return true;
	} catch (err) {
		console.error('Error in valorate:', err);
		return false;
	}
}

export async function getAvgValoration(img_id) {
	// From img_id get average valoration
	try {
		const result = await Valoracion.findAll({
			attributes: [
				[Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('valor')), 0), 'average']
			],
			where: {
				img_id: Number(img_id)
			},
			raw: true
		});
		
		return result[0].average;
	} catch (err) {
		console.error('Error in getAvgValoration:', err);
		return 0;
	}
}

export async function newValoration(req, res) {
	const albumId = Number(req.params.album_id);
	const imageId = Number(req.params.image_id);
	
	if (!req.user) {
		return res.redirect('/auth/login');
	}
	
	const value = Number(req.body.valor);
	
	if (!value || value < 1 || value > 5) {
		return res.redirect(`/post/album/${albumId}/${imageId}`);
	}
	
	// Check if image exists
	const image = await Imagen.findByPk(imageId);
	if (!image) {
		return res.render('error', { error: `No se encontró la imagen con id: ${imageId} :(` });
	}
	
	try {
		const success = await valorate(req.user.id, imageId, value);
		if (!success) {
			return res.render('error', { error: 'Ocurrió un error guardando la valoración.' });
		}
	} catch (err) {
		console.error('Error in newValoration:', err);
		return res.render('error', { error: 'Ocurrió un error guardando la valoración.' });
	}
	
	return res.redirect(`/post/album/${albumId}/${imageId}`);
}

