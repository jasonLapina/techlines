import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendVerificationEmail from "../middleware/sendVerficationEmail.js";
import sendPasswordResetEmail from "../middleware/sendPasswordResetEmail.js";

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Login user
export const loginUser = async (req, res) => {
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

// Register user
export const registerUser = async (req, res) => {
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
        message:
          "Registration successful. Please check your email to verify your account.",
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
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

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Reset password request
export const resetPasswordRequest = async (req, res) => {
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

// Reset password confirm
export const resetPasswordConfirm = async (req, res) => {
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

    res.status(200).json({
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
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
export const oAuthSuccessHandler = (req, res) => {
  const token = generateToken(req.user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  res.redirect("http://localhost:3000");
};

// Logout user
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });
  res.sendStatus(200);
};