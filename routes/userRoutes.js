// Import the express module
const express = require("express");
// Create an express router
const router = express.Router();
const {
  login,
  signup,
  updateProfile,
  getLoggedInUser,
} = require("../controllers/userController");

/* Signup
    param: user
*/
router.post("/signup", async function (req, res) {
  try {
    await signup(req.body);
    res.status(200).send();
  } catch (e) {
    // Send the error with a 500 (Internal Server Error) status
    res.status(500).json({ error: e.message });
    return;
  }
});

/* login
    param: email
    return: role
*/
router.get("/login", async function (req, res) {
  try {
    let role = await login(req.query.email);
    res.status(200).json({ role: role });
  } catch (e) {
    // Send the error with a 500 (Internal Server Error) status
    res.status(500).json({ error: e.message });
    return;
  }
});

/* Get logged-in user info
    param: email
*/
router.get("/", async function (req, res) {
  try {
    let loggedInUser = await getLoggedInUser(req.query.email);
    res.status(200).json(loggedInUser);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* Update profile
    param: user
 */
router.put("/update-profile", async function (req, res) {
  try {
    await updateProfile(req.body);
    res.status(200).send();
  } catch (e) {
    // Send the error message to the frontend
    res.status(500).json({ error: e.message });
  }
});

// Export our router
module.exports = router;
