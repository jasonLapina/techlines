import dotenv from "dotenv";
import connectToDb from "./database.js";
import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

connectToDb();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/products", productRoutes);

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
