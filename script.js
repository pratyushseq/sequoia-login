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
    return loginRes;
  } catch (e) {
    console.log(e);
    return e;
  }
};

function init() {
  const tokenBox = document.getElementById("token");
  document.getElementById("login_form").addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    var formData = Object.fromEntries(new FormData(e.target));
    const { email, password, env } = formData;
    const submit = document.getElementById("submit");
    submit.innerHTML = "Logging in...";
    submit.disabled = true;

    login({ email, password, env })
      .then((res) => {
        console.log(res, typeof res);
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
      })
      .finally(() => {
        submit.innerHTML = "Submit";
        submit.disabled = false;
      });
  });
}

window.addEventListener("load", function () {
  init();
});


