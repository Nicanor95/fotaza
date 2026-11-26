const deletionDialog = document.getElementById("delete-collection-dialog");
const confirmDeletionButton = deletionDialog.querySelector("[data-confirm-deletion]");
const cancelDeletionButton = deletionDialog.querySelector("[data-cancel-deletion]");
let pendingDeletionForm = null;

function closeCollectionMenus() {
	document.querySelectorAll(".collection-options-wrapper .options-menu:not(.hidden)").forEach((menu) => {
		menu.classList.add("hidden");
		menu.previousElementSibling.setAttribute("aria-expanded", "false");
	});
}

document.querySelectorAll(".collection-options-wrapper").forEach((wrapper) => {
	const button = wrapper.querySelector(".options-button");
	const menu = wrapper.querySelector(".options-menu");

	button.addEventListener("click", (event) => {
		event.stopPropagation();
		const isOpen = !menu.classList.contains("hidden");
		closeCollectionMenus();

		if (!isOpen) {
			menu.classList.remove("hidden");
			button.setAttribute("aria-expanded", "true");
		}
	});
});

document.querySelectorAll("[data-delete-collection]").forEach((form) => {
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		closeCollectionMenus();
		pendingDeletionForm = form;
		deletionDialog.showModal();
	});
});

document.addEventListener("click", closeCollectionMenus);

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		const openMenu = document.querySelector(".collection-options-wrapper .options-menu:not(.hidden)");
		const button = openMenu?.previousElementSibling;
		closeCollectionMenus();
		button?.focus();
	}
});

cancelDeletionButton.addEventListener("click", () => {
	pendingDeletionForm = null;
	deletionDialog.close();
});

deletionDialog.addEventListener("cancel", () => {
	pendingDeletionForm = null;
});

confirmDeletionButton.addEventListener("click", () => {
	const form = pendingDeletionForm;
	pendingDeletionForm = null;
	deletionDialog.close();
	form?.submit();
});
