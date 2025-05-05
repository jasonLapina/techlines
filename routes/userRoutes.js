import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import sendVerificationEmail from "../middleware/sendVerficationEmail.js";
import sendPasswordResetEmail from "../middleware/sendPasswordResetEmail.js";
import crypto from "crypto";

const userRoutes = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const isCorrectPassword = await user?.matchPassword(password);

    if (user && isCorrectPassword) {
      user.firstLogin = false;
      await user.save();

      const { _id, name, email, isAdmin, active, firstLogin, createdAt } = user;

      res.json({
        _id,
        name,
        email,
        isAdmin,
        token: generateToken(_id),
        active,
        firstLogin,
        createdAt,
        googleImage: user.googleImage,
        googleId: user.googleId,
      });
    } else {
      res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      isAdmin: false,
    });

    if (user) {
      // Send verification email
      await sendVerificationEmail(user);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        active: user.active,
        message: "Registration successful. Please check your email to verify your account.",
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// verify Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with the token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Activate the user
    user.active = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// reset password request
const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send password reset email
    await sendPasswordResetEmail(user);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// reset password confirm
const resetPasswordConfirm = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with the token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now login with your new password." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        active: user.active,
        firstLogin: user.firstLogin,
        createdAt: user.createdAt,
        googleImage: user.googleImage,
        googleId: user.googleId,
        facebookId: user.facebookId,
        githubId: user.githubId,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// OAuth success handler
const oAuthSuccessHandler = (req, res) => {
  const { _id, name, email, isAdmin, active, firstLogin, createdAt, googleImage } = req.user;

  res.json({
    _id,
    name,
    email,
    isAdmin,
    token: generateToken(_id),
    active,
    firstLogin,
    createdAt,
    googleImage,
  });
};

// Routes
userRoutes.route("/login").post(loginUser);
userRoutes.route("/register").post(registerUser);
userRoutes.route("/verify-email/:token").get(verifyEmail);
userRoutes.route("/reset-password-request").post(resetPasswordRequest);
userRoutes.route("/reset-password/:token").post(resetPasswordConfirm);
userRoutes.route("/profile").get(protect, getUserProfile);

// OAuth Routes
// Google
userRoutes.route("/auth/google").get(
  passport.authenticate("google", { scope: ["profile", "email"] })
);
userRoutes.route("/auth/google/callback").get(
  passport.authenticate("google", { failureRedirect: "/login" }),
  oAuthSuccessHandler
);

// Facebook
userRoutes.route("/auth/facebook").get(
  passport.authenticate("facebook", { scope: ["email"] })
);
userRoutes.route("/auth/facebook/callback").get(
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  oAuthSuccessHandler
);

// GitHub
userRoutes.route("/auth/github").get(
  passport.authenticate("github", { scope: ["user:email"] })
);
userRoutes.route("/auth/github/callback").get(
  passport.authenticate("github", { failureRedirect: "/login" }),
  oAuthSuccessHandler
);

export default userRoutes;
