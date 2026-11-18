import { Publicacion } from "../models/Publicacion.js";
import { Imagen } from "../models/Imagen.js";
import { Usuario } from "../models/Usuario.js";
import { Tag } from "../models/Tag.js";
import { Comentario } from "../models/Comentario.js";
import { ReporteComentario } from "../models/ReporteComentario.js";
import { ReporteImagen } from "../models/ReporteImagen.js";
import { follows } from "./user.js";
import { getAvgValoration, getUserValoration } from "./valoracion.js";
import sequelize from "../models/config.js";
import multer from 'multer';
import sharp from 'sharp';

export const storage = multer.memoryStorage(); // MemoryStorage for serverless. 
export const upload = multer({ 
	storage: storage, 
	limits: {
		files: 6,
		fileSize: 1*1000*1000 // 1MB, in bytes.
	}
});

export const tagRegex = /#\w+/gmi;

async function hasReportedImage(publicationId) {
	const reportCount = await ReporteImagen.count({
		include: [{
			model: Imagen,
			attributes: [],
			where: { publicacion_id: publicationId },
			required: true
		}]
	});
	return reportCount > 0;
}

function rejectReportedPublication(res) {
	return res.status(403).render('error', {
		error: "No puedes modificar una publicación que contiene imágenes denunciadas."
	});
}

export async function retrieveImage(model_image) {
	const imgMetadata = model_image.metadata;
	const imgB64 = model_image.blob.toString('base64');
	return `${imgMetadata}${imgB64}`;
} 

export async function showAlbum(req,res) {
	// Get the post id, check if it's a number.
	const pid = parseInt(req.params.album_id, 10);
	const imgId = parseInt(req.params.image_id, 10);
	const auth = req.user ? true : false;
	
	if (!pid) {
		res.status(404).render('fourohfour');
		return;
	}
	
	const pub = await Publicacion.findByPk(pid);
	if (!pub) {
		return res.status(404).render('fourohfour');
	}

	let images = await Imagen.findAll({
		where: {
			publicacion_id: pid,
			// Do not return copyrighted image data to logged-out users.
			...(req.user ? {} : { copyright: false })
		}
	});

	let user = await Usuario.findByPk(Number(pub.usuario_id), { attributes: ["id", "nombre"]});
	if (images.length === 0) {
		return res.status(404).render('fourohfour');
	}
	const canViewReportCounts = Boolean(req.user && (
		Number(req.user.id) === Number(user.id) || req.user.moderador
	));
	const canEditPublication = Number(req.user?.id) === Number(user.id)
		&& !(await hasReportedImage(pid));

	let img_array = [];
	for (let image of images) {
		// Retrieve comments for the image.
		let comments = await Comentario.findAll({
			where: { parent_id: Number(image.id) },
			include: [{ model: Usuario, attributes: ["id", "nombre"] }],
			order: [["createdAt", "ASC"]]
		});

		let reportCounts = new Map();
		if (canViewReportCounts && comments.length > 0) {
			const counts = await ReporteComentario.findAll({
				attributes: ['comentario_id', [sequelize.fn('COUNT', sequelize.col('comentario_id')), 'cantidad']],
				where: { comentario_id: comments.map((comment) => comment.id) },
				group: ['comentario_id']
			});
			reportCounts = new Map(counts.map((report) => [
				Number(report.comentario_id),
				Number(report.get('cantidad'))
			]));
		}

		// Shape the comments to send to pug
		let shapedComments = comments.map((comment) => ({
			id: comment.id,
			content: comment.contenido,
			user: comment.Usuario ? {id: comment.Usuario.id, name: comment.Usuario.nombre} : null,
			canReport: Boolean(req.user && Number(req.user.id) !== Number(comment.usuario_id)),
			date: comment.createdAt,
			...(canViewReportCounts ? { reportCount: reportCounts.get(Number(comment.id)) || 0 } : {})
		}));

		// Get all tags.
		let tags = await image.getTags();
		let shapedTags = tags.map((tag) => ({
			id: tag.id,
			name: tag.nombre
		}));

		// Get avg rating
		let rating = await getAvgValoration(image.id);
		rating = Number(rating).toFixed(2);
		const userRating = req.user
			? await getUserValoration(req.user.id, image.id)
			: null;

		// Get favorite boolean
		let favoritos = false;
		if (user) {
			favoritos = await user.hasFavoriteImage(image)
		}

		let img_info = {
			id: image.id,
			data: await retrieveImage(image),
			canReport: Boolean(req.user && Number(req.user.id) !== Number(image.usuario_id)),
			description: image.description,
			comments_enabled: image.comments_enabled,
			comments: shapedComments,
			tags: shapedTags,
			rating: rating,
			userRating: userRating,
			favoritos: favoritos
		}

		if (imgId != image.id) {
			img_array.push(img_info);
		} else {
			img_array.splice(0, 0, img_info);
		}
	}

	let seguimos = false;
	if (req.user) {
		seguimos = await follows(req.user.id, user.id);
	}

	res.render('post', {
		title: pub.titulo,
		album_id: pid,
		uploader: user,
		follows: seguimos,
		img_list: img_array,
		auth: auth,
		canRate: Boolean(req.user && Number(req.user.id) !== Number(user.id)),
		canEditPublication,
		canViewReportCounts
	});
}

