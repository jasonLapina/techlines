import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { postOrder } from "../controllers/orderControllers.js";

const orderRoutes = express.Router();

orderRoutes.route("/").post(protect, postOrder);

export default orderRoutes;
