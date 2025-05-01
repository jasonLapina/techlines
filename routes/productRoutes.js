import express from "express";
import Product from "../models/Product.js";

const productRoutes = express.Router();

const getProducts = async (req, res) => {
  const products = await Product.find({});

  res.json({
    products: products,
  });
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json({
      product,
    });
  } else {
    res.status(404).json({
      message: "Product not found",
    });
  }
};

productRoutes.route("/").get(getProducts);
productRoutes.route("/:id").get(getProductById);

export default productRoutes;
