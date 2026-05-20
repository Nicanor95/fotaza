import express from 'express';
import pug from 'pug';


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

// Run server
app.listen(PORT, () => {
	console.log(`Fotaza listening on port ${PORT}`);
});