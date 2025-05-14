import User from "../models/User.js";
import Product from "../models/Product.js";

// TODO: FIX NUM_REVIEWS AND RATING CALCULATION
export const addReview = async (req, res) => {
  try {
    const { userId, review, productId } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      return res
        .status(404)
        .json({ message: !user ? "User not found" : "Product not found" });
    }

    const existingReview = product.reviews.find(
      (r) => r.user.toString() === userId,
    );

    if (existingReview) {
      // Edit existing review
      existingReview.rating = Number(review.rating);
      existingReview.comment = review.comment;
      existingReview.title = review.title;
    } else {
      // Add new review
      product.reviews.push({
        user: userId,
        name: user.name,
        rating: Number(review.rating),
        comment: review.comment,
        title: review.title,
      });
    }

    // Recalculate average rating
    product.num_reviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.num_reviews;

    await product.save();

    res.status(201).json({ message: "Review saved" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  // Implementation for deleting a review
};
