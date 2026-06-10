const slides = document.getElementsByClassName("slide");
const descs = document.getElementsByClassName("description");
const comments = document.getElementsByClassName("comments");
const prev = document.getElementsByClassName("prev")[0];
const next = document.getElementsByClassName("next")[0];
let slideIndex = 0;

slides[0].style.display = "flex";
descs[0].style.display = "block";
comments[0].hidden = false;

if (prev) {
	prev.hidden = true;
}


function moveSlide(n) {
	slides[slideIndex].style.display = "none";
	descs[slideIndex].style.display = "none";
	comments[slideIndex].hidden = "true";
	slideIndex += n;

	if (slideIndex < 0) {
		slideIndex = 0;
	}

	if (slideIndex > slides.length - 1) {
		slideIndex = slides.length - 1;
	}

	if (slideIndex <= 0) {
		prev.hidden = true;
		next.hidden = false;
	}
	
	if (slideIndex >= slides.length - 1) {
		next.hidden = true;
		prev.hidden = false;
	}
	
	if (slides.length > 2) {
		if (slideIndex > 0 && slideIndex < slides.length - 1) {
			prev.hidden = false;
			next.hidden = false;
		}
	}
	slides[slideIndex].style.display = "flex";
	descs[slideIndex].style.display = "block";
	comments[slideIndex].hidden = false;
}