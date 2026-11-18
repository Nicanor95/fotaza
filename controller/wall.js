import { Tag } from "../models/Tag.js";
import { Imagen } from "../models/Imagen.js";
import { Publicacion } from "../models/Publicacion.js";
import { Op, fn, col, where } from "sequelize";
import { Usuario } from "../models/Usuario.js";
import { Valoracion } from "../models/Valoracion.js";
import { sortPostsByRating } from "../utils/wall-priority.js";

// Builds and prioritizes the posts.
export async function buildWall(terms) {
	const posts = await getWallPosts(terms);
	return prioritizeWallPosts(posts);
}

// Retrieves wall images with optional tag filtering.
async function getWallPosts(terms) {
	const tags = terms.tags;
	// Copyrighted images are only visible to signed-in users.
	const imageVisibility = terms.isLoggedIn ? {} : { copyright: false };

	// Build object for the get all posts request.
	const getAll = {
		where: imageVisibility,
		include: [
			{
				model: Publicacion,
				attributes: ['titulo'],
				required: true
			}
		]
	};

	// Build object for the get all posts according to tags request.
	const getAccordingToTags = {
		where: imageVisibility,
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
				attributes: ['titulo'],
				required: true
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

	return shapeWallPosts(images);
}

// Applies rating-based ordering to wall posts.
async function prioritizeWallPosts(posts) {
	if (posts.length < 2) {
		return posts;
	}

	// Fetch both metrics in one query instead of querying ratings separately for each image.
	const ratings = await Valoracion.findAll({
		attributes: [
			'img_id',
			[fn('COUNT', col('img_id')), 'rating_count'],
			[fn('AVG', col('valor')), 'average_rating']
		],
		where: {
			img_id: {
				[Op.in]: posts.map((post) => post.id)
			}
		},
		group: ['img_id'],
		raw: true
	});

	return sortPostsByRating(posts, ratings);
}

// Converts database image records into wall display objects.
function shapeWallPosts(images) {
	return images.map((image) => ({
		id: image.id,
		publicacion_id: image.publicacion_id,
		titulo: image.Publicacion.titulo,
		img_b64: `${image.metadata}${image.blob.toString('base64')}`
	}));
}

// Builds posts matching search tags or publication titles.
export async function buildSearchWall(terms) {
	const tags = terms.tags;
	const title = terms.title.trim();
	const isLoggedIn = terms.isLoggedIn;
	const hasTags = Array.isArray(tags) && tags.length > 0;

	// Keep the existing requirement that an image matches every parsed tag.
	const tagPosts = hasTags
		? await getWallPosts({ tags, isLoggedIn })
		: [];

	if (!title) {
		return hasTags ? prioritizeWallPosts(tagPosts) : buildWall({ tags: [], isLoggedIn });
	}

	const imageVisibility = isLoggedIn ? {} : { copyright: false };
	const titleImages = await Imagen.findAll({
		where: imageVisibility,
		include: [
			{
				model: Publicacion,
				attributes: ['titulo'],
				required: true,
				where: {
					titulo: { [Op.iLike]: `%${title}%` }
				}
			}
		]
	});

	// Combine both match sets, keeping images that match both only once.
	const titlePosts = shapeWallPosts(titleImages);
	const posts = [...new Map([...tagPosts, ...titlePosts].map((post) => [post.id, post])).values()];
	return prioritizeWallPosts(posts);
}

// Builds a paged wall for a specific user profile.
export async function buildProfileWall(terms) {
	const user_id = terms.user_id;
	
	const user_bd = await Usuario.findByPk(Number(user_id), {
		attributes: [ "id", "nombre" ]
	});
	
	const images = await Imagen.findAll({
		where: {
			usuario_id: Number(user_id),
			...(terms.isLoggedIn ? {} : { copyright: false })
		},
		include: [
			{
				model: Publicacion,
				attributes: ['titulo'],
				required: true
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

// Builds wall entries from a user's favorited images.
export async function buildFavouritesWall(terms) {
	const user_id = Number(terms.user_id);

	const images = await Imagen.findAll({
		include: [
			{
				model: Usuario,
				as: 'FavoritedBy',
				attributes: [],
				through: { attributes: [] },
				where: { id: user_id }
			},
			{
				model: Publicacion,
				attributes: ['titulo'],
				required: true
			}
		]
	});

	let shapedResults = images.map((image) => ({
		id: image.id,
		publicacion_id: image.publicacion_id,
		titulo: image.Publicacion.titulo,
		img_b64: `${image.metadata}${image.blob.toString('base64')}`
	}));
	return shapedResults;
}

// Builds wall entries for every image uploaded by a user.
export async function buildWallById(userId) {
	const user_id = Number(userId);
	
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
				attributes: ['titulo'],
				required: true
			}
		]
	})

	let shapedResults = images.map((image) => ({
		id: image.id,
		publicacion_id: image.publicacion_id,
		titulo: image.Publicacion.titulo,
		img_b64: `${image.metadata}${image.blob.toString('base64')}`
	}));

	return shapedResults;
}