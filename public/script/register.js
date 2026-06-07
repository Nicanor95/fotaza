const errors = document.getElementsByClassName("error");
const nombre = document.getElementById("nombre");
const email = document.getElementById("email");
const password = document.getElementById("password");
const password_confirm = document.getElementById("password_confirm");
const inputs = [nombre, email, password, password_confirm];


const regNombre = /^[a-zA-Zñ]{3,}(?: [a-zA-Z]+)*$/;
const regMail = /^[a-zA-Z0-9](?:[\.-\w])*@\w+(?:-\w+)?(?:\.\w+(?:-\w+)?)+$/;

function validate(event) {
	//Set flag
	let valid = true;

	//Reset errors.
	for (let element of errors) {
		element.hidden = true;
	}
	for (let element of inputs) {
		element.style.borderColor = "";
	}

	//Validate name
	if (!regNombre.test(nombre.value)) {
		nombre.style.borderColor = "red";
		document.querySelector("#nombre+.error").hidden = false;
		valid = false;
	}

	//Validate email
	if (!regMail.test(email.value)) {
		email.style.borderColor = "red";
		document.querySelector("#email+.error").hidden = false;
		valid = false
	}

	//Validate password
	if (password.value.length < 6) {
		password.style.borderColor = "red";
		document.querySelector("#password+.error").hidden = false;
		valid = false;
	}

	if (!(password.value == password_confirm.value)) {
		password_confirm.style.borderColor = "red";
		document.querySelector("#password_confirm+.error").hidden = false;
	}

	if (!valid) {
		event.preventDefault();
	}
}