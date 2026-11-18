import { Publicacion } from "../models/Publicacion.js";
import { Imagen } from "../models/Imagen.js";
import { Usuario } from "../models/Usuario.js";
import { Notificacion } from "../models/Notificacion.js";
import { Coleccion } from "../models/Coleccion.js";
import { buildProfileWall, buildWallById, buildFavouritesWall } from "./wall.js";
import { paginateItems } from "../utils/pagination.js";

// Checks whether one user follows another.
export async function follows(userId1, userId2) {
	/**
	 * returns true if user1 follows user2
	 */
	const usuario1 = await Usuario.findByPk(Number(userId1));
	const usuario2 = await Usuario.findByPk(Number(userId2));

	if (!usuario1 || !usuario2) return false;

	const isFollowing = await usuario1.hasFollowed(usuario2);
	return isFollowing;
}

// Displays a user's profile and paginated uploaded posts.
export async function showProfile(req, res) {
	const profile_user_id = req.params.user_id
	const contenido = await buildProfileWall({
		user_id: profile_user_id,
		isLoggedIn: Boolean(req.user)
	});
	let siguiendo = false;
	const profileUser = await Usuario.findByPk(Number(profile_user_id));
	const [followers_count, followed_count] = await Promise.all([
		profileUser.countFollower(),
		profileUser.countFollowed()
	]);

	if (req.user) {
		siguiendo = await follows(req.user.id, profile_user_id);
	}

	let colecciones = [];
	if (req.user && Number(req.user.id) === Number(profile_user_id)) {
		colecciones = await Coleccion.findAll({
			where: { usuario_id: profile_user_id }
		});
	}

	const pagination = paginateItems(contenido.wall_posts, req.query.page);
	res.render('userprofile', {
		profile_user: contenido.profile_user,
		follows: siguiendo,
		wall_posts: pagination.items,
		pagination: {
			...pagination,
			baseUrl: `/users/${profile_user_id}`
		},
		colecciones,
		followers_count,
		followed_count
	})
}

// Displays a user's favorites and profile statistics.
export async function showFavourites(req, res) {
	const user_id = req.params.user_id;

	const fav_posts = await buildFavouritesWall({user_id: user_id});
	const profileUser = await Usuario.findByPk(Number(user_id), {
		attributes: ["id", "nombre"]
	});

	if (!profileUser) {
		return res.status(404).render('fourohfour');
	}

	const [followers_count, followed_count, isFollowing] = await Promise.all([
		profileUser.countFollower(),
		profileUser.countFollowed(),
		follows(req.user.id, user_id)
	]);

	const pagination = paginateItems(fav_posts, req.query.page);
	res.render('favorites', {
		profile_user: profileUser,
		follows: isFollowing,
		followers_count,
		followed_count,
		fav_posts: pagination.items,
		pagination: {
			...pagination,
			baseUrl: `/users/${user_id}/favoritos`
		}
	})
}

// Adds an image to the authenticated user's favorites.
export async function addFavourite(req, res) {
	const user_id = Number(req.user.id);
	const image_id = Number(req.params.image_id);
	const album_id = Number(req.params.album_id);

	const user = await Usuario.findByPk(user_id);
	const image = await Imagen.findByPk(image_id);

	if (!user || !image) {
		return res.status(404).send('No encontrado');
	}

	if (!(await user.hasFavoriteImage(image))) {
		await user.addFavoriteImage(image);
	}

	return res.redirect(`/post/album/${album_id}/${image_id}`);
}

// Removes an image from the authenticated user's favorites.
export async function removeFavourite(req, res) {
	const user_id = Number(req.user.id);
	const image_id = Number(req.params.image_id);
	const album_id = Number(req.params.album_id);

	const user = await Usuario.findByPk(user_id);
	const image = await Imagen.findByPk(image_id);

	if (!user || !image) {
		return res.status(404).send('No encontrado');
	}

	if (await user.hasFavoriteImage(image)) {
		await user.removeFavoriteImage(image);
	}

	return res.redirect(`/post/album/${album_id}/${image_id}`);
}

// Displays the form for adding an image to a collection.
export async function showAddToCollectionForm(req, res) {
	const user_id = req.user.id;
	const image_id = Number(req.params.image_id);
	const album_id = req.query.album_id;

	const colecciones = await Coleccion.findAll({
		where: { usuario_id: user_id }
	});

	res.render('add_to_collection', {
		colecciones,
		image_id,
		album_id
	});
}

// Adds an image to an owned collection.
export async function addToCollection(req, res) {
	const user_id = req.user.id;
	const col_id = Number(req.params.col_id);
	const image_id = Number(req.params.image_id);
	const album_id = req.query.album_id;

	const coleccion = await Coleccion.findByPk(col_id);
	const image = await Imagen.findByPk(image_id);

	if (!coleccion || !image || Number(coleccion.usuario_id) !== Number(user_id)) {
		return res.status(404).send('No encontrado');
	}

	if (!(await coleccion.hasImagen(image))) {
		await coleccion.addImagen(image);
	}

	return res.redirect(`/post/album/${album_id}/${image_id}`);
}

