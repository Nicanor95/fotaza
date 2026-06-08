const email = document.getElementById("email");
const password = document.getElementById("password");
const errors = document.getElementsByClassName("error");
const regMail = /^[a-zA-Z0-9](?:[\.-\w])*@\w+(?:-\w+)?(?:\.\w+(?:-\w+)?)+$/;

function validate(event) {
	let valid = true;

	// Reset
	for (let element of [email, password]) {
		element.style.borderColor = "";
	}
	for (let element of errors) {
		element.hidden = true;
	}

	// Validate email
	if (!regMail.test(email.value)) {
		email.style.borderColor = "red";
		document.querySelector("#email+.error").hidden = false;
		valid = false;
	}

	// Validate password
	if (password.value.length <= 6) {
		password.style.borderColor = "red";
		document.querySelector("#password+.error").hidden = false;
		valid = false;
	}

	if (!valid) {
		event.preventDefault();
	}
}