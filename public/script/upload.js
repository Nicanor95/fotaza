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
		let descripcionLabel = document.createElement("label");
		let imagePreview = document.createElement("img");
		let description = document.createElement("textarea");
		let tags = document.createElement("textarea");
		let tagsLabel = document.createElement("label");
		let tagsInstructions = document.createElement("label");

		//Get base64
		const reader = new FileReader();
		reader.onload = (e) => {
			imagePreview.src = e.target.result;
		}
		reader.readAsDataURL(img);

		base.setAttribute("class", "container r_flex");
		descDiv.setAttribute("class", "descDiv c_flex");
		descripcionLabel.setAttribute("for", `description-${index}`);
		descripcionLabel.setAttribute("class", "startalign");
		imgContainer.setAttribute("class", "imgContainer");
		description.setAttribute("id", `description-${index}`);
		description.setAttribute("name", `description-${index}`);
		tagsLabel.setAttribute("for", `tags-${index}`);
		tagsLabel.setAttribute("class", "startalign");
		tags.setAttribute("id", `tags-${index}`);
		tags.setAttribute("name", `tags-${index}`);
		tagsInstructions.setAttribute("class", "startalign smallinstructions");


		descripcionLabel.textContent = "Descripción:";
		tagsLabel.textContent = "Tags:";
		tagsInstructions.textContent = "*Comenzar tags con #. No importa capitalización Ex: #Paisaje = #pAisaJE";

		imgContainer.appendChild(imagePreview);
		descDiv.appendChild(descripcionLabel);
		descDiv.appendChild(description);
		descDiv.appendChild(tagsLabel);
		descDiv.appendChild(tags);
		descDiv.appendChild(tagsInstructions);
		base.appendChild(imgContainer);
		base.appendChild(descDiv);

		previews.appendChild(base);
	}
}