import { Publicacion } from "../models/Publicacion.js";
import { Usuario } from "../models/Usuario.js"
import { buildProfileWall } from "./wall.js";

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
	if (req.user) {
		siguiendo = await follows(req.user.id, profile_user_id);
	}
	res.render('userprofile', {profile_user:contenido.profile_user, follows: siguiendo, wall_posts: contenido.wall_posts})
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