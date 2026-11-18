const removalDialog = document.getElementById("remove-image-dialog");
const confirmRemovalButton = removalDialog.querySelector("[data-confirm-removal]");
const cancelRemovalButton = removalDialog.querySelector("[data-cancel-removal]");
let pendingRemovalButton = null;

document.querySelectorAll("[data-remove-image]").forEach((button) => {
	button.addEventListener("click", (event) => {
		event.preventDefault();
		pendingRemovalButton = button;
		removalDialog.showModal();
	});
});

cancelRemovalButton.addEventListener("click", () => {
	pendingRemovalButton = null;
	removalDialog.close();
});

removalDialog.addEventListener("cancel", () => {
	pendingRemovalButton = null;
});

confirmRemovalButton.addEventListener("click", () => {
	const button = pendingRemovalButton;
	pendingRemovalButton = null;
	removalDialog.close();

	if (button) {
		button.form.requestSubmit(button);
	}
});
