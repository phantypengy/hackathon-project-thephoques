function switchTab(tab) {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginTabs = document.querySelectorAll(".loginTab");
  const loginError = document.getElementById("loginError");
  const signupError = document.getElementById("signupError");

  loginForm.style.display = tab === "login" ? "block" : "none";
  signupForm.style.display = tab === "signup" ? "block" : "none";

  loginTabs.forEach((t) => t.classList.remove("active"));

  if (tab === "login") {
    loginTabs[0].classList.add("active");
  } else {
    loginTabs[1].classList.add("active");
  }

  loginError.textContent = "";
  signupError.textContent = "";
  loginError.style.color = "#ff7b7b";
  signupError.style.color = "#ff7b7b";
}

async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const loginError = document.getElementById("loginError");

  loginError.textContent = "";
  loginError.style.color = "#ff7b7b";

  if (!username || !password) {
    loginError.textContent = "Please enter both username and password.";
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      loginError.style.color = "#7CFC98";
      loginError.textContent = "Logged in successfully. Redirecting...";
      setTimeout(() => {
        window.location.href = "redesign.html";
      }, 1000);
    } else {
      loginError.textContent = data.error || "Login failed.";
    }
  } catch (error) {
    console.error("Login error:", error);
    loginError.textContent = "Something went wrong. Please try again.";
  }
}

async function signup() {
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;
  const signupError = document.getElementById("signupError");

  signupError.textContent = "";
  signupError.style.color = "#ff7b7b";

  if (!username || !password || !confirm) {
    signupError.textContent = "Please fill in all fields.";
    return;
  }

  if (username.length > 20) {
    signupError.textContent = "Username must be 20 characters or less.";
    return;
  }

  if (password.length < 6) {
    signupError.textContent = "Password must be at least 6 characters.";
    return;
  }

  if (password !== confirm) {
    signupError.textContent = "Passwords do not match.";
    return;
  }

  try {
    const response = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      signupError.style.color = "#7CFC98";
      signupError.textContent = "Account created successfully. Redirecting...";
      setTimeout(() => {
        window.location.href = "redesign.html";
      }, 1200);
    } else {
      signupError.textContent = data.error || "Sign up failed.";
    }
  } catch (error) {
    console.error("Signup error:", error);
    signupError.textContent = "Something went wrong. Please try again.";
  }
}