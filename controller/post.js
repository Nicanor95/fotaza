import { Publicacion } from "../models/Publicacion.js";
import { Imagen } from "../models/Imagen.js";
import { Usuario } from "../models/Usuario.js";
import { Tag } from "../models/Tag.js";
import multer from 'multer';

export const storage = multer.memoryStorage(); // MemoryStorage for serverless. 
export const upload = multer({ 
	storage: storage, 
	limits: {
		files: 6,
		fileSize: 1*1000*1000 // 1MB, in bytes.
	}
});

const tagRegex = /#\w+/gmi;

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
	// Get user
	const user = await Usuario.findByPk(Number(req.user.id));
	if (!user) {
		return res.redirect("/auth/login");
	}

	let image_array = []
	for (let file of req.files) {
		//Check if mimetype matches images, not a real test but it'll have to do.
		if (!file.mimetype.startsWith("image/")) {
			return res.render('error', {error: "No reconocemos una de sus imagenes."});
		}

		let metadata = `data:${file.mimetype};base64,`;
		image_array.push({metadata: metadata, buffer: file.buffer});
	}
	
	if (!image_array) {
		return res.render('error', {error: "No se subieron imágenes"});
	}

	// save album info
	const publicacion = await Publicacion.create({
		usuario_id: Number(user.id),
		titulo: req.body.title
	});

	if (!publicacion) {
		return res.render('error', {error: 'Ocurrio un error creando la publicación, intente nuevamente mas tarde.'});
	}

	// save images linked to album
	for (let [index, img] of image_array.entries()) {
		let description = req.body[`description-${index}`]; // Get description
		let tags = req.body[`tags-${index}`]; // Get tags text.
		let image = await Imagen.create( { // Save image to bd.
			publicacion_id: Number(publicacion.id),
			usuario_id: Number(user.id),
			description: description,
			metadata: img.metadata,
			blob: img.buffer
		});

		// If it all went well, we create and add the tags.
		let tag_matches = tags.matchAll(tagRegex); // This returns an iterator.
		for (let tagname of tag_matches) {
			tagname = tagname.toString().toUpperCase(); // This way it'll be case-insensitive.
			let [tag, _] = await Tag.findOrCreate({
				where: { nombre: tagname },
				default: { nombre: tagname }
			});
			await image.addTag(tag);
		}
	}

	res.redirect('/');
}