const login = async ({ email, password, env }) => {
  try {
    await fetch(
      `https://hrx-backend-${env}.sequoia-development.com/idm/v1/contacts/verify-email`,
      {
        body: JSON.stringify({ email }),
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then(({ data }) => data);

    const browserHash = window.fingerPrint;

    const loginRes = await fetch(
      `https://hrx-backend-${env}.sequoia-development.com/idm/users/login`,
      {
        body: JSON.stringify({ email, password, browserHash }),
        method: "POST",
      }
    ).then((res) => res.json());
    console.log(loginRes);
    return loginRes;
  } catch (_e) {
    return false;
  }
};

function init() {
  document.getElementById("login_form").addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    var formData = Object.fromEntries(new FormData(e.target));
    const { email, password, env } = formData;
    const submit = document.getElementById("submit");
    submit.innerHTML = "Logging in...";
    submit.disabled = true;

    login({ email, password, env })
      .then(
        ({
          data: {
            userDetails: { apiToken },
          },
        }) => (document.getElementById("token").innerHTML = apiToken)
      )
      .catch((e) => console.log(e))
      .finally(() => {
        submit.innerHTML = "Submit";
        submit.disabled = false;
      });
  });
}

window.addEventListener("load", function () {
  init();
});

