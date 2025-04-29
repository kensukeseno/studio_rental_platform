document.addEventListener("DOMContentLoaded", function () {
  console.log("JS Loaded: Profile & Logout Handling Active");

  const logoutButton = document.getElementById("logout-btn");
  const openProfileButton = document.getElementById("open-profile");
  const editProfileButton = document.getElementById("edit-profile-btn");
  const profileInfoSection = document.getElementById("profile-info");
  const profileModal = document.getElementById("profile-modal");
  const editProfileModal = document.getElementById("edit-profile-modal");

  // Load logged-in user data from backend
  let loggedInUser;
  let email = localStorage.getItem("userEmail");
  fetch(`https://studio-rental-platform.onrender.com/user?email=${email}`)
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
      loggedInUser = jsonObject;
      displayUserInfo(loggedInUser);
      console.log("User loaded successfully:", loggedInUser.email);
    })
    .catch((error) => {
      window.location.href = "/";
      const errorMessage = error.message;
      console.log(errorMessage);
      alert("Something went wrong. Please log in again.");
      return;
    });

  // Open Profile Modal
  openProfileButton.addEventListener("click", function () {
    console.log("Opening Profile Info Modal...");
    profileModal.style.display = "flex";
  });

  // Close Profile Modal on Outside Click
  window.addEventListener("click", function (event) {
    if (event.target === profileModal) {
      console.log("Closing Profile Info Modal...");
      profileModal.style.display = "none";
    }
    if (event.target === editProfileModal) {
      console.log("Closing Edit Profile Modal...");
      editProfileModal.style.display = "none";
    }
  });

  // Logout Button Functionality

  logoutButton.addEventListener("click", function () {
    // Clear all data in localStorage
    localStorage.clear();
    window.location.href = "/";
    return;
  });

  // Open Edit Profile Modal
  editProfileButton.addEventListener("click", function () {
    editProfileModal.style.display = "flex";

    // Fill the form with current data
    document.getElementById("edit-name").value = loggedInUser.name;
    document.getElementById("edit-email").value = loggedInUser.email;
    document.getElementById("edit-phone").value = loggedInUser.phone || "";
    document.getElementById("edit-email").disabled = true;
  });

  // Function to Read Image Asynchronously with comprehensive error handling
  function readFileAsync(file) {
    console.log(
      "Starting to read file:",
      file.name,
      "Size:",
      file.size,
      "Type:",
      file.type
    );

    return new Promise((resolve, reject) => {
      if (!file) {
        console.log("No file provided to readFileAsync");
        resolve(null);
        return;
      }

      const reader = new FileReader();

      reader.onload = function (event) {
        console.log(
          "File successfully read, data size:",
          event.target.result.length
        );
        resolve(event.target.result);
      };

      reader.onerror = function (error) {
        console.error("Error in FileReader:", error);
        reject(error);
      };

      reader.onprogress = function (event) {
        if (event.lengthComputable) {
          console.log(
            `Reading progress: ${Math.round(
              (event.loaded / event.total) * 100
            )}%`
          );
        }
      };

      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Exception when calling readAsDataURL:", error);
        reject(error);
      }
    });
  }

  // Function to compress image if needed
  function compressImage(dataUrl, maxSizeKB) {
    return new Promise((resolve, reject) => {
      console.log("Starting image compression");
      const img = new Image();
      img.src = dataUrl;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate scaling factor to reduce size
        let quality = 0.7; // Starting quality

        // Max dimensions for thumbnail
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }

        if (height > MAX_HEIGHT) {
          width = Math.round(width * (MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Try to compress until we get under maxSizeKB or reach minimum quality
        const compressAndCheck = (q) => {
          const compressed = canvas.toDataURL("image/jpeg", q);
          console.log(
            `Compressed to quality ${q}, size: ${Math.round(
              compressed.length / 1024
            )}KB`
          );

          if (compressed.length / 1024 <= maxSizeKB || q < 0.1) {
            resolve(compressed);
          } else {
            compressAndCheck(q - 0.1);
          }
        };

        compressAndCheck(quality);
      };

      img.onerror = function () {
        console.error("Failed to load image for compression");
        reject(new Error("Image compression failed"));
      };
    });
  }

  // Handle Profile Update Submission
  document
    .getElementById("edit-profile-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      console.log("Profile update form submitted");

      const updatedName = document.getElementById("edit-name").value.trim();
      const updatedPhone = document.getElementById("edit-phone").value.trim();
      const photoInput = document.getElementById("edit-photo");

      if (!updatedName) {
        alert("Please enter your name.");
        return;
      }

      let updatedPhoto = loggedInUser.photo; // Keep old photo if not changed

      if (photoInput.files.length > 0) {
        const file = photoInput.files[0];
        console.log(
          "New photo selected:",
          file.name,
          "Size:",
          file.size,
          "Type:",
          file.type
        );

        // Check file type
        if (!file.type.match("image.*")) {
          alert("Please select an image file (JPEG, PNG, etc.)");
          return;
        }

        try {
          // Read the file
          let photoData = await readFileAsync(file);

          // Check if we need to compress the image (if larger than 500KB)
          const maxSizeKB = 500;
          if (photoData.length / 1024 > maxSizeKB) {
            console.log("Image is large, compressing...");
            try {
              photoData = await compressImage(photoData, maxSizeKB);
            } catch (compressionError) {
              console.error("Failed to compress image:", compressionError);
              // Continue with original image if compression fails
            }
          }

          console.log(
            "Final image size:",
            Math.round(photoData.length / 1024),
            "KB"
          );
          updatedPhoto = photoData;
        } catch (fileError) {
          console.error("Failed to process image:", fileError);
          alert(
            "Failed to process the image. Please try a different image or smaller file."
          );
          return;
        }
      }

      loggedInUser.name = updatedName;
      loggedInUser.phone = updatedPhone;
      loggedInUser.photo = updatedPhoto;
      // Call a API to update user info
      fetch("https://studio-rental-platform.onrender.com/user/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loggedInUser),
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
          console.log("Profile update successful");

          // Update the profile info section
          displayUserInfo(loggedInUser);

          // Close the edit profile modal
          editProfileModal.style.display = "none";
        })
        .catch((error) => {
          console.error(error.message);
          alert("Something went wrong. Please try it again.");
          return;
        });
    });

  // Function to Display User Info
  function displayUserInfo(user) {
    try {
      let photo = user.photo
        ? user.photo
        : "../images/user-profile-default-image.png";

      profileInfoSection.innerHTML = `
        <div>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${user.phone || "Not provided"}</p>
        </div>
        <img src="${photo}" alt="Profile Photo" onerror="this.src='../images/user-profile-default-image.png'; console.log('Error loading profile image, fallback to default');">
      `;
      console.log("User info displayed successfully");
    } catch (error) {
      console.error("Error displaying user info:", error);
      profileInfoSection.innerHTML = `<p>Error displaying profile information. Please refresh the page.</p>`;
    }
  }

  // Prevent negative values in input fields
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value < 0) {
        this.value = 0;
      }
    });
  });
});
