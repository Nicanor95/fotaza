document.addEventListener("DOMContentLoaded", () => {
	const btn = document.getElementById("btnNotificaciones");
	const contador = document.getElementById("contadorNotificaciones");
	const panel = document.getElementById("panelNotificaciones");
	const btnCerrar = document.getElementById("btnCerrarNotificaciones");
	const lista = document.getElementById("notificacionesLista");

	let abierta = false;
	if (panel) {
		panel.classList.add("oculto");
		panel.setAttribute("aria-hidden", "true");
	}

	// Escapa texto para evitar inyección de HTML.
	function escapar(texto) {
		const div = document.createElement("div");
		div.textContent = texto;
		return div.innerHTML;
	}

	// Pide las notificaciones al servidor y actualiza el contador de no vistas.
	async function actualizarContador() {
		if (!contador) return;
		const respuesta = await fetch("/notificaciones");
		const notificaciones = await respuesta.json();
		const noVistas = notificaciones.filter((n) => !n.visto).length;
		contador.textContent = noVistas;
		contador.hidden = noVistas === 0;
	}

	// Carga las notificaciones y las divide en: no vistas, e historial (máx. 10 vistas).
	async function cargarNotificaciones() {
		if (!lista) return;
		const respuesta = await fetch("/notificaciones");
		const notificaciones = await respuesta.json();

		const noVistas = notificaciones.filter((n) => !n.visto);
		const vistas = notificaciones.filter((n) => n.visto).slice(0, 10);

		let html = "";

		if (noVistas.length) {
			html += "<h4>Nuevas</h4><ul>";
			for (const n of noVistas) {
				html += `<li>
					${escapar(n.contenido)}
					<button class="marcarVisto" type="button" data-id="${n.id}">marcar como visto</button>
				</li>`;
			}
			html += "</ul>";
		}

		if (vistas.length) {
			html += "<h4>Historial (últimas 10 leídas)</h4><ul>";
			for (const n of vistas) {
				html += `<li>${escapar(n.contenido)}</li>`;
			}
			html += "</ul>";
		}

		if (!html) {
			html = "<p>No hay notificaciones.</p>";
		}

		lista.innerHTML = html;

		// Cada notificación nueva tiene un botón para marcarla como vista.
		lista.querySelectorAll(".marcarVisto").forEach((boton) => {
			boton.addEventListener("click", async (evento) => {
				evento.stopPropagation();
				const id = boton.dataset.id;
				await fetch(`/notificaciones/${id}/visto`, { method: "POST" });
				await actualizarContador();
				await cargarNotificaciones();
			});
		});
	}

	function establecerPanelAbierto(abierto) {
		if (!panel) return;
		abierta = abierto;
		panel.classList.toggle("oculto", !abierta);
		panel.setAttribute("aria-hidden", String(!abierta));
		btn?.setAttribute("aria-expanded", String(abierta));
		if (abierta) {
			cargarNotificaciones();
		}
	}

	if (btn) {
		btn.addEventListener("click", () => establecerPanelAbierto(!abierta));
	}

	if (btnCerrar) {
		btnCerrar.addEventListener("click", () => establecerPanelAbierto(false));
	}

	actualizarContador();
});
