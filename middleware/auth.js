import { Usuario } from "../models/Usuario.js";

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
		attributes: ["id", "nombre", "moderador"]
	});

	if(!dbUser) {
		return null;
	}

	console.log(dbUser.toJSON());
	return dbUser;
}