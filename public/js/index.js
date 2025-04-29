document.addEventListener("DOMContentLoaded", function () {
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");

  if (loginModal) loginModal.style.display = "none";
  if (signupModal) signupModal.style.display = "none";

  const openLoginBtn = document.getElementById("open-login");
  const openSignupBtn = document.getElementById("open-signup");
  const switchToSignup = document.getElementById("switch-to-signup");
  const switchToLogin = document.getElementById("switch-to-login");

  const closeButtons = document.querySelectorAll(".close");

  function openModal(modal) {
    if (modal) modal.style.display = "flex";
  }

  function closeModal(modal) {
    if (modal) modal.style.display = "none";
  }

  openLoginBtn?.addEventListener("click", () => openModal(loginModal));
  openSignupBtn?.addEventListener("click", () => openModal(signupModal));

  switchToSignup?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
  });

  switchToLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const modalId = e.target.getAttribute("data-modal");
      closeModal(document.getElementById(modalId));
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target);
    }
  });

  // Asyncronous function to read a photo
  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // When the file is loaded, resolve the promise with the result
      reader.onload = function (event) {
        resolve(event.target.result); // The result is the file content
      };

      // Handle error if something goes wrong
      reader.onerror = function (error) {
        reject(error); // Reject the promise if there's an error
      };

      // Read the image file as a Base64 string
      reader.readAsDataURL(file);
    });
  }

  document
    .getElementById("signup-form")
    ?.addEventListener("submit", async function (event) {
      event.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const phone = document.getElementById("phone").value.trim();
      const role = document.getElementById("role").value;
      const photoInput = document.getElementById("photo");
      let photo = "../images/user-profile-default-image.png";
      const signupErrorMessage = document.getElementById(
        "signup-error-message"
      );

      // Reset the error message
      signupErrorMessage.style.display = "none";
      signupErrorMessage.textContent = "";

      // Image file convertion
      const file = photoInput.files[0]; // Get the first selected file
      if (file) {
        try {
          photo = await readFileAsync(file);
        } catch (error) {
          console.error("Error reading file:", error);
          signupErrorMessage.style.display = "block";
          return;
        }
      }
      if (!name || !email || !phone || !role) {
        alert("Please fill in all fields with *.");
        return;
      }

      const newUser = {
        name: name,
        email: email,
        phone: phone,
        role: role,
        photo: photo,
      };
      // Send a POST request to the backend
      fetch("https://studio-rental-platform.onrender.com/user/signup", {
        method: "POST", // Set the request method to POST
        headers: {
          "Content-Type": "application/json", // Indicate the content type is JSON
        },
        body: JSON.stringify(newUser), // Convert the JavaScript object to a JSON string
      })
        .then(async (res) => {
          if (!res.ok) {
            // If error comes from the backend, log the message in the console
            if (res.status === 500) {
              const errorObject = await res.json();
              throw new Error(errorObject.error);
            } else {
              throw new Error("Something went wrong.");
            }
          }
          await showTemporaryMessage(
            "Sign-up successful! Redirecting to login...",
            2000
          );
          closeModal(signupModal);
          openModal(loginModal);
        })
        .catch((error) => {
          console.error(error.message);
          signupErrorMessage.style.display = "block";
          signupErrorMessage.innerHTML = `Sign-up failed: ${error.message}`;
          return;
        });
    });

  document
    .getElementById("login-form")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document
        .getElementById("login-email")
        .value.trim()
        .toLowerCase();
      const loginErrorMessage = document.getElementById("login-error-message");
      // Reset the error message
      loginErrorMessage.style.display = "none";
      loginErrorMessage.textContent = "";

      // Send a GET request to the backend
      fetch(
        `https://studio-rental-platform.onrender.com/user/login?email=${email}`
      )
        .then(async (res) => {
          if (!res.ok) {
            // If error comes from the backend, log the message in the console
            if (res.status === 500) {
              const errorObject = await res.json();
              throw new Error(errorObject.error);
            } else {
              throw new Error("Something went wrong.");
            }
          }
          const jsonObject = await res.json();

          //Show redirecting message
          await showTemporaryMessage(
            "Login successful! Redirecting to dashboard..."
          );
          // Store user email in the local storage
          localStorage.setItem("userEmail", email);
          if (jsonObject.role === "renter") {
            window.location.href = "/renter-dashboard";
          } else if (jsonObject.role === "owner") {
            window.location.href = "/owner-dashboard";
          }
          closeModal(loginModal);
        })
        .catch((error) => {
          console.error(error.message);
          loginErrorMessage.style.display = "block";
          loginErrorMessage.innerHTML = `Login failed: ${error.message}`;
          return;
        });
    });

  function showTemporaryMessage(message, duration = 2000) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.id = "overlay";
      overlay.textContent = message;
      document.body.appendChild(overlay);

      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve();
      }, duration);
    });
  }
});
