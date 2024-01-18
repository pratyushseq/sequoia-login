const envs = ["Dev", "Stage", "UAT", "Pre-Production", "Production"];

const defaultEnv = "stage";

const loadEnvs = () => {
	const radio = document.querySelector(".radio");
	const radioHTML = envs.reduce((acc, env) => {
		const id = env.toLowerCase();
		return `${acc}<span class="radio-group">
        <input type="radio" name="env" value="${id}" id="${id}" ${
					id === defaultEnv ? "checked" : ""
				}>
        <label for="${id}">${env}</label>
      </span>`;
	}, "");
	radio.innerHTML = radioHTML;
};

const login = async ({ email, password, env }) => {
	try {
		const verifyRes = await fetch(
			`https://hrx-backend-${env}.sequoia-development.com/idm/v1/contacts/verify-email`,
			{
				body: JSON.stringify({ email }),
				method: "POST",
			},
		)
			.then((res) => res.json())
			.then(({ data }) => data)
			.catch((e) => e);

		if (!verifyRes) return verifyRes;

		const browserHash = window.fingerPrint;

		const loginRes = await fetch(
			`https://hrx-backend-${env}.sequoia-development.com/idm/users/login`,
			{
				body: JSON.stringify({ email, password, browserHash }),
				method: "POST",
			},
		).then((res) => res.json());
		return loginRes;
	} catch (e) {
		console.log(e);
		return e;
	}
};

function innerHTMLToClipboard(token) {
	navigator?.clipboard?.writeText?.(token).then(() => {
		const messageBox = document.getElementById("message");
		messageBox.innerHTML = "Copied to clipboard!";
		messageBox.style.visibility = "visible";
		setTimeout(() => {
			messageBox.innerHTML = "";
			messageBox.style.visibility = "hidden";
		}, 2000);
	});
}

function init() {
	loadEnvs();
	const tokenBox = document.getElementById("token");
	const copyButton = document.getElementById("copy-button");

	document.getElementById("login_form").addEventListener("submit", (e) => {
		e.preventDefault();
		e.stopPropagation();
		const formData = Object.fromEntries(new FormData(e.target));
		const { email, password, env } = formData;
		const submit = document.getElementById("submit");
		submit.innerHTML = "Fetching Token";
		submit.disabled = true;

		tokenBox.innerHTML = "<span>&lt; Token will be displayed here &gt;</span>";
		copyButton.style.display = "none";

		login({ email, password, env })
			.then((res) => {
				if (!res.success) {
					tokenBox.innerHTML = res.message;
					return;
				}
				const {
					data: {
						userDetails: { apiToken },
					},
				} = res;
				tokenBox.innerHTML = apiToken;
				copyButton.style.display = "block";
				innerHTMLToClipboard(apiToken);
			})
			.finally(() => {
				submit.innerHTML = "Submit";
				submit.disabled = false;
			});
	});

	copyButton.addEventListener("click", () => {
		const token = tokenBox.innerHTML;
		innerHTMLToClipboard(token);
	});
}

window.addEventListener("load", function () {
	init();
});
