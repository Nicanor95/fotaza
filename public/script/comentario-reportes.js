document.addEventListener("DOMContentLoaded", () => {
	const panel = document.getElementById("panelComentarioReportes");
	const title = document.getElementById("tituloPanelComentarioReportes");
	const status = document.getElementById("estadoPanelComentarioReportes");
	const closeButton = document.getElementById("btnCerrarPanelComentarioReportes");
	const badges = document.querySelectorAll(".comment-report-count");
	let activeBadge = null;

	function setOpen(open) {
		panel.classList.toggle("oculto", !open);
		panel.setAttribute("aria-hidden", String(!open));
		if (activeBadge) {
			activeBadge.setAttribute("aria-expanded", String(open));
		}
		if (!open && activeBadge) {
			activeBadge.focus();
			activeBadge = null;
		} else if (open) {
			closeButton.focus();
		}
	}

	badges.forEach((badge) => {
		badge.addEventListener("click", () => {
			if (activeBadge && activeBadge !== badge) {
				activeBadge.setAttribute("aria-expanded", "false");
			}
			activeBadge = badge;
			title.textContent = `Reportes del comentario #${badge.dataset.commentId}`;
			status.textContent = "Los detalles de los reportes se mostrarán aquí.";
			setOpen(true);
		});
	});

	closeButton.addEventListener("click", () => setOpen(false));
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !panel.classList.contains("oculto")) {
			setOpen(false);
		}
	});
});
