async function logout() {
  await fetch("/logout", {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "login.html";
  alert("Succesfully logged out!");
}

async function loadUser() {
  try {
    const response = await fetch("/me", {
      credentials: "include",
    });
    if (response.ok) {
      const user = await response.json();
      document.getElementById("navUsername").textContent = user.username;
    } else {
      document.getElementById("navUsername").textContent = "Not logged in";
    }
  } catch (err) {
    console.log("Could not load user:", err);
  }
}

async function updateAuthButton() {
  const response = await fetch("/me", {
    credentials: "include",
  });
  console.log("/me status:", response.status);
  const authBtn = document.getElementById("authBtn");
  if (!authBtn) return;

  if (response.ok) {
    authBtn.textContent = "Logout";
    authBtn.onclick = logout;
  } else {
    authBtn.textContent = "Login";
    authBtn.onclick = () => (window.location.href = "login.html");
  }
}

updateAuthButton();

loadUser();
