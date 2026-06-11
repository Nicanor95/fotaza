import 'dotenv/config';
import express, { json } from 'express';
import pug from 'pug';
import sequelize from './models/config.js';
import session from 'express-session';
import ConnectSessionSequelize from "connect-session-sequelize";
import './models/models.js';
import authRouter from './route/auth.js';
import postRouter from './route/post.js';
import { Publicacion } from './models/Publicacion.js';
import { Imagen } from './models/Imagen.js';
import { Usuario } from './models/Usuario.js';
import { authMiddleware, userMiddleware } from './middleware/auth.js';
import { buildWall } from './controller/wall.js';


// Server options
const app = express();
const PORT = process.env.PORT;

// Session storage
const SequelizeStore = ConnectSessionSequelize(session.Store);
app.use(
	session({
		secret: process.env.SECRET_KEY,
		store: new SequelizeStore({
			db: sequelize
		}),
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: false,
			maxAge: 24*60*60*1000, //24h
			httpOnly: true,
			sameSite: 'lax'
		},
	})
)

// Set up view engine.
app.set('view engine', 'pug');
app.set('views', './views');

// Serve statics
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userMiddleware);

// Routes
app.get('/', async (req, res) => {
	let wall_posts = await buildWall({tags: []});
	res.render('homepage', {wall_posts: wall_posts});
});

app.use('/auth', authRouter);

app.use('/post', postRouter);

app.get('/search/:searchterms', (req, res) => {
	// TODO: Do the search and get results
	res.render('searchresults', {})
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