import { tagRegex } from "./post.js" 
import { buildSearchWall } from "./wall.js";

const possibleTagRegex = /\w+/gmi;

export async function searchByTags(req,res) {
	const title = req.body.terms.trim();
	let terms = req.body.terms.toUpperCase();
	let tags = terms.match(tagRegex); //Proper tags
	if (!tags) {
		tags = []; // No matches
	}

	terms = terms.replace(tagRegex, "");
	
	// Words found in the string
	let foundtags = [] //Failsafe for concat.
	try{
		foundtags = (terms.match(possibleTagRegex)).map((tag) => { 
			return `#${tag}`;
		});
	} catch (err) {
		foundtags = []; // No matches.
	}

	// Join it all
	tags = tags.concat(foundtags);

	// Search with the same phrase in titles as well as with the parsed tags.
	const posts = await buildSearchWall({
		tags,
		title,
		isLoggedIn: Boolean(req.user)
	});
	res.render('searchresults.pug', {wall_posts: posts});
}