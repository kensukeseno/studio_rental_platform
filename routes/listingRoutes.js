// Import the express module
const express = require("express");
// Create an express router
const router = express.Router();

const {
  addListing,
  getListingsOfOwner,
  getAvailableListings,
  deleteListing,
  updateListing,
  deleteListingPhotos,
} = require("../controllers/listingController");

/* Add a listing
    param: listing
*/
router.post("/", async function (req, res) {
  try {
    await addListing(req.body);
    res.status(200).send();
  } catch (e) {
    // Send the error message to the frontend
    res.status(500).json({ error: e.message });
  }
});

/* Get all listing of the logged-in user
    param: none
*/
router.get("/myListings", async function (req, res) {
  try {
    let listings = await getListingsOfOwner(req.query.email);
    res.status(200).json(listings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* Get all available listings
    param: none
*/
router.get("/listings", async function (req, res) {
  try {
    let listings = await getAvailableListings();
    res.status(200).json(listings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* Update listing
    Param: listing info (a list of photos only contains new photos)
*/
router.put("/update-listing", async function (req, res) {
  try {
    await updateListing(req.body);
    res.status(200).send();
  } catch (e) {
    // Send the error message to the frontend
    res.status(500).json({ error: e.message });
  }
});

/* Delete a listing
    param: id
*/
router.delete("/delete-listing", async function (req, res) {
  try {
    await deleteListing(req.body.id);
    res.status(200).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* Delete listing photos
    Param: listing id
    Param: id array of deleting photos
*/
router.delete("/delete-listing-photos", async function (req, res) {
  try {
    await deleteListingPhotos(req.body.id, req.body.photoIds);
    res.status(200).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Export our router
module.exports = router;
