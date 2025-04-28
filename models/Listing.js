const express = require("express");
const db = require("../firebase.js");

const app = express();
app.use(express.json());

// const path = require("path");
// const { readJasonFileReturnObject } = require("../utilities/readFile.js");
// const { overwriteData } = require("../utilities/writeFile.js");

// Add listing into the existing listing list
async function createListing(listing) {
  try {
    await db.collection("listings").add(listing);
  } catch (err) {
    throw err;
  }
}

// Find listing by name
async function findListingByName(name) {
  try {
    const listing = await db
      .collection("listings")
      .where("name", "==", name)
      .limit(1)
      .get();

    if (listing.empty) {
      return null;
    } else {
      return listing.docs[0].data();
    }
  } catch (err) {
    throw err;
  }
}

// Add loggedin user data into the logged user in file
async function findListingsByOwnerEmail(email) {
  try {
    const listings = await db
      .collection("listings")
      .where("ownerEmail", "==", email)
      .get();
    return listings.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    throw err;
  }
}

// Find all available listings
async function findAvailableListings() {
  try {
    const listings = await db
      .collection("listings")
      .where("available", "==", true)
      .get();
    return listings.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    throw err;
  }
}

// Delete a listing by id
async function deleteListingById(id) {
  try {
    await db.collection("listings").doc(id).delete();
  } catch (err) {
    throw err;
  }
}

// Delete a listing photo by id
async function deleteListingPhoto(listingId, photoId) {
  try {
    const docRef = db.collection("listings").doc(listingId);
    const doc = await docRef.get();

    const data = doc.data();
    const updatedPhotos = (data.photo || []).filter(
      (photo) => photo.id !== photoId
    );

    await docRef.update({ photo: updatedPhotos });
  } catch (err) {
    throw err;
  }
}

// Update a listing
async function updateAListing(listing) {
  try {
    // Get the current listing
    const upadatingListing = await db
      .collection("listings")
      .doc(listing.id)
      .get();
    // Assign Id to photos
    const currentPhotos = upadatingListing.data().photo;
    let maxId =
      currentPhotos.length === 0
        ? 0
        : currentPhotos[currentPhotos.length - 1].id;
    for (const photo of listing.photo) {
      photo.id = ++maxId;
      currentPhotos.push(photo);
    }
    listing.photo = currentPhotos;
    // Update the listing
    await db.collection("listings").doc(listing.id).set(listing);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createListing,
  findListingByName,
  findListingsByOwnerEmail,
  findAvailableListings,
  deleteListingById,
  deleteListingPhoto,
  updateAListing,
};
