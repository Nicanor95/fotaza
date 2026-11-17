document.addEventListener("DOMContentLoaded", () => {
	const panel = document.getElementById("panelComentarioReportes");
	const title = document.getElementById("tituloPanelComentarioReportes");
	const status = document.getElementById("estadoPanelComentarioReportes");
	const list = document.getElementById("listaReportesComentario");
	const closeButton = document.getElementById("btnCerrarPanelComentarioReportes");
	const badges = document.querySelectorAll(".comment-report-count");
	let activeBadge = null;
	let requestSequence = 0;

	function setOpen(open) {
		panel.classList.toggle("oculto", !open);
		panel.setAttribute("aria-hidden", String(!open));
		if (!open) {
			requestSequence += 1;
		}
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

	function createReportItem(report) {
		const item = document.createElement("li");
		item.className = "reporte-comentario";

		const header = document.createElement("div");
		header.className = "reporte-comentario-cabecera";
		const reporter = document.createElement("strong");
		reporter.textContent = report.reportante;
		const date = document.createElement("time");
		date.dateTime = report.fecha;
		const parsedDate = new Date(report.fecha);
		date.textContent = Number.isNaN(parsedDate.getTime())
			? report.fecha
			: parsedDate.toLocaleString();
		header.append(reporter, date);

		const reason = document.createElement("p");
		reason.textContent = report.motivo;
		item.append(header, reason);
		return item;
	}

	async function loadReports(commentId) {
		const currentRequest = ++requestSequence;
		status.textContent = "Cargando reportes...";
		list.replaceChildren();

		try {
			const response = await fetch(`/reportes/comentario/${encodeURIComponent(commentId)}/reportes`);
			const reports = await response.json();
			if (!response.ok) {
				throw new Error(reports.error || "No se pudieron cargar los reportes.");
			}
			if (currentRequest !== requestSequence) {
				return;
			}

			if (reports.length === 0) {
				status.textContent = "Este comentario todavía no tiene reportes.";
				return;
			}

			status.textContent = `${reports.length} ${reports.length === 1 ? "reporte" : "reportes"}`;
			list.replaceChildren(...reports.map(createReportItem));
		} catch (error) {
			if (currentRequest === requestSequence) {
				status.textContent = error.message;
			}
		}
	}

	badges.forEach((badge) => {
		badge.addEventListener("click", () => {
			if (activeBadge && activeBadge !== badge) {
				activeBadge.setAttribute("aria-expanded", "false");
			}
			activeBadge = badge;
			title.textContent = `Reportes del comentario #${badge.dataset.commentId}`;
			list.replaceChildren();
			setOpen(true);
			loadReports(badge.dataset.commentId);
		});
	});

	closeButton.addEventListener("click", () => setOpen(false));
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !panel.classList.contains("oculto")) {
			setOpen(false);
		}
	});
});
