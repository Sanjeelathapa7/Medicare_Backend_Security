const { default: mongoose } = require("mongoose");

const cartSchema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users",
      },
      cartItems: [
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
   
  const Cart = mongoose.model("Cart", cartSchema);
  module.exports = Cart;