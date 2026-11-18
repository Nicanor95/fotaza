document.addEventListener("DOMContentLoaded", () => {
	const panel = document.getElementById("panelComentarioReportes");
	const title = document.getElementById("tituloPanelComentarioReportes");
	const status = document.getElementById("estadoPanelComentarioReportes");
	const list = document.getElementById("listaReportesComentario");
	const closeButton = document.getElementById("btnCerrarPanelComentarioReportes");
	const dismissButton = document.getElementById("btnDescartarReportesComentario");
	const deleteButton = document.getElementById("btnEliminarComentarioReportado");
	const badges = document.querySelectorAll(".comment-report-count");
	let activeBadge = null;
	let requestSequence = 0;
	let reportsLoaded = false;
	let reportCount = null;
	let actionPending = false;

	// Updates moderation button availability based on panel state.
	function updateActionButtons() {
		dismissButton.disabled = actionPending || !reportsLoaded || reportCount === 0;
		deleteButton.disabled = actionPending || !reportsLoaded;
	}

	// Toggles the comment-report panel and manages focus.
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

	// Creates a report detail item for the panel list.
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

	// Loads and renders reports for a selected comment.
	async function loadReports(commentId) {
		const currentRequest = ++requestSequence;
		reportsLoaded = false;
		reportCount = null;
		updateActionButtons();
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
				reportsLoaded = true;
				reportCount = 0;
				updateActionButtons();
				if (activeBadge) {
					activeBadge.textContent = "0 reportes";
				}
				status.textContent = "Este comentario todavía no tiene reportes.";
				return;
			}

			reportsLoaded = true;
			reportCount = reports.length;
			updateActionButtons();
			if (activeBadge) {
				activeBadge.textContent = `${reports.length} ${reports.length === 1 ? "reporte" : "reportes"}`;
			}
			status.textContent = `${reports.length} ${reports.length === 1 ? "reporte" : "reportes"}`;
			list.replaceChildren(...reports.map(createReportItem));
		} catch (error) {
			if (currentRequest === requestSequence) {
				status.textContent = error.message;
				updateActionButtons();
			}
		}
	}

	// Performs the selected moderation action for the active comment.
	async function performAction(action) {
		if (!activeBadge || actionPending || !reportsLoaded) {
			return;
		}

		const deletingComment = action === "eliminar";
		const confirmation = deletingComment
			? "¿Eliminar este comentario y todos sus reportes? Esta acción no se puede deshacer."
			: "¿Descartar todos los reportes de este comentario?";
		if (!window.confirm(confirmation)) {
			return;
		}

		const badge = activeBadge;
		const commentId = badge.dataset.commentId;
		actionPending = true;
		updateActionButtons();
		status.textContent = deletingComment ? "Eliminando comentario..." : "Descartando reportes...";

		try {
			const response = await fetch(`/reportes/comentario/${encodeURIComponent(commentId)}/${action}`, {
				method: "POST"
			});
			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || "No se pudo completar la acción.");
			}

			if (deletingComment) {
				const card = badge.closest(".comment-card");
				const focusTarget = card?.nextElementSibling?.querySelector(".comment-report-count")
					|| card?.previousElementSibling?.querySelector(".comment-report-count")
					|| card?.closest(".post-comments")?.querySelector("h3");
				setOpen(false);
				card?.remove();
				focusTarget?.focus();
			} else {
				badge.textContent = "0 reportes";
				await loadReports(commentId);
			}
		} catch (error) {
			status.textContent = error.message;
		} finally {
			actionPending = false;
			updateActionButtons();
		}
	}

	badges.forEach((badge) => {
		badge.addEventListener("click", () => {
			if (actionPending) {
				return;
			}
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

	dismissButton.addEventListener("click", () => performAction("descartar"));
	deleteButton.addEventListener("click", () => performAction("eliminar"));
	closeButton.addEventListener("click", () => setOpen(false));
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !panel.classList.contains("oculto")) {
			setOpen(false);
		}
	});
});
