import { Publicacion } from "../models/Publicacion.js";
import { Imagen } from "../models/Imagen.js";
import { Usuario } from "../models/Usuario.js";
import { buildProfileWall, buildWallById, buildFavouritesWall } from "./wall.js";

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

export async function showProfile(req, res) {
	const profile_user_id = req.params.user_id
	const contenido = await buildProfileWall({user_id: profile_user_id});
	let siguiendo = false;
	const profileUser = await Usuario.findByPk(Number(profile_user_id));
	const [followers_count, followed_count] = await Promise.all([
		profileUser.countFollower(),
		profileUser.countFollowed()
	]);

	if (req.user) {
		siguiendo = await follows(req.user.id, profile_user_id);
	}

	res.render('userprofile', {
		profile_user: contenido.profile_user,
		follows: siguiendo,
		wall_posts: contenido.wall_posts,
		followers_count,
		followed_count
	})
}

export async function showFavourites(req, res) {
	const user_id = req.params.user_id;

	const fav_posts = await buildFavouritesWall({user_id: user_id});
	const profileUser = await Usuario.findByPk(Number(user_id), {
		attributes: ["id", "nombre"]
	});

	if (!profileUser) {
		return res.status(404).render('fourohfour');
	}

	res.render('favorites', {
		profile_user: profileUser,
		fav_posts
	})
}

export async function addFavourite(req, res) {
	const user_id = Number(req.user.id);
	const image_id = Number(req.params.image_id);
	const album_id = Number(req.params.album_id);

	const user = await Usuario.findByPk(user_id);
	const image = await Imagen.findByPk(image_id);

	if (!user || !image) {
		return res.status(404).send('No encontrado');
	}

	if (!(await user.hasImagen(image))) {
		await user.addImagen(image);
	}

	return res.redirect(`/post/album/${album_id}/${image_id}`);
}

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

	await currentUser.addFollowed(profileUser);
	return res.redirect(`/users/${profile_user_id}`);
}

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

	res.render('followed', {wall_posts: post_list});
}
