const {
  createUser,
  findUserByEmail,
  updateUser,
} = require("../models/User.js");

// login
async function login(email) {
  try {
    let user = await findUserByEmail(email);
    if (!user) {
      throw new Error("The user does not exitst");
    }
    // await createLoginUser(user);
    return user.role;
  } catch (e) {
    throw e;
  }
}

// signup
async function signup(user) {
  try {
    // Check if the email is already used
    let existingUser = await findUserByEmail(user.email);
    // if the email is already used, throw an error
    if (existingUser) {
      throw new Error("The email is used");
    }
    await createUser(user);
  } catch (e) {
    throw e;
  }
}

// logout
async function logout() {
  try {
    // Delete logged-in user info
    await deleteLoggedInUser();
  } catch (e) {
    throw e;
  }
}

// Update logged-in user info
async function updateProfile(user) {
  try {
    // Update user info
    await updateUser(user);
  } catch (e) {
    throw e;
  }
}

// Get logged-in user
async function getLoggedInUser(email) {
  try {
    // Check if the email is already used
    let loggedInUser = await findUserByEmail(email);
    // if the email is already used, throw an error
    if (!loggedInUser) {
      throw new Error("The user does not exist.");
    }
    return loggedInUser;
  } catch (e) {
    throw e;
  }
}

module.exports = { login, signup, logout, updateProfile, getLoggedInUser };
