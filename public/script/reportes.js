document.addEventListener("DOMContentLoaded", () => {
	const button = document.getElementById("btnReportes");
	const counter = document.getElementById("contadorReportes");
	const panel = document.getElementById("panelReportes");
	const closeButton = document.getElementById("btnCerrarReportes");
	const list = document.getElementById("reportesLista");
	let isOpen = false;

	async function request(url, options) {
		const response = await fetch(url, options);
		const body = await response.json();
		if (!response.ok) {
			throw new Error(body.error || "No se pudieron cargar los reportes.");
		}
		return body;
	}

	function showMessage(message) {
		list.replaceChildren();
		const paragraph = document.createElement("p");
		paragraph.textContent = message;
		list.append(paragraph);
	}

	function createReportCard(report) {
		const card = document.createElement("article");
		card.className = "reporte-imagen";

		const imageLink = document.createElement("a");
		imageLink.href = `/post/album/${encodeURIComponent(report.publicacion_id)}/${encodeURIComponent(report.id)}`;
		imageLink.target = "_blank";
		imageLink.rel = "noopener";

		const image = document.createElement("img");
		image.src = report.data;
		image.alt = report.description || `Imagen ${report.id}`;
		imageLink.append(image);

		const description = document.createElement("p");
		description.textContent = report.description || "Sin descripción";
		const count = document.createElement("strong");
		count.textContent = `${report.cantidad} reportes`;

		const reasonsTitle = document.createElement("p");
		reasonsTitle.textContent = "Reglas denunciadas:";
		const reasons = document.createElement("ul");
		for (const motivo of report.motivos || []) {
			const reason = document.createElement("li");
			reason.textContent = motivo;
			reasons.append(reason);
		}

		const actions = document.createElement("div");
		actions.className = "reporte-acciones";
		const removeButton = document.createElement("button");
		removeButton.type = "button";
		removeButton.textContent = "Eliminar imagen";
		removeButton.addEventListener("click", () => performAction(report.id, "eliminar"));
		const dismissButton = document.createElement("button");
		dismissButton.type = "button";
		dismissButton.textContent = "Descartar reportes";
		dismissButton.addEventListener("click", () => performAction(report.id, "descartar"));
		actions.append(removeButton, dismissButton);
		card.append(imageLink, count, description);
		if (reasons.childElementCount > 0) {
			card.append(reasonsTitle, reasons);
		}
		card.append(actions);
		return card;
	}

	async function loadReports() {
		try {
			const reports = await request("/reportes/moderacion/imagenes");
			counter.textContent = reports.length;
			counter.hidden = reports.length === 0;
			list.replaceChildren();
			if (reports.length === 0) {
				showMessage("No hay imágenes con tres o más reportes.");
				return;
			}
			list.append(...reports.map(createReportCard));
		} catch (error) {
			showMessage(error.message);
		}
	}

	async function performAction(id, action) {
		try {
			await request(`/reportes/moderacion/imagenes/${encodeURIComponent(id)}/${action}`, {
				method: "POST"
			});
			await loadReports();
		} catch (error) {
			showMessage(error.message);
		}
	}

	function setOpen(open) {
		isOpen = open;
		panel.classList.toggle("oculto", !isOpen);
		panel.setAttribute("aria-hidden", String(!isOpen));
		button.setAttribute("aria-expanded", String(isOpen));
		if (isOpen) {
			loadReports();
		}
	}

	button.addEventListener("click", () => setOpen(!isOpen));
	closeButton.addEventListener("click", () => setOpen(false));
	loadReports();
});