// Creates a collection and adds the selected image to it.
export async function createCollection(req, res) {
	const user_id = req.user.id;
	const image_id = Number(req.body.image_id);
	const album_id = req.body.album_id;
	const { title } = req.body;

	const image = await Imagen.findByPk(image_id);
	if (!image) {
		return res.status(404).send('No encontrado');
	}

	const coleccion = await Coleccion.create({
		usuario_id: user_id,
		title
	});

	await coleccion.addImagen(image);

	return res.redirect(`/post/album/${album_id}/${image_id}`);
}

// Lists the authenticated user's collections with thumbnails.
export async function showCollections(req, res) {
	const user_id = req.params.user_id;

	if (!req.user || Number(req.user.id) !== Number(user_id)) {
		return res.redirect(`/users/${user_id}`);
	}

	const profileUser = await Usuario.findByPk(user_id);
	if (!profileUser) {
		return res.status(404).render('fourohfour');
	}

	const [followers_count, followed_count] = await Promise.all([
		profileUser.countFollower(),
		profileUser.countFollowed()
	]);
	const colecciones = await Coleccion.findAll({
		where: { usuario_id: user_id }
	});

	const imageCollectionAssociation = Coleccion.associations.Imagens;
	const collectionsWithThumbnails = await Promise.all(colecciones.map(async (collection) => {
		const [image] = await collection.getImagens({
			attributes: ["metadata", "blob"],
			order: [[imageCollectionAssociation.oneFromTarget, "createdAt", "ASC"]],
			limit: 1
		});

		return {
			...collection.toJSON(),
			thumbnail: image ? `${image.metadata}${image.blob.toString("base64")}` : null
		};
	}));

	res.render('collections', {
		profile_user: profileUser,
		follows: false,
		followers_count,
		followed_count,
		colecciones: collectionsWithThumbnails
	});
}

// Displays one collection owned by the authenticated user.
export async function showCollection(req, res) {
	const user_id = req.params.user_id;
	const col_id = Number(req.params.col_id);

	if (Number(req.user.id) !== Number(user_id)) {
		return res.redirect(`/users/${user_id}`);
	}

	const coleccion = await Coleccion.findByPk(col_id);
	if (!coleccion || Number(coleccion.usuario_id) !== Number(user_id)) {
		return res.status(404).render('fourohfour');
	}

	const user = await Usuario.findByPk(coleccion.usuario_id, {
		attributes: ["id", "nombre"]
	});

	const images = await coleccion.getImagens({
		include: [{ model: Publicacion, attributes: ["titulo"] }]
	});

	const shapedImages = images.map((image) => ({
		id: image.id,
		publicacion_id: image.publicacion_id,
		titulo: image.Publicacion?.titulo || "Sin título",
		img_b64: `${image.metadata}${image.blob.toString("base64")}`
	}));

	const pagination = paginateItems(shapedImages, req.query.page);
	res.render("collection", {
		profile_user: user,
		collection: coleccion,
		images: pagination.items,
		pagination: {
			...pagination,
			baseUrl: `/users/${user_id}/colecciones/${col_id}`
		}
	});
}

// Follows another user and creates a notification.
export async function followUser(req, res) {
	const profile_user_id = Number(req.params.user_id);
	const currentUserId = Number(req.user.id);

	if (profile_user_id === currentUserId) {
		return res.redirect(`/users/${profile_user_id}`);
	}

	const currentUser = await Usuario.findByPk(currentUserId);
	const profileUser = await Usuario.findByPk(profile_user_id);

	if (!currentUser || !profileUser) {
		return res.status(404).send('Usuario no encontrado');
	}

	if (!(await currentUser.hasFollowed(profileUser))) {
		await currentUser.addFollowed(profileUser);
		await Notificacion.create({
			usuario_id: profileUser.id,
			contenido: `${currentUser.nombre} empezó a seguirte.`,
			link: `/users/${currentUser.id}`,
			visto: false
		});
	}
	return res.redirect(`/users/${profile_user_id}`);
}

// Removes the authenticated user's follow of another user.
export async function unfollowUser(req, res) {
	const profile_user_id = Number(req.params.user_id);
	const currentUserId = Number(req.user.id);

	if (profile_user_id === currentUserId) {
		return res.redirect(`/users/${profile_user_id}`);
	}

	const currentUser = await Usuario.findByPk(currentUserId);
	const profileUser = await Usuario.findByPk(profile_user_id);

	if (!currentUser || !profileUser) {
		return res.status(404).send('Usuario no encontrado');
	}

	await currentUser.removeFollowed(profileUser);
	return res.redirect(`/users/${profile_user_id}`);
}

// Displays posts uploaded by users the current user follows.
export async function followedPosts(req, res) {
	// get current user
	const current_user_id = Number(req.user.id);

	const current_user = await Usuario.findByPk(current_user_id)
	if (!current_user) {
		res.redirect("/auth/login");
	}

	// get users followed by current user
	const followed_list = await current_user.getFollowed({
		attributes: ["id"],
	})

	// get images uploaded by followed users
	let post_list = []
	for ( let followed of followed_list ) {
		let lista = await buildWallById(Number(followed.id));
		post_list = post_list.concat(lista);
	}

	const pagination = paginateItems(post_list, req.query.page);
	res.render('followed', {
		wall_posts: pagination.items,
		pagination: { ...pagination, baseUrl: '/users/followed' }
	});
}
