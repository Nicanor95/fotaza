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

// Menú de opciones de comentarios (abrir/cerrar dropdown)
document.querySelectorAll(".options-button").forEach((btn) => {
	btn.addEventListener("click", (e) => {
		e.stopPropagation();
		const menu = btn.nextElementSibling;
		const isOpen = !menu.classList.contains("hidden");

		// Cerrar todos los demás menús abiertos
		document.querySelectorAll(".options-menu:not(.hidden)").forEach((m) => {
			m.classList.add("hidden");
			m.previousElementSibling.setAttribute("aria-expanded", "false");
		});

		if (!isOpen) {
			menu.classList.remove("hidden");
			btn.setAttribute("aria-expanded", "true");
		}
	});
});

// Cerrar menús al hacer clic fuera
document.addEventListener("click", () => {
	document.querySelectorAll(".options-menu:not(.hidden)").forEach((m) => {
		m.classList.add("hidden");
		m.previousElementSibling.setAttribute("aria-expanded", "false");
	});
});

document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		document.querySelectorAll(".options-menu:not(.hidden)").forEach((menu) => {
			menu.classList.add("hidden");
			const button = menu.previousElementSibling;
			button.setAttribute("aria-expanded", "false");
			button.focus();
		});
	}
});