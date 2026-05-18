import express from 'express';
import pug from 'pug';


// Server options
const app = express();
const PORT = process.env.PORT;
app.set('view engine', 'pug');
app.set('views', './views');

// Routes
app.get('/', (req, res) => {
	res.render('index', { title:"FOTAZA", text:"Que buena foto.", });
})

// Run server
app.listen(PORT, () => {
	console.log(`Fotaza listening on port ${PORT}`);
});