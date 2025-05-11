import express from "express";
import passport from "passport";
import { protect } from "../middleware/authMiddleware.js";
import {
  loginUser,
  registerUser,
  verifyEmail,
  resetPasswordRequest,
  resetPasswordConfirm,
  getUserProfile,
  oAuthSuccessHandler,
  logoutUser
} from "../controllers/userControllers.js";

const userRoutes = express.Router();

// Routes
userRoutes.route("/login").post(loginUser);
userRoutes.route("/logout").get(logoutUser);

userRoutes.route("/register").post(registerUser);
userRoutes.route("/verify-email/:token").get(verifyEmail);
userRoutes.route("/reset-password-request").post(resetPasswordRequest);
userRoutes.route("/reset-password/:token").post(resetPasswordConfirm);
userRoutes.route("/profile").get(protect, getUserProfile);

// OAuth Routes
// Google
userRoutes
  .route("/auth/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));
userRoutes.route("/auth/google/callback").get(
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  oAuthSuccessHandler,
);

// Facebook
userRoutes
  .route("/auth/facebook")
  .get(passport.authenticate("facebook", { scope: ["email"] }));
userRoutes
  .route("/auth/facebook/callback")
  .get(
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    oAuthSuccessHandler,
  );

// GitHub
userRoutes
  .route("/auth/github")
  .get(passport.authenticate("github", { scope: ["user:email"] }));
userRoutes
  .route("/auth/github/callback")
  .get(
    passport.authenticate("github", { failureRedirect: "/login" }),
    oAuthSuccessHandler,
  );

export default userRoutes;
