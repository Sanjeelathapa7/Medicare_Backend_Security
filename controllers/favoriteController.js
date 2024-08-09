const Favorite = require("../model/favoriteModel");
const User = require("../model/userModel");

const addToFavorites = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.json({
        success: false,
        message: "User ID and Product ID are required fields",
      });
    }

    let favorite = await Favorite.findOne({ user: userId });

    if (!favorite) {
      favorite = new Favorite({ user: userId, favItems: [] });
    }

    // Check if the product is already in the favorites
    const existingProduct = favorite.favItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingProduct !== -1) {
      // If the product is already in favorites, inform the user
      return res.json({
        success: false,
        message: "Product is already added to favorites",
      });
    }

    // If the product is not in favorites, add it
    favorite.favItems.push({ product: productId });

    await favorite.save();
    res.status(201).json({
      success: true,
      message: "Product added to favorites successfully",
      favorite,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add product to favorites" });
  }
};

const getUserFavorites = async (req, res) => {
  const userId = req.params.id;

  try {
    const favorite = await Favorite.findOne({ user: userId }).populate({
      path: "favItems.product",
      select: "productName productCategory productPrice productImageUrl",
    });

    if (!favorite) {
      return res.json({
        success: true,
        message: "User favorites is empty",
        favorite: [],
      });
    }

    res.json({
      success: true,
      message: "User favorites fetched successfully",
      favorite: favorite.favItems,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server error");
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const favItemId = req.params.id;
    const favorite = await Favorite.findOneAndUpdate(
      { "favItems._id": favItemId },
      { $pull: { favItems: { _id: favItemId } } },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Product not found in favorites",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from favorites successfully",
      favorite: favorite.favItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  addToFavorites,
  getUserFavorites,
  removeFromFavorites,
};