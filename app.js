// import modules
const express = require("express");

const pageRoutes = require("./routes/pageRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const listingRoutes = require("./routes/listingRoutes.js");
const bodyParser = require("body-parser");

// Create an express app
const app = express();

// Middleware to serve static files in the 'public' folder
app.use(express.static("public"));

// Increase JSON body size limit to 10MB using body-parser
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Set the port
const PORT = 3000;

// Middleware to route any requests to '/user'
app.use("/user", userRoutes);

// Middleware to route any requests to '/listing'
app.use("/listing", listingRoutes);

// Middleware to route any requests to '/'
app.use("/", pageRoutes);

// Start the server
app.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is running and app is listening on port " + PORT);
  } else {
    console.log("ERROR: server cannot start.", error);
  }
});
