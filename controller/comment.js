import { Imagen } from "../models/Imagen.js";
import { Comentario } from "../models/Comentario.js";

export async function createComment(req, res) {
    const albumId = Number(req.params.album_id);
    const imageId = Number(req.params.image_id);
	
    if (!req.user) {
		return res.redirect('/auth/login');
    }

    const contenido = (req.body.contenido || '').trim();
    if (contenido.length < 1 || contenido.length > 500) {
        return res.redirect(`/post/album/${albumId}/${imageId}`);
    }

    const image = await Imagen.findByPk(imageId);
    if (!image) {
        return res.render('error', { error: `No se encontró la imagen con id: ${imageId} :(` });
    }

    try {
        await Comentario.create({
            parent_id: Number(imageId),
            usuario_id: Number(req.user.id),
            contenido: contenido
        });
    } catch (err) {
        return res.render('error', { error: 'Ocurrió un error guardando el comentario.' });
    }

    return res.redirect(`/post/album/${albumId}/${imageId}`);
}

export default createComment;
