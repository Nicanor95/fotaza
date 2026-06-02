import 'dotenv/config';
import express from 'express';
import pug from 'pug';
import sequelize from './models/config.js';


// Server options
const app = express();
const PORT = process.env.PORT;

// Set up view engine.
app.set('view engine', 'pug');
app.set('views', './views');

// Serve statics
app.use(express.static("public"));

// Routes
app.get('/', (req, res) => {
	res.render('homepage');
});

app.get('/login', (req, res) => {
	res.render('login', {title:'FOTAZA | Login'});
});

// Run server
app.listen(PORT, async () => {
	console.log(`Fotaza listening on port ${PORT}`);
	// Test database connection.
	try {
		await sequelize.authenticate();
		console.log('Database connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
});