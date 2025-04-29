document.addEventListener("DOMContentLoaded", function () {
  const listingForm = document.getElementById("listing-form");
  const editListingForm = document.getElementById("edit-listing-form");
  const studioListings = document.getElementById("owner-studio-listings");
  const listingModal = document.getElementById("listing-modal");
  const filterModal = document.getElementById("filter-modal");

  // Profile variables
  const editProfileButton = document.getElementById("edit-profile-btn");
  const profileModal = document.getElementById("edit-profile-modal");

  let loggedInUser = null;

  // ------------------ LISTING MANAGEMENT ------------------
  let ownerListings;
  let email = localStorage.getItem("userEmail");
  function loadListings() {
    // Get owner's listing from backend
    fetch(
      `https://studio-rental-platform.onrender.com/listing/myListings?email=${email}`
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

        ownerListings = jsonObject;
        studioListings.innerHTML = "";
        // listing display, only name address and photo
        ownerListings.forEach((listing) => {
          const card = document.createElement("div");
          card.className = "owner-card";

          let photoSrc = "../images/room-default-image.png"; // Default image

          if (listing.photo && listing.photo.length > 0) {
            photoSrc = listing.photo[0].data;
          }

          card.innerHTML = `
        <img src="${photoSrc}" alt="Studio Photo" class="owner-card-img">
        <h3>${listing.name}</h3>
        <p>${listing.address}</p>
        <div class="owner-card-actions">
            <button onclick="showListingDetails('${listing.id}')">Edit</button>
            <button onclick="deleteListing('${listing.id}')">Delete</button>
        </div>
    `;

          studioListings.appendChild(card);
        });
      })
      .catch(async (error) => {
        console.error(error.message);
        await showTemporaryMessage(
          "Something went wrong. Please log in again."
        );
        window.location.href = "/";
        return;
      });
  }

  loadListings();

  // Asyncronous function to read a photo
  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      reader.onerror = function (error) {
        reject(error);
      };
      reader.readAsDataURL(file);
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

        compressAndCheck(0.6); // Start with quality 0.6. less quality, smaller image
      };

      img.onerror = function () {
        console.error("Failed to load image for compression");
        reject(new Error("Image compression failed"));
      };
    });
  }

  // Add Listing
  if (document.getElementById("add-listing-btn")) {
    document
      .getElementById("add-listing-btn")
      .addEventListener("click", async function (event) {
        event.preventDefault();

        // Get form values
        const studioName = document.getElementById("studio-name").value;
        const studioAddress = document.getElementById("studio-address").value;
        const studioArea = document.getElementById("studio-area").value;
        const studioType = document.getElementById("studio-type").value;
        const studioCapacity = document.getElementById("studio-capacity").value;
        const studioPrice = document.getElementById("studio-price").value;

        // Check if any required field is empty
        if (
          !studioName ||
          !studioAddress ||
          !studioArea ||
          !studioType ||
          !studioCapacity ||
          !studioPrice
        ) {
          alert("Please fill in all required fields.");
          return; // Stop the function if any field is empty
        }

        // Convert photos to strings values
        let photos = [];
        const photoInput = document.getElementById("studio-photo");
        let files = photoInput.files;
        if (files.length !== 0) {
          for (let i = 0; i < files.length; i++) {
            if (i === 4) {
              break;
            }
            let photoData = await readFileAsync(files[i]);
            console.log("Original image size:", photoData.length / 1024, "KB"); // Debugging
            // Compress if needed
            if (photoData.length / 1024 > 100) {
              // Reduced max size
              try {
                photoData = await compressImage(photoData, 100); // Reduced max size
                console.log(
                  "Compressed image size:",
                  photoData.length / 1024,
                  "KB"
                ); // Debugging
              } catch (compressionError) {
                console.error("Image compression failed:", compressionError);
                alert("Something went wrong. Please try it agin.");
              }
            }
            photos.push({ id: i, data: photoData });
          }
        }
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
            let newListing = {
              ownerPhone: loggedInUser.phone,
              ownerEmail: loggedInUser.email,
              ownerName: loggedInUser.name,
              name: document.getElementById("studio-name").value,
              address: document.getElementById("studio-address").value,
              area: document.getElementById("studio-area").value,
              type: document.getElementById("studio-type").value,
              capacity: document.getElementById("studio-capacity").value,
              parking: document.getElementById("studio-parking").checked,
              publicTransport: document.getElementById(
                "studio-public-transport"
              ).checked,
              available: document.getElementById("studio-available").checked,
              rentalTerm: document.getElementById("studio-rental-term").value,
              price: document.getElementById("studio-price").value,
              photo: photos,
            };
            fetch("https://studio-rental-platform.onrender.com/listing/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newListing),
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
                listingForm.reset();
                loadListings();
              })
              .catch((error) => {
                alert(error.message);
                console.error(error.message);
                return;
              });
          })
          .catch(async (error) => {
            console.error(error.message);
            await showTemporaryMessage(
              "Something went wrong. Please log in again."
            );
            window.location.href = "/";
            return;
          });
      });
  }

  let listing;
  let deletingPhotoIds = [];

  // Show the modal with full listing details
  window.showListingDetails = function (listingId) {
    console.log("Listing ID:", listingId); // Debugging: Check listingId
    console.log("Owner Listings:", ownerListings); // Debugging: Check ownerListings

    listing = ownerListings.find((object) => object.id === listingId);

    if (!listing) {
      console.error("Listing with ID", listingId, "not found.");
      return; // Exit the function if listing is undefined
    }

    document.getElementById("edit-studio-name").value = listing.name;
    document.getElementById("edit-studio-address").value = listing.address;
    document.getElementById("edit-studio-area").value = listing.area;
    document.getElementById("edit-studio-type").value = listing.type;
    document.getElementById("edit-studio-capacity").value = listing.capacity;
    document.getElementById("edit-studio-parking").checked = listing.parking;
    document.getElementById("edit-studio-public-transport").checked =
      listing.publicTransport;
    document.getElementById("edit-studio-available").checked =
      listing.available;
    document.getElementById("edit-studio-rental-term").value =
      listing.rentalTerm;
    document.getElementById("edit-studio-price").value = listing.price;

    const photoElement = document.getElementById("edit-studio-photo");
    photoElement.innerHTML = "";

    if (listing.photo && listing.photo.length > 0) {
      listing.photo.forEach((p) => {
        if (p && p.data) {
          let imgContainer = document.createElement("div");
          let imgElement = document.createElement("img");
          imgElement.setAttribute("src", p.data);
          imgElement.setAttribute("id", "img" + p.id);
          imgContainer.appendChild(imgElement);
          let garbageElement = document.createElement("img");
          garbageElement.setAttribute("src", "../images/garbage_bin.png");
          garbageElement.setAttribute("id", "bin" + p.id);
          garbageElement.setAttribute("class", "garbage-bin");
          imgContainer.appendChild(garbageElement);
          photoElement.appendChild(imgContainer);
        } else {
          console.warn(
            "Photo data is missing for a photo in listing",
            listingId
          );
        }
      });
    }
    listingModal.style.display = "flex";

    document.querySelectorAll(".garbage-bin").forEach((element) => {
      element.addEventListener("click", function (event) {
        let photoId = parseInt(event.target.id.substring(3));
        let imgElement = document.getElementById("img" + photoId);
        if (!deletingPhotoIds.includes(photoId)) {
          deletingPhotoIds.push(photoId);
          imgElement.style.filter = "brightness(50%)";
        } else {
          let id = deletingPhotoIds.indexOf(photoId);
          deletingPhotoIds = [
            ...deletingPhotoIds.slice(0, id),
            ...deletingPhotoIds.slice(id + 1),
          ];
          imgElement.style.filter = "brightness(100%)";
        }
      });
    });
  };

  // Get buttons
  const closeButtons = document.querySelectorAll(".close");

  // Function to close a modal
  function closeModal(modal) {
    if (modal) {
      modal.style.display = "none";
      console.log(`Closing Modal: ${modal.id}`);
    }
  }

  // Close All Modals on Close Button Click
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modalId = button.getAttribute("data-modal");
      closeModal(document.getElementById(modalId));
    });
  });

  // Close Modals on Click Outside
  window.addEventListener("click", function (event) {
    if (filterModal && event.target === filterModal) closeModal(filterModal);
    if (listingModal && event.target === listingModal) closeModal(listingModal);
    if (profileModal && event.target === profileModal) closeModal(profileModal);
  });

  // Set the form submission to update the existing listing
  if (document.getElementById("list-save-change-btn")) {
    document
      .getElementById("list-save-change-btn")
      .addEventListener("click", async function (event) {
        event.preventDefault();
        fetch(
          "https://studio-rental-platform.onrender.com/listing/delete-listing-photos",
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: listing.id,
              photoIds: deletingPhotoIds,
            }),
          }
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
            deletingPhotoIds = [];
            let photos = ownerListings.find(
              (object) => object.id === listing.id
            ).photo; // Ensure listing is found again
            let newlyUploadingPhotos = [];
            const editPhotoInput = document.getElementById(
              "upload-studio-photo"
            );
            let files = editPhotoInput.files;
            if (files.length !== 0) {
              for (let i = 0; i < files.length; i++) {
                if (i + photos.length === 4) {
                  break;
                }
                let photoData = await readFileAsync(files[i]);
                console.log(
                  "Original image size:",
                  photoData.length / 1024,
                  "KB"
                ); // Debugging
                // Compress if needed
                if (photoData.length / 1024 > 300) {
                  // Reduced max size
                  try {
                    photoData = await compressImage(photoData, 300); // Reduced max size
                    console.log(
                      "Compressed image size:",
                      photoData.length / 1024,
                      "KB"
                    ); // Debugging
                  } catch (compressionError) {
                    console.error(
                      "Image compression failed:",
                      compressionError
                    );
                    // Use original image if compression fails
                  }
                }
                newlyUploadingPhotos.push({ id: null, data: photoData });
              }
            }
            let updatedListing = {
              ownerPhone: listing.ownerPhone,
              ownerEmail: listing.ownerEmail,
              ownerName: listing.ownerName,
              name: document.getElementById("edit-studio-name").value,
              address: document.getElementById("edit-studio-address").value,
              area: document.getElementById("edit-studio-area").value,
              type: document.getElementById("edit-studio-type").value,
              capacity: document.getElementById("edit-studio-capacity").value,
              parking: document.getElementById("edit-studio-parking").checked,
              publicTransport: document.getElementById(
                "edit-studio-public-transport"
              ).checked,
              available: document.getElementById("edit-studio-available")
                .checked,
              rentalTerm: document.getElementById("edit-studio-rental-term")
                .value,
              price: document.getElementById("edit-studio-price").value,
              photo: newlyUploadingPhotos,
              id: listing.id,
            };
            fetch(
              "https://studio-rental-platform.onrender.com/listing/update-listing",
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedListing),
              }
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
                editListingForm.reset();
                listingModal.style.display = "none";
                loadListings();
              })
              .catch((error) => {
                console.error(error.message);
                alert("Something went wrong. Please try it again.");
                return;
              });
          })
          .catch((error) => {
            console.error(error.message);
            alert("Something went wrong. Please try it again.");
            return;
          });
      });
  }

  // Delete Listing
  window.deleteListing = function (id) {
    fetch(
      "https://studio-rental-platform.onrender.com/listing/delete-listing",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      }
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
        loadListings();
      })
      .catch((error) => {
        console.error(error.message);
        alert("Something went wrong. Please try it again.");
        return;
      });
  };

  // Profile Logic:
  if (loggedInUser) {
    document.getElementById("profile-info").innerHTML = `
    <div>
    <p><strong>Name:</strong> ${loggedInUser.name}</p>
    <p><strong>Email:</strong> ${loggedInUser.email}</p>
    <p><strong>Phone:</strong> ${loggedInUser.phone || "Not provided"}</p>
    </div>
    <img src="${
      loggedInUser.photo || "../images/user-profile-default-image.png"
    }" alt="Profile Photo">
    `;
  }

  // Show modal with current info
  if (editProfileButton) {
    editProfileButton.addEventListener("click", () => {
      if (!loggedInUser) return;
      document.getElementById("edit-name").value = loggedInUser.name || "";
      document.getElementById("edit-email").value = loggedInUser.email || "";
      document.getElementById("edit-phone").value = loggedInUser.phone || "";
      document.getElementById("edit-email").disabled = true;
      profileModal.style.display = "flex";
    });
  }

  // Close Profile Modal click outside
  window.addEventListener("click", function (event) {
    if (profileModal && event.target === profileModal) {
      profileModal.style.display = "none";
    }
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