export async function showNewPost(req,res) {
	res.render('newpost');
}

export async function editPost(req,res) {
	// Only logged-in users can reach the edit view.
	if (!req.user) {
		return res.redirect('/auth/login');
	}

	const pid = parseInt(req.params.album_id, 10);
	const pub = await Publicacion.findByPk(pid);

	if (!pub) {
		return res.status(404).render('fourohfour');
	}

	// Make sure the current user is the one who made the publication.
	if (Number(pub.usuario_id) !== Number(req.user.id)) {
		return res.status(403).render('error', { error: "No tienes permiso para editar esta publicación." });
	}
	if (await hasReportedImage(pid)) {
		return rejectReportedPublication(res);
	}

	const images = await Imagen.findAll({
		where: { publicacion_id: pid }
	});

	const imageData = await Promise.all(images.map(async (image) => ({
		id: image.id,
		data: await retrieveImage(image),
		description: image.description,
		comments_enabled: image.comments_enabled,
		tags: (await image.getTags()).map((tag) => tag.nombre).join(" ")
	})));

	res.render('editpost', { title: pub.titulo, publication_id: pub.id, images: imageData });
}

export async function updatePost(req, res) {
	if (!req.user) {
		return res.redirect('/auth/login');
	}

	const pid = parseInt(req.params.album_id, 10);
	if (!pid) {
		return res.status(404).render('fourohfour');
	}

	const pub = await Publicacion.findByPk(pid);
	if (!pub) {
		return res.status(404).render('fourohfour');
	}

	if (Number(pub.usuario_id) !== Number(req.user.id)) {
		return res.status(403).render('error', { error: "No tienes permiso para editar esta publicación." });
	}
	if (await hasReportedImage(pid)) {
		return rejectReportedPublication(res);
	}

	if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
		return res.status(400).render('error', { error: "El título de la publicación es obligatorio." });
	}

	const images = await Imagen.findAll({ where: { publicacion_id: pid } });
	await sequelize.transaction(async (transaction) => {
		await pub.update({ titulo: req.body.title.trim() }, { transaction });

		for (const image of images) {
			const id = image.id;
			const tagNames = [...new Set((req.body[`tags-${id}`] || "").match(tagRegex) || [])]
				.map((tag) => tag.toUpperCase());
			const tags = await Promise.all(tagNames.map(async (nombre) => {
				const [tag] = await Tag.findOrCreate({
					where: { nombre },
					defaults: { nombre },
					transaction
				});
				return tag;
			}));

			await image.update({
				description: req.body[`description-${id}`] || "",
				comments_enabled: req.body[`comments-enabled-${id}`] === "on"
			}, { transaction });
			await image.setTags(tags, { transaction });
		}
	});

	res.redirect(`/post/album/${pid}`);
}

