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

  //   save a new product to the db
};
