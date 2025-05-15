import Order from "../models/Order.js";

export const postOrder = async (req, res) => {
  const order = new Order(req.body);

  try {
    await order.save().then((result) => {
      res.status(200).json({ result, message: "Success" });
    });
  } catch (error) {
    res.status(400).json({ error, payload: req.body });
  }
};

export const getOrders = async (req, res) => {
  try {
    // get userID
    const userID = req.user._id;

    // get orders where user value is equal to userID
    const orders = await Order.find({ user: userID });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
