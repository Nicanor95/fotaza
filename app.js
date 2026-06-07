import 'dotenv/config';
import express from 'express';
import pug from 'pug';
import sequelize from './models/config.js';
import './models/models.js';
import { Publicacion } from './models/Publicacion.js';
import { Imagen } from './models/Imagen.js';


// Server options
const app = express();
const PORT = process.env.PORT;

// Set up view engine.
app.set('view engine', 'pug');
app.set('views', './views');

// Serve statics
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded( { extended: true }));

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

app.post('/upload', (req,res, next) => {
	console.log(req);
	next();
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