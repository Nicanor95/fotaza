const title = document.getElementById("title");
const inputFiles = document.getElementById("fileinput");
const previews = document.getElementById("previews");
//const reader = new FileReader(); // To read the files in base64

// Add event trigger to file selection
inputFiles.addEventListener("change", handleFiles);

function handleFiles() {
	const fileList = Array.from(this.files);
	
	if (fileList.length <= 0) { // No files, abort.
		return;
	}

	for (let [index, img] of fileList.entries()) {
		let base = document.createElement("div");
		let descDiv = document.createElement("div");
		let imgContainer = document.createElement("div");
		let label = document.createElement("label");
		let imagePreview = document.createElement("img");
		let description = document.createElement("textarea");
		let imgB64 = document.createElement("textarea");

		//Get base64
		const reader = new FileReader();
		reader.onload = (e) => {
			imagePreview.src = e.target.result;
			imgB64.textContent = e.target.result;
		}
		reader.readAsDataURL(img);

		base.setAttribute("class", "container r_flex");
		descDiv.setAttribute("class", "descDiv c_flex");
		label.setAttribute("for", "description");
		label.setAttribute("class", "startalign");
		imgContainer.setAttribute("class", "imgContainer");
		description.setAttribute("id", `description-${index}`);
		description.setAttribute("name", `description-${index}`);
		imgB64.setAttribute("name", `imgBase64-${index}`);
		imgB64.setAttribute("hidden", "true");

		label.textContent = "Descripción:";

		imgContainer.appendChild(imagePreview);
		descDiv.appendChild(label);
		descDiv.appendChild(description);
		base.appendChild(imgContainer);
		base.appendChild(descDiv);
		descDiv.appendChild(imgB64);

		previews.appendChild(base);
	}
}