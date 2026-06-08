import 'dotenv/config';
import express, { json } from 'express';
import pug from 'pug';
import { hashPassword, verifyPassword } from './crypt.js';
import sequelize from './models/config.js';
import './models/models.js';
import { Publicacion } from './models/Publicacion.js';
import { Imagen } from './models/Imagen.js';
import { Usuario } from './models/Usuario.js';

// Regex for validation.
const regNombre = /^[a-zA-Zñ]{3,}(?: [a-zA-Z]+)*$/;
const regMail = /^[a-zA-Z0-9](?:[\.-\w])*@\w+(?:-\w+)?(?:\.\w+(?:-\w+)?)+$/;

// Server options
const app = express();
const PORT = process.env.PORT;

// Set up view engine.
app.set('view engine', 'pug');
app.set('views', './views');

// Serve statics
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
	res.render('homepage');
});

app.get('/login', (req, res) => {
	res.render('login', {title:'FOTAZA | Login'});
});

app.get('/post/:post_id', async (req, res) => {
	// Get the post id, check if it's a number.
	const pid = parseInt(req.params.post_id, 10);
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
});

app.get('/search/:searchterms', (req, res) => {
	// TODO: Do the search and get results
	res.render('searchresults', {})
});

app.get('/newpost', (req, res) => {
	res.render('newpost');
});

app.get('/newuser', (req, res) => {
	res.render('newuser');
});

app.post('/upload', (req,res) => {
	//Manejar la subida, investigar sobre multer
	res.json(req.body);
});

app.post('/register', async (req,res) => {
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

	const hash = await hashPassword(password);

	if (!verifyPassword(hash, password_conf)) { 
		// Should be unnecessary, but if something 
		// went wrong hashing, we'll catch it here.
		return res.render('error');
	}
	try {
		const newUser = await Usuario.create({ 
			nombre: nombre,
			email: email,
			phash: hash
		});
	} catch (err) {
		console.log(err);
		return res.render('error', {error: "El usuario ya existe."});
	}
	return res.redirect('/');
})

app.post('/ingreso', async (req,res) => {
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
	
		if (await verifyPassword(user.phash, password)) {
			return res.redirect('/');
		} else {
			return res.render('error', {error: "Datos incorrectos."});
		}
	} catch (error) {
		return res.render('error', {error: "Datos incorrectos."});
	}
});

// 404
app.use((req, res, next) => {
	res.status(404).render('fourohfour');
});

// Test database
try {
	await sequelize.authenticate();
	console.log('Database connection has been established successfully.');
} catch (error) {
	console.error('Unable to connect to the database:', error);
	process.exit(1);
}
// Sync database
await sequelize.sync(/*{ force: true, alter: true }*/);

// Run server
app.listen(PORT, () => {
	console.log(`Fotaza listening on port ${PORT}`);
});