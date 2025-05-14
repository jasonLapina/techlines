import dotenv from "dotenv";
dotenv.config();

import connectToDb from "./database.js";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./middleware/passportConfig.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import reviewRoutes from "./routes/reviewRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

connectToDb();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
  }),
);

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  }),
);

// Initialize passport
app.use(passport.initialize());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
