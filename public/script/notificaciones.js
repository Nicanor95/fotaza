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

		lista.replaceChildren();

		if (noVistas.length) {
			const heading = document.createElement("h4");
			heading.textContent = "Nuevas";
			lista.append(heading);

			const ul = document.createElement("ul");
			for (const notificacion of noVistas) {
				ul.append(crearElementoNotificacion(notificacion, true));
			}
			lista.append(ul);
		}

		if (vistas.length) {
			const heading = document.createElement("h4");
			heading.textContent = "Historial (últimas 10 leídas)";
			lista.append(heading);

			const ul = document.createElement("ul");
			for (const notificacion of vistas) {
				ul.append(crearElementoNotificacion(notificacion));
			}
			lista.append(ul);
		}

		if (!noVistas.length && !vistas.length) {
			const emptyMessage = document.createElement("p");
			emptyMessage.textContent = "No hay notificaciones.";
			lista.append(emptyMessage);
		}

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

	function crearElementoNotificacion(notificacion, incluirBoton = false) {
		const item = document.createElement("li");
		if (
			typeof notificacion.link === "string"
			&& notificacion.link.startsWith("/")
			&& !notificacion.link.startsWith("//")
		) {
			const link = document.createElement("a");
			link.href = notificacion.link;
			link.textContent = notificacion.contenido;
			item.append(link);
		} else {
			// textContent keeps legacy and new notification text inert.
			item.append(document.createTextNode(notificacion.contenido));
		}

		if (incluirBoton) {
			const button = document.createElement("button");
			button.className = "marcarVisto";
			button.type = "button";
			button.dataset.id = notificacion.id;
			button.textContent = "marcar como visto";
			item.append(button);
		}
		return item;
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
