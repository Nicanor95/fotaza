import { Chat } from "../models/Chat.js";
import { Imagen } from "../models/Imagen.js";
import { Mensaje } from "../models/Mensaje.js";
import { Notificacion } from "../models/Notificacion.js";
import { Usuario } from "../models/Usuario.js";

// Builds a base64 data URL for an image stored in the database.
function getImageData(image) {
	return `${image.metadata}${image.blob.toString("base64")}`;
}

// Finds a chat only when it exists and includes the requested user.
async function findChatForUser(chatId, userId) {
	if (!Number.isSafeInteger(chatId) || chatId <= 0) {
		return null;
	}

	const chat = await Chat.findByPk(chatId, {
		include: [
			{ model: Usuario, attributes: ["id", "nombre"] },
			{ model: Imagen }
		]
	});

	if (!chat || !chat.Usuarios.some((participant) => Number(participant.id) === Number(userId))) {
		return null;
	}

	return chat;
}

// Opens or creates the chat associated with a user's interest in an image.
export async function meInteresa(req, res) {
	const imageId = Number(req.params.image_id);
	if (!Number.isSafeInteger(imageId) || imageId <= 0) {
		return res.status(404).render("fourohfour");
	}

	const image = await Imagen.findByPk(imageId);
	if (!image) {
		return res.status(404).render("fourohfour");
	}

	const ownerId = Number(image.usuario_id);
	const currentUserId = Number(req.user.id);
	if (ownerId === currentUserId) {
		return res.status(400).render("error", { error: "No puedes iniciar un chat contigo mismo." });
	}

	const possibleChats = await Chat.findAll({
		where: { imagen_id: image.id },
		include: [{ model: Usuario, attributes: ["id", "nombre"] }]
	});

	let chat = possibleChats.find((candidate) => {
		const participantIds = candidate.Usuarios.map((participant) => Number(participant.id)).sort();
		const expectedIds = [ownerId, currentUserId].sort();
		return participantIds.length === 2 && participantIds.every((id, index) => id === expectedIds[index]);
	});

	if (!chat) {
		chat = await Chat.create({ imagen_id: image.id });
		await chat.addUsuarios([ownerId, currentUserId]);
	}

	await Notificacion.create({
		usuario_id: ownerId,
		contenido: `A ${req.user.nombre} le interesa la imagen #${image.id}.`,
		link: `/chat/${chat.id}`,
		visto: false
	});

	return res.redirect(`/chat/${chat.id}`);
}

// Displays a chat and its message history to an authorized participant.
export async function showChat(req, res) {
	const chat = await findChatForUser(Number(req.params.chat_id), req.user.id);
	if (!chat) {
		return res.status(404).render("fourohfour");
	}

	const messages = await Mensaje.findAll({
		where: { chat_id: chat.id },
		include: [{ model: Usuario, attributes: ["id", "nombre"] }],
		order: [["createdAt", "ASC"]]
	});
	const otherParticipant = chat.Usuarios.find((participant) => Number(participant.id) !== Number(req.user.id));

	return res.render("chat", {
		chat,
		imageData: getImageData(chat.Imagen),
		messages,
		otherParticipant
	});
}

// Sends a validated message to an authorized chat.
export async function sendMessage(req, res) {
	const chat = await findChatForUser(Number(req.params.chat_id), req.user.id);
	if (!chat) {
		return res.status(404).render("fourohfour");
	}

	const content = typeof req.body.contenido === "string" ? req.body.contenido.trim() : "";
	if (!content || content.length > 255) {
		return res.status(400).render("error", { error: "El mensaje debe tener entre 1 y 255 caracteres." });
	}

	await Mensaje.create({
		chat_id: chat.id,
		usuario_id: req.user.id,
		contenido: content
	});

	return res.redirect(`/chat/${chat.id}`);
}

// Lists the authenticated user's chats.
export async function showChats(req, res) {
	const chats = await req.user.getChats({
		include: [
			{ model: Usuario, attributes: ["id", "nombre"] },
			{ model: Imagen }
		],
		order: [["createdAt", "DESC"]]
	});
	const chatList = chats.map((chat) => ({
		id: chat.id,
		otherParticipant: chat.Usuarios.find((participant) => Number(participant.id) !== Number(req.user.id)),
		imageData: getImageData(chat.Imagen),
		imageDescription: chat.Imagen.description
	}));

	return res.render("chats", { chats: chatList });
}