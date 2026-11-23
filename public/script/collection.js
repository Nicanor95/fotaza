const removalDialog = document.getElementById("remove-collection-image-dialog");
const confirmRemovalButton = removalDialog.querySelector("[data-confirm-removal]");
const cancelRemovalButton = removalDialog.querySelector("[data-cancel-removal]");
let pendingRemovalForm = null;

document.querySelectorAll("[data-remove-collection-image]").forEach((form) => {
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		pendingRemovalForm = form;
		removalDialog.showModal();
	});
});

cancelRemovalButton.addEventListener("click", () => {
	pendingRemovalForm = null;
	removalDialog.close();
});

removalDialog.addEventListener("cancel", () => {
	pendingRemovalForm = null;
});

confirmRemovalButton.addEventListener("click", () => {
	const form = pendingRemovalForm;
	pendingRemovalForm = null;
	removalDialog.close();
	form?.submit();
});
