const express = require("express");
const db = require("../firebase.js");

const app = express();
app.use(express.json());

// Add user data into the existing user list
async function createUser(user) {
  try {
    await db.collection("users").add(user);
  } catch (err) {
    throw err;
  }
}

// Add loggedin user data into the logged user in file
async function findUserByEmail(email) {
  try {
    const user = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (user.empty) {
      return null;
    } else {
      return user.docs[0].data();
    }
  } catch (err) {
    throw err;
  }
}

// Update user
async function updateUser(user) {
  try {
    // Get user
    const upadatingUser = await db
      .collection("users")
      .where("email", "==", user.email)
      .limit(1)
      .get();
    // Update the user info
    await upadatingUser.docs[0].ref.set(user);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  updateUser,
};
