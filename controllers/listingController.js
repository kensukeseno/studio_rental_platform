const {
  createListing,
  findListingByName,
  findListingsByOwnerEmail,
  findAvailableListings,
  deleteListingById,
  deleteListingPhoto,
  updateAListing,
} = require("../models/Listing.js");

// Create a listing
async function addListing(listing) {
  try {
    // Check if the listing name is used
    let existingListing = await findListingByName(listing.name);
    // If the listing name is used, throw an error
    if (existingListing) {
      throw new Error("The lising name is used");
    }
    await createListing(listing);
  } catch (e) {
    throw e;
  }
}

// Find listings that begolong to the logged in owner
async function getListingsOfOwner(email) {
  try {
    // Return all listing of the owner
    return await findListingsByOwnerEmail(email);
  } catch (e) {
    throw e;
  }
}

// Find all available listings
async function getAvailableListings() {
  try {
    // Get owner
    return await findAvailableListings();
  } catch (e) {
    throw e;
  }
}

// Delete a listing
async function deleteListing(id) {
  try {
    await deleteListingById(id);
  } catch (e) {
    throw e;
  }
}

// Delete listing photos
async function deleteListingPhotos(listingId, photoIds) {
  try {
    for (let photoId of photoIds) {
      await deleteListingPhoto(listingId, photoId);
    }
  } catch (e) {
    throw e;
  }
}

// Update a listing
async function updateListing(listing) {
  try {
    await updateAListing(listing);
  } catch (e) {
    throw e;
  }
}

module.exports = {
  addListing,
  getListingsOfOwner,
  getAvailableListings,
  deleteListing,
  updateListing,
  deleteListingPhotos,
};
