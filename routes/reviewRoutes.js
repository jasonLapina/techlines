import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addReview, deleteReview } from "../controllers/reviewControllers.js";

const reviewRoutes = express.Router();

reviewRoutes.route("/post").post(protect, addReview);

reviewRoutes.route("/post").delete(protect, deleteReview);

export default reviewRoutes;
