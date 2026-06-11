import { Tag } from "../models/Tag.js";
import { Imagen } from "../models/Imagen.js";
import { Publicacion } from "../models/Publicacion.js";
import { Op, fn, col, where } from "sequelize";
import { Usuario } from "../models/Usuario.js";

export async function buildWall(terms) {
	const tags = terms.tags;

	// Build object for the get all posts request.
	const getAll = {
		include: [
			{
				model: Publicacion,
				attributes: ['titulo']
			}
		]
	};

	// Build object for the get all posts according to tags request.
	const getAccordingToTags = {
		include: [ //Include the tags to the images found
			{
				model: Tag,
				attributes: [],
				through: { attributes: [] },
				where: {
					nombre: {
						[Op.in]: tags // Keep the ones in the array
					}
				}
			},
			{
				model: Publicacion,
				attributes: ['titulo']
			}
		],
		group: ['Imagen.id', 'Publicacion.id'],
		having: where(fn('COUNT', col('Tags.id')), tags.length) 
		/* 
		 * Group by imagen.id and count the amount of tag columns
		 * if the count is the same as the array length,
		 * then it has all of the tags. Keep those.
		 */
	}

	// Select request accordingly
	// Non-array and empty arrays use getAll, and obtain all posts. Otherwise they consider tags with getAccordingToTags.
	const request = (!Array.isArray(tags) || tags.length === 0) ? getAll : getAccordingToTags;

	const images = await Imagen.findAll(request);

	let shapedResults = images.map((image) => ({
		id: image.id,
		publicacion_id: image.publicacion_id,
		titulo: image.Publicacion.titulo,
		img_b64: `${image.metadata}${image.blob.toString('base64')}`
	}));
	return shapedResults;
}

export async function buildProfileWall(terms) {
	const user_id = terms.user_id;
	
	const user_bd = await Usuario.findByPk(Number(user_id), {
		attributes: [ "id", "nombre" ]
	});
	
	const images = await Imagen.findAll({
		where: {
			usuario_id: Number(user_id)
		},
		include: [
			{
				model: Publicacion,
				attributes: ['titulo']
			}
		]
	})


	let shapedUser = {
		id: user_bd.id,
		nombre: user_bd.nombre
	}

	let shapedResults = images.map((image) => ({
		id: image.id,
		publicacion_id: image.publicacion_id,
		titulo: image.Publicacion.titulo,
		img_b64: `${image.metadata}${image.blob.toString('base64')}`
	}));

	return { profile_user: shapedUser, wall_posts: shapedResults };
}