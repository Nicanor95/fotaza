import { tagRegex } from "./post.js" 
import { buildWall } from "./wall.js";

const possibleTagRegex = /\w+/gmi;

export async function searchByTags(req,res) {
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

	// Find the posts with these tags
	const posts = await buildWall({tags: tags});
	res.render('searchresults.pug', {wall_posts: posts});
}