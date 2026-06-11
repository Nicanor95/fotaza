import { Tag } from "../models/Tag.js";
import { Imagen } from "../models/Imagen.js";
import { Publicacion } from "../models/Publicacion.js";
import { Op, fn, col, where } from "sequelize";

export async function buildWall(terms) {
	const tags = terms.tags

	if (!Array.isArray(tags) || tags.length === 0) { // If not array or array empty
		return await Imagen.findAll()
	}

	const images = await Imagen.findAll({
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
			}
		],
		group: ['Imagen.id'],
		having: where(fn('COUNT', col('Tags.id')), tags.length) 
		/* 
		 * Group by imagen.id and count the amount of tag columns
		 * if the count is the same as the array length,
		 * then it has all of the tags. Keep those.
		 */
	})

	return images
}