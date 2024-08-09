// favoriteRoutes.js
const express = require("express");
const router = express.Router();
const {
  addToFavorites,
  getUserFavorites,
  removeFromFavorites,
} = require("../controllers/favoriteController");

router.post("/add_fav", addToFavorites);
router.get("/get_fav/:id", getUserFavorites)
router.delete("/remove_fav/:id", removeFromFavorites)

module.exports = router;