export async function removeImage(req, res) {
	const pid = parseInt(req.params.album_id, 10);
	const imageId = parseInt(req.body.image_id, 10);
	if (!Number.isInteger(pid) || pid < 1 || !Number.isInteger(imageId) || imageId < 1) {
		return res.status(404).render('fourohfour');
	}

	const pub = await Publicacion.findByPk(pid);

	if (!pub) {
		return res.status(404).render('fourohfour');
	}
	if (Number(pub.usuario_id) !== Number(req.user.id)) {
		return res.status(403).render('error', { error: "No tienes permiso para editar esta publicación." });
	}
	if (await hasReportedImage(pid)) {
		return rejectReportedPublication(res);
	}

	const image = await Imagen.findOne({ where: { id: imageId, publicacion_id: pid } });
	if (!image) {
		return res.status(404).render('fourohfour');
	}

	await image.destroy();
	return res.redirect(`/post/edit/${pid}`);
}

export async function removeAlbum(req, res) {
	const pid = parseInt(req.params.album_id, 10);
	if (!Number.isInteger(pid) || pid < 1) {
		return res.status(404).render('fourohfour');
	}

	const pub = await Publicacion.findByPk(pid);

	if (!pub) {
		return res.status(404).render('fourohfour');
	}
	if (Number(pub.usuario_id) !== Number(req.user.id)) {
		return res.status(403).render('error', { error: "No tienes permiso para editar esta publicación." });
	}
	if (await hasReportedImage(pid)) {
		return rejectReportedPublication(res);
	}
	if (typeof req.body.confirmation !== 'string' || req.body.confirmation.trim() !== pub.titulo) {
		return res.status(400).render('error', { error: "El nombre del álbum no coincide." });
	}

	await sequelize.transaction(async (transaction) => {
		await Imagen.destroy({
			where: { publicacion_id: pid },
			transaction
		});
		await pub.destroy({ transaction });
	});
	return res.redirect('/');
}

/* Necesitamos esto para no romper el xml usado para configurar el sharp */
function escapeXml(text) {
	return text.replace(/[&<>"']/g, (character) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&apos;'
	})[character]);
}

async function addWatermark(buffer, text) {
	const image = sharp(buffer);
	const { width, height } = await image.metadata();
	const fontSize = Math.max(1, Math.min(48, Math.round(Math.min(width, height) * 0.06))); //Para escalar el texto con la imagen; Minimo 1.
	const margin = fontSize;
	const textWidth = Math.max(1, width - margin * 2);
	const watermark = Buffer.from(`
		<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
			<text x="50%" y="50%" text-anchor="middle"
				font-family="sans-serif" font-size="${fontSize}" font-weight="bold"
				fill="white" stroke="black" stroke-width="${Math.max(1, fontSize * 0.08)}"
				paint-order="stroke" textLength="${textWidth}" lengthAdjust="spacingAndGlyphs" 
				style="opacity: 0.5;">${escapeXml(text)}</text>
		</svg>
	`);

	return image.composite([{ input: watermark }]).png().toBuffer();
}

export async function newPost(req,res) {
	// Get user
	const user = await Usuario.findByPk(Number(req.user.id));
	if (!user) {
		return res.redirect("/auth/login");
	}

	if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
		return res.status(400).render('error', { error: "El título de la publicación es obligatorio." });
	}

	let image_array = []
	for (let [index, file] of req.files.entries()) {
		//Check if mimetype matches images, not a real test but it'll have to do.
		if (!file.mimetype.startsWith("image/")) {
			return res.render('error', {error: "No reconocemos una de sus imagenes."});
		}

		let metadata = `data:${file.mimetype};base64,`;
		const copyright = req.body[`copyright-${index}`] === 'on'; // it can be 'on' or Undefined; turn to boolean.
		let watermarkText = req.body[`mda-${index}`];
		watermarkText = watermarkText === '' ? user.nombre : watermarkText;

		let buffer = file.buffer;
		if (copyright && typeof watermarkText === 'string' && watermarkText.trim()) {
			try {
				buffer = await addWatermark(file.buffer, watermarkText.trim());
				metadata = 'data:image/png;base64,';
			} catch (error) {
				console.error('Error adding watermark to uploaded image:', error);
				return res.render('error', {error: "No se pudo procesar una de las imágenes."});
			}
		}
		image_array.push({metadata: metadata, buffer: buffer, copyright: copyright});
	}
	
	if (image_array.length === 0) {
		return res.render('error', {error: "No se subieron imágenes"});
	}

	// save album info
	const publicacion = await Publicacion.create({
		usuario_id: Number(user.id),
		titulo: req.body.title.trim()
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
			copyright: img.copyright,
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