import { Publicacion } from "../models/Publicacion.js";

export async function showAlbum(req,res) {
	// Get the post id, check if it's a number.
	const pid = parseInt(req.params.album_id, 10);
	if (!pid) {
		res.status(404).render('fourohfour');
		return;
	}
	
	// Make the two requests to the db
	let pub = Publicacion.findByPk(pid);
	let images = Imagen.findAll({
		where: {
			publicacion_id: pid
		}
	});

	// Wait for  the results
	pub = await pub;
	images = await images;
	if (pub === null || images === []) {
		res.status(404).render('fourohfour');
	} else {
		res.render('post', {p:pub, img:images});
	}
}

export async function showNewPost(req,res) {
	res.render('newpost');
}

export async function newPost(req,res) {
	// TODO: this should add the new post to the database.
	res.json(req.body);
}