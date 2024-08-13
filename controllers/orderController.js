const Orders = require("../model/orderModel");
 
const createOrderInfo = async (req, res) => {
  const { userId, items } = req.body;
  console.log(req.body);
 
  try {
    const newOrder = new Orders({
      userId,
      items,
    });
 
    
    await newOrder.save();
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
 
const getAllOrder = async (req, res) => {
  // const allOrder= await Orders.find();
 
  const orders = await Orders.find()
    .populate("userId")
    .populate({
      path: "items.productId", // Correct path to product details within items array
      model: "products",
      populate: {
        path: "category",
        model: "Category",
      },
    });
  return res.status(201).json({
    success: true,
    message: "Order fetched successfully",
    order: orders,
  });
};
 
const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
 
  console.log(req.body);
  console.log(req.params);
 
  try {
    const order = await Orders.findByIdAndUpdate(
      orderId,
      { $set: { status: status } },
      { new: true }
    );
 
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
 
    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
 
const getAllOrderByUserId = async (req, res) => {
  const { userId } = req.params;
  console.log(req.params);
 
  try {
    const orders = await Orders.find({ userId }).populate({
      path: "items.productId",
      populate: {
        path: "category",
        model: "Category",
      },
    });
 
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
 
module.exports = {
  createOrderInfo,
  getAllOrder,
  updateOrder,
  getAllOrderByUserId,
};