import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getOrders, postOrder } from "../controllers/orderControllers.js";

const orderRoutes = express.Router();

orderRoutes.route("/").post(protect, postOrder);
orderRoutes.route("/").get(protect, getOrders);

export default orderRoutes;
