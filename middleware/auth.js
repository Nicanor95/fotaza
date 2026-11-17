import { Usuario } from "../models/Usuario.js";
import { Moderador } from "../models/Moderador.js";

export async function authMiddleware(req, res, next) {
	const user = req.session.user;

	if(!user) {
		return res.redirect('/auth/login');
	}

	const dbUser = await processUser(user);

	if(!dbUser) {
		req.session.user = null;
		return res.redirect('/auth/login');
	}

	// We have the user info, processUser(user) gives
	// id, nombre, moderador
	req.user = dbUser;
	res.locals.user = dbUser;
	next();
}

export async function moderatorMiddleware(req, res, next) {
	if (!req.user?.moderador) {
		return res.status(403).json({ error: 'Acceso reservado para moderadores.' });
	}

	// Si tiene el valor, chequeamos igualmente
	const moderador = await Moderador.findByPk(req.user.id);
	if (!moderador) {
		return res.status(403).json({ error: 'Acceso reservado para moderadores.' });
	}

	next();
}

export async function userMiddleware(req,res,next) {
	const user = req.session.user;

	if(!user) {
		return next();
	}
	
	const dbUser = await processUser(user);

	if(!dbUser) {
		req.session.user = null;
		return next();
	}

	// We have the user info, processUser(user) gives
	// id, nombre, moderador
	req.user = dbUser;
	res.locals.user = dbUser; 
	next();
}

async function processUser(user) {
	const userId = Number(user.id);
	const dbUser = await Usuario.findByPk(userId, {
		attributes: ["id", "nombre", "banned"]
	});

	if(!dbUser || dbUser.banned) {
		return null;
	}

	dbUser.moderador = Boolean(await Moderador.findByPk(userId));
	console.log(dbUser.toJSON());
	return dbUser;
}