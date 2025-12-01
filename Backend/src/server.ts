const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Import controller
const movieController = require("./Controllers/MovieController");

// Routes
app.get("/movies", movieController.getAllMovies);

app.listen(3000, () => {
  console.log("Backend chạy tại http://localhost:3000");
});
