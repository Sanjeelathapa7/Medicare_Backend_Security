const { default: mongoose } = require("mongoose");

const favoriteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    favItems: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "products",
          },
          quantity: {
            type: Number,
            required: true,
            default: 1,
          },
        },
      ],
  },
  {
    timestamps: true,
  }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);
module.exports = Favorite;