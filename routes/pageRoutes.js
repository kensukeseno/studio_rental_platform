// Import the express module
const express = require("express");
const path = require("path");
// Create an express router
const router = express.Router();

// GET route to the homepage, send 'index.html'
router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// GET route to the owner-dashboard, send 'owner-dashboard.html'
router.get("/owner-dashboard", function (req, res) {
  res.sendFile(path.join(__dirname, "../public", "pages/owner-dashboard.html"));
});

// GET route to the renter-dashboard, send 'renter-dashboard.html'
router.get("/renter-dashboard", function (req, res) {
  res.sendFile(
    path.join(__dirname, "../public", "pages/renter-dashboard.html")
  );
});

// Export our router
module.exports = router;
