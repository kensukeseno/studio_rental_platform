document.addEventListener("DOMContentLoaded", function () {
  console.log("JS Loaded: Modal & Filters Active");

  //  Get modals
  const filterModal = document.getElementById("filter-modal");
  const listingModal = document.getElementById("listing-modal");

  //  Get buttons
  const openFilterBtn = document.getElementById("open-filter");
  const closeButtons = document.querySelectorAll(".close");

  //  Function to open a modal
  function openModal(modal) {
    if (modal) {
      modal.style.display = "flex";
      console.log(`Opening Modal: ${modal.id}`);
    }
  }

  //  Function to close a modal
  function closeModal(modal) {
    if (modal) {
      modal.style.display = "none";
      console.log(`Closing Modal: ${modal.id}`);
    }
  }

  //  Open Apply Filter Modal
  if (openFilterBtn) {
    openFilterBtn.addEventListener("click", function (event) {
      event.preventDefault();
      openModal(filterModal);
    });
  }

  //  Close All Modals on Close Button Click
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modalId = button.getAttribute("data-modal");
      closeModal(document.getElementById(modalId));
    });
  });

  //  Close Modals on Click Outside
  window.addEventListener("click", function (event) {
    if (event.target === filterModal) closeModal(filterModal);
    if (event.target === listingModal) closeModal(listingModal);
  });

  //  Load and display studio listings
  const studioList = document.getElementById("studio-list");
  const listingDetails = document.getElementById("listing-details");
  let availableListings = [];
  fetch(`https://studio-rental-platform.onrender.com/listing/listings`)
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
      availableListings = jsonObject;
      loadListings();
    })
    .catch((error) => {
      window.location.href = "/";
      console.error(error.message);
      alert("Something went wrong. Please log in again.");
      return;
    });

  function loadListings(filteredListings = availableListings) {
    studioList.innerHTML = ""; // Clear existing listings
    filteredListings.forEach((listing) => {
      const topPhoto =
        listing.photo.length === 0
          ? "../images/room-default-image.png"
          : listing.photo[0].data;
      const listingElement = document.createElement("div");
      listingElement.classList.add("studio-card");
      listingElement.innerHTML = `
                <img src="${topPhoto}" alt="${listing.name}">
                <div class="studio-icons-container">
                    ${
                      listing.parking
                        ? `<div class="icon-item"><i class="fas fa-car"></i><span>P</span></div>`
                        : ""
                    }
                    <div class="icon-item"><i class="fas fa-users"></i><span>${
                      listing.capacity
                    }</span></div>
                    ${
                      listing.publicTransport
                        ? `<div class="icon-item"><i class="fas fa-bus"></i><span>Transit</span></div>`
                        : ""
                    }
                </div>
                <h4>${listing.name}</h4>
                <p class="studio-address">${listing.address}</p>
                <button class="inquire-btn" onclick="showListingDetails(${
                  listing.id
                })">Inquire</button>
            `;
      studioList.appendChild(listingElement);
    });
  }

  //  Filter Listings
  document
    .getElementById("apply-filter")
    .addEventListener("click", function (event) {
      event.preventDefault();

      // Capture filter values
      const minArea = parseInt(document.getElementById("area-min").value) || 0;
      const maxArea =
        parseInt(document.getElementById("area-max").value) || Infinity;
      const minCapacity =
        parseInt(document.getElementById("capacity-min").value) || 0;
      const maxCapacity =
        parseInt(document.getElementById("capacity-max").value) || Infinity;
      const studioType = document.getElementById("type").value.trim();
      const parking = document.getElementById("studio-parking").checked;
      const transport = document.getElementById(
        "studio-public-transport"
      ).checked;
      const rentalTerm = document.getElementById("studio-rental-term").value;
      const minPrice =
        parseFloat(document.getElementById("price-min").value) || 0;
      const maxPrice =
        parseFloat(document.getElementById("price-max").value) || Infinity;

      console.log({
        minArea,
        maxArea,
        minCapacity,
        maxCapacity,
        studioType,
        parking,
        transport,
        rentalTerm,
        minPrice,
        maxPrice,
      });

      // Apply filters
      filteredListings = availableListings.filter(
        (listing) => listing.area >= minArea && listing.area <= maxArea
      );
      filteredListings = filteredListings.filter(
        (listing) =>
          listing.capacity >= minCapacity && listing.capacity <= maxCapacity
      );

      //  Apply Studio Type Filter
      if (studioType) {
        console.log("Selected Type from Dropdown:", studioType); // Debugging user selection

        filteredListings = filteredListings.filter((listing) => {
          console.log("Listing Type from Data:", listing.type); // Debugging stored value

          let formattedType = listing.type.toLowerCase().trim();
          let selectedType = studioType.toLowerCase().replace(/\s+/g, "-");

          console.log(`Comparing: "${formattedType}" with "${selectedType}"`); // Check actual comparison

          return formattedType === selectedType;
        });

        console.log(
          "Filtered Listings After Studio Type Filter:",
          filteredListings
        );
      }

      if (parking) {
        filteredListings = filteredListings.filter(
          (listing) => listing.parking
        );
      }
      if (transport) {
        filteredListings = filteredListings.filter(
          (listing) => listing.publicTransport
        );
      }
      if (rentalTerm) {
        filteredListings = filteredListings.filter(
          (listing) => listing.rentalTerm === rentalTerm
        );
        filteredListings = filteredListings.filter(
          (listing) => listing.price >= minPrice && listing.price <= maxPrice
        );
      }

      console.log("Filtered Listings:", filteredListings);

      // Load filtered listings
      loadListings(filteredListings);
      closeModal(filterModal);
    });

  //  Enable/Disable Price Filter Fields Based on Rental Term Selection
  document
    .getElementById("studio-rental-term")
    .addEventListener("change", function () {
      const isDisabled = !this.value;
      document.getElementById("price-min").disabled = isDisabled;
      document.getElementById("price-max").disabled = isDisabled;
    });

  // Show Listing Modal
  window.showListingDetails = function (id) {
    let listing = availableListings.find((li) => li.id === id);
    const listingPhotoSection = document.createElement("div");

    if (!listing.photo || listing.photo.length === 0) {
      let imgElement = document.createElement("img");
      imgElement.setAttribute("src", "../images/room-default-image.png");
      listingPhotoSection.appendChild(imgElement);
    } else {
      listing.photo.forEach((p) => {
        let imgElement = document.createElement("img");
        imgElement.setAttribute("src", p.data);
        listingPhotoSection.appendChild(imgElement);
      });
    }

    listingDetails.innerHTML = `
        <h3>${listing.name}</h3>
        <p><strong>Owner's name:</strong> ${listing.ownerName}</p>
        <p><strong>Owner's phone:</strong> ${listing.ownerPhone}</p>
        <p><strong>Owner's email:</strong> ${listing.ownerEmail}</p>
        <p><strong>Address:</strong> ${listing.address}</p>
        <p><strong>Area:</strong> ${listing.area} m²</p>
        <p><strong>Type:</strong> ${listing.type}</p>
        <p><strong>Capacity:</strong> ${listing.capacity}</p>
        <p><strong>Parking:</strong> ${listing.parking ? "Yes" : "No"}</p>
        <p><strong>Public Transport:</strong> ${
          listing.publicTransport ? "Yes" : "No"
        }</p>
        <p><strong>Rental Term:</strong> ${listing.rentalTerm}</p>
        <p><strong>Price:</strong> $${listing.price} per term</p>
        <div id="listing-photo">${listingPhotoSection.innerHTML}</div>
    `;

    openModal(listingModal);
  };

  // Get search input field
  const searchInput = document.getElementById("search-input");

  function searchListings() {
    const searchTerm = searchInput.value.toLowerCase();

    // Filter listings by name or address
    const filteredListings = availableListings.filter((listing) => {
      const nameMatch = listing.name.toLowerCase().includes(searchTerm);
      const addressMatch = listing.address.toLowerCase().includes(searchTerm);
      return nameMatch || addressMatch;
    });

    loadListings(filteredListings);
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchListings();
    });
  }
});
