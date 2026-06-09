import { Usuario } from "../models/Usuario.js";


// Regex for validation.
const regNombre = /^[a-zA-Zñ]{3,}(?: [a-zA-Z]+)*$/;
const regMail = /^[a-zA-Z0-9](?:[\.-\w])*@\w+(?:-\w+)?(?:\.\w+(?:-\w+)?)+$/;

export async function showLogin(req, res) {
	res.render('login', {title:'FOTAZA | Login'});
}

export async function showSignup(req, res) {
	res.render('signup');
}

export async function login(req, res) {
	const mail = req.body.email
	const password = req.body.password

	// Get user by mail (unique)
	try {
		const user = await Usuario.findOne({
			where: {
				email: mail
			}
		});

		if (!user) { // No se encuentra usuario
			return res.render('error', {error: "Datos incorrectos."});
		}	
	
		if (await user.verifyPassword(password)) {
			req.session.user = {
				id: user.id
			}
			return res.redirect('/');
		} else {
			return res.render('error', {error: "Datos incorrectos."});
		}
	} catch (error) {
		return res.render('error', {error: "Datos incorrectos."});
	}
}

export async function signup(req, res) {
	//Manejar el registro
	const nombre = req.body.nombre;
	const email = req.body.email;
	const password = req.body.password;
	const password_conf = req.body.password_confirm;

	// Validate
	if ( [nombre,email,password,password_conf].some( (e) => { return (e === undefined); }) ||
		!(password === password_conf) || 
		(password.length < 6) ||
		!(regMail.test(email)) || 
		!(regNombre.test(nombre))) {
		return res.render('error');
	}

	try {
		const newUser = await Usuario.create({ 
			nombre: nombre,
			email: email,
			phash: password //Hashes on hook
		});
	} catch (err) {
		console.log(err);
		return res.render('error', {error: "El usuario ya existe."});
	}
	return res.redirect('/');
}

export async function logout(req, res) {
	req.user = null;
	res.locals.user = null;
	req.session.user = null;
	return res.redirect("/");
